// routes/bankReconciliationRoute.js
// Usage: require('./routes/bankReconciliationRoute')(app, sql);
// Register AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerBankReconciliation(app, sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const r2 = (n) => Math.round(n * 100) / 100;

  const fmtDate = (v) => {
    if (!v) return '';
    if (!(v instanceof Date)) return String(v).slice(0, 10);
    const p = (n) => String(n).padStart(2, '0');
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  };

  // Dr/Cr totals of one ledger in a date range
  async function ledgerTotals(conn, isAD, glid, from, to) {
    const rows = await queryAsync(conn, `
      SELECT ISNULL(SUM(d.DrAmount), 0) AS dr, ISNULL(SUM(d.CrAmount), 0) AS cr
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
      WHERE d.GLID = ? AND ${d.dateBetween(isAD)}
    `, [glid, from, to]);
    return { dr: num(rows?.[0]?.dr), cr: num(rows?.[0]?.cr) };
  }

  async function buildReconciliation(conn, { bankBookName, fromDate, toDate, isAD, showSubLedger, excelLedgers = [] }) {
    // 1. Bank ledger
    const ledger = (await queryAsync(conn, `
      SELECT TOP 1 GLID, RTRIM(LTRIM(GLName)) AS GLName, GlAlias AS GlAlias
      FROM dbo.tbLedgerMaster
      WHERE RTRIM(LTRIM(GLName)) = ?
    `, [norm(bankBookName)]))[0];

    if (!ledger) return { notFound: true };

    // 2. Period starts after all DB data -> nothing to show (no Excel fallback)
    const maxDate = await d.latestJournalDate(conn, isAD);
    if (maxDate && fromDate > maxDate) {
      return { totalDr: 0, totalCr: 0, addRows: [], lessRows: [], meta: { noData: true } };
    }

    // 3. Opening: DB if it has journal rows in the previous fiscal year, otherwise Excel (optional)
    const range = d.openingRange(fromDate, isAD);
    const openingFromExcel = !(await d.hasJournal(conn, isAD, range.from, range.to));

    let opening = { dr: 0, cr: 0 };
    if (openingFromExcel) {
      const ex = excelLedgers.find((e) => key(e.particular) === key(ledger.GLName));
      if (ex) opening = { dr: num(ex.openingDebit), cr: num(ex.openingCredit) };
    } else {
      opening = await ledgerTotals(conn, isAD, ledger.GLID, range.from, range.to);
    }

    // 4. Period totals (independent of the cheque lists below)
    const period = await ledgerTotals(conn, isAD, ledger.GLID, fromDate, toDate);

    // 5. Cheque lines in the period
    const lines = await queryAsync(conn, `
      SELECT d.DetailID, d.SLID, d.DrAmount, d.CrAmount, d.ChequeNo, d.ChequeDate,
             m.JournalID, m.VoucherNo, m.JV_Date, m.JV_Miti
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
      WHERE d.GLID = ? AND ${d.dateBetween(isAD)}
      ORDER BY ${isAD ? 'm.JV_Date' : 'm.JV_Miti'}, m.JournalID, d.DetailID
    `, [ledger.GLID, fromDate, toDate]);

    // Optional subledger names for the row label
    const slNames = new Map();
    if (showSubLedger) {
      const sl = await queryAsync(conn, `
        SELECT SLID, RTRIM(LTRIM(SLName)) AS SLName
        FROM dbo.tbSubLedgerMaster
        WHERE GLID = ?
      `, [ledger.GLID]);
      sl.forEach((s) => slNames.set(s.SLID, s.SLName));
    }

    const addRows = [];   // credits: cheques issued
    const lessRows = [];  // debits: cheques deposited

    for (const r of lines) {
      const dr = num(r.DrAmount);
      const cr = num(r.CrAmount);

      const common = {
        journalId: r.JournalID,
        label: (showSubLedger && slNames.get(r.SLID)) || ledger.GLName,
        alias: norm(ledger.GlAlias),
        chequeNo: norm(r.ChequeNo),
        chequeDate: fmtDate(r.ChequeDate),
        voucherNo: norm(r.VoucherNo),
        voucherDate: isAD ? fmtDate(r.JV_Date) : norm(r.JV_Miti),
      };

      if (cr > 0) addRows.push({ ...common, amount: r2(cr) });
      if (dr > 0) lessRows.push({ ...common, amount: r2(dr) });
    }

    return {
      totalDr: r2(opening.dr + period.dr),
      totalCr: r2(opening.cr + period.cr),
      addRows,
      lessRows,
      meta: { openingFromExcel },
    };
  }

  // ---------- endpoint ----------
  app.post('/api/bankReconciliation', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { bankBookName, fromDate, toDate, showSubLedger, excelLedgers } = req.body ?? {};
    if (!norm(bankBookName) || !fromDate || !toDate) {
      return res.status(400).json({ error: 'bankBookName, fromDate and toDate are required.' });
    }

    try {
      const conn = req.session.conn;
      const isAD = await d.getDateMode(conn);

      fromDate = d.normDate(String(fromDate), isAD);
      toDate = d.normDate(String(toDate), isAD);

      const re = d.dateRegex(isAD);
      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }

      const result = await buildReconciliation(conn, {
        bankBookName, fromDate, toDate, isAD,
        showSubLedger: !!showSubLedger,
        excelLedgers: excelLedgers ?? [],
      });

      if (result.notFound) return res.status(404).json({ error: 'Bank Book not found.' });
      res.json(result);
    } catch (err) {
      console.error('❌ /api/bankReconciliation:', err);
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};