// routes/cashBankBookRoute.js
// Usage: require('./routes/cashBankBookRoute')(app, sql);

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerCashBankBook(app, sql) {
  const d = createJournalDates(sql);

  app.post('/api/cashBankBook', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { fromDate, toDate, ledgerName, docClassName } = req.body ?? {};
    ledgerName = String(ledgerName ?? '').trim();
    if (!fromDate || !toDate || !ledgerName) {
      return res.status(400).json({ error: 'fromDate, toDate and ledger are required.' });
    }

    try {
      const conn = req.session.conn;

      // ---- resolve ledger name -> GLID (Cash/Bank ledgers only) ----
      const lg = await d.queryAsync(conn, `
        SELECT TOP 1 GLID, RTRIM(LTRIM(GLName)) AS GLName
        FROM dbo.tbLedgerMaster
        WHERE RTRIM(LTRIM(GLName)) = ? AND Category IN ('B','C')`, [ledgerName]);
      if (!lg.length) {
        return res.status(400).json({ error: `Cash/Bank ledger "${ledgerName}" not found.` });
      }
      const glid = lg[0].GLID;

      // ---- resolve doc class name -> DocClassID (optional) ----
      let dcSql = '', dcParams = [];
      if (docClassName) {
        const c = await d.queryAsync(conn,
          `SELECT TOP 1 DocClassID FROM dbo.tbDocClassMaster WHERE DocClassName = ?`,
          [docClassName]);
        if (!c.length) {
          return res.status(400).json({ error: `Doc class "${docClassName}" not found.` });
        }
        dcSql = 'AND m.DocClassID = ?';
        dcParams = [c[0].DocClassID];
      }

      // ---- dates ----
      const isAD = await d.getDateMode(conn);
      fromDate = d.normDate(String(fromDate), isAD);
      toDate = d.normDate(String(toDate), isAD);

      const re = d.dateRegex(isAD);
      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }
      if (fromDate > toDate) {
        return res.status(400).json({ error: 'From date cannot be greater than To date.' });
      }

      const bounds = await d.getPeriodDateBounds(conn, isAD, fromDate, toDate);

      // ---- opening: same rule as groupTotals.openingDateCondition (not filtered) ----
      const openCond = isAD
        ? `(m.VoucherNo = 'OB1' OR m.JV_Date < CAST(? AS DATE)
            OR (m.JV_Date IS NULL AND m.JV_Miti IS NOT NULL AND m.JV_Miti < ?))`
        : `(m.VoucherNo = 'OB1' OR m.JV_Miti < ?
            OR (m.JV_Miti IS NULL AND m.JV_Date < CAST(? AS DATE)))`;
      const openParams = isAD
        ? [bounds.fromAD, bounds.fromMiti]
        : [bounds.fromMiti, bounds.fromAD];

      const o = await d.queryAsync(conn, `
        SELECT ISNULL(SUM(d.DrAmount),0) AS dr, ISNULL(SUM(d.CrAmount),0) AS cr
        FROM dbo.tbJournalMaster m
        JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        WHERE d.GLID = ? AND ${openCond}`, [glid, ...openParams]);
      const opening = d.num(o[0].dr) - d.num(o[0].cr);

      // ---- daily movements (date falls back to the other calendar when primary is NULL) ----
      const dateExpr = isAD
        ? `ISNULL(CONVERT(varchar(10), CAST(m.JV_Date AS DATE), 23), x.d)`
        : `ISNULL(m.JV_Miti, x.d)`;

      const apply = isAD
        ? `OUTER APPLY (SELECT TOP 1 CONVERT(varchar(10), M_date, 23) AS d
             FROM SAJILODB.dbo.tbLocalDate
             WHERE M_Miti = SUBSTRING(m.JV_Miti,9,2)+'/'+SUBSTRING(m.JV_Miti,6,2)+'/'+LEFT(m.JV_Miti,4)) x`
        : `OUTER APPLY (SELECT TOP 1 RIGHT(M_Miti,4)+'/'+SUBSTRING(M_Miti,4,2)+'/'+LEFT(M_Miti,2) AS d
             FROM SAJILODB.dbo.tbLocalDate
             WHERE M_date >= CAST(m.JV_Date AS DATE)
               AND M_date < DATEADD(DAY,1,CAST(m.JV_Date AS DATE))) x`;

      const rows = await d.queryAsync(conn, `
        SELECT ${dateExpr} AS dt,
               ISNULL(SUM(d.DrAmount),0) AS receipt,
               ISNULL(SUM(d.CrAmount),0) AS payment
        FROM dbo.tbJournalMaster m
        JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        ${apply}
        WHERE d.GLID = ?
          AND m.VoucherNo <> 'OB1'
          AND ${d.periodDateCondition(isAD)}
          ${dcSql}
        GROUP BY ${dateExpr}
        ORDER BY ${dateExpr}`,
        [glid, ...d.periodDateParams(isAD, bounds), ...dcParams]);

      // ---- running balance ----
      const fmtDate = (s) => {
        const p = String(s).split(/[-/]/);
        return `${p[2]}/${p[1]}/${p[0]}`;      // DD/MM/YYYY
      };

      let running = opening;
      const out = rows.map((r) => {
        const open = running;
        const receipt = d.num(r.receipt);
        const payment = d.num(r.payment);
        running = open + receipt - payment;
        return { date: fmtDate(r.dt), opening: open, receipt, payment, balance: running };
      });

      res.json({ ledger: lg[0].GLName, rows: out });
    } catch (err) {
      console.error('❌ /api/cashBankBook:', err);
      const msg = err.message?.startsWith('Invalid DateType') || err.message?.startsWith('Date mapping')
        ? err.message
        : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};