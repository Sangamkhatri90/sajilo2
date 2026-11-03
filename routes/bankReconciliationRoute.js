
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

  // Convert YYYY/MM/DD to DD/MM/YYYY for tbLocalDate.M_Miti
  const mitiToTableFormat = (miti) => {
    const [year, month, day] = String(miti).split('/');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to YYYY/MM/DD for journal dates
  const tableFormatToMiti = (miti) => {
    const [day, month, year] = String(miti).split('/');
    return `${year}/${month}/${day}`;
  };

  // Get corresponding AD date for a Nepali date.
  async function getADDateFromMiti(conn, miti) {
    const tableMiti = mitiToTableFormat(miti);

    const rows = await queryAsync(conn, `
      SELECT TOP 1 CONVERT(varchar(10), M_date, 23) AS ADDate
      FROM SAJILODB.dbo.tbLocalDate
      WHERE M_Miti = ?
    `, [tableMiti]);

    if (!rows?.[0]?.ADDate) {
      throw new Error(`Cannot find AD date mapping for Miti ${miti}`);
    }

    return rows[0].ADDate;
  }

  // Get corresponding Nepali date for an AD date.
  async function getMitiFromAD(conn, adDate) {
    const rows = await queryAsync(conn, `
      SELECT TOP 1 M_Miti
      FROM SAJILODB.dbo.tbLocalDate
      WHERE M_date >= CAST(? AS DATE)
        AND M_date < DATEADD(DAY, 1, CAST(? AS DATE))
    `, [adDate, adDate]);

    if (!rows?.[0]?.M_Miti) {
      throw new Error(`Cannot find Miti mapping for AD date ${adDate}`);
    }

    return tableFormatToMiti(rows[0].M_Miti);
  }

  // Build both date representations for the selected period.
  async function getDateBounds(conn, isAD, fromDate, toDate) {
    if (isAD) {
      return {
        fromAD: fromDate,
        toAD: toDate,
        fromMiti: await getMitiFromAD(conn, fromDate),
        toMiti: await getMitiFromAD(conn, toDate),
      };
    }

    return {
      fromAD: await getADDateFromMiti(conn, fromDate),
      toAD: await getADDateFromMiti(conn, toDate),
      fromMiti: fromDate,
      toMiti: toDate,
    };
  }

  // Date condition for a selected period.
  // If the primary date is NULL, use the alternate date.
  function periodDateCondition(isAD) {
    return isAD
      ? `(
          (m.JV_Date >= CAST(? AS DATE)
           AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE)))
          OR
          (m.JV_Date IS NULL
           AND m.JV_Miti >= ?
           AND m.JV_Miti <= ?)
        )`
      : `(
          (m.JV_Miti >= ? AND m.JV_Miti <= ?)
          OR
          (m.JV_Miti IS NULL
           AND m.JV_Date >= CAST(? AS DATE)
           AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE)))
        )`;
  }

  function periodDateParams(isAD, bounds) {
    return isAD
      ? [bounds.fromAD, bounds.toAD, bounds.fromMiti, bounds.toMiti]
      : [bounds.fromMiti, bounds.toMiti, bounds.fromAD, bounds.toAD];
  }

  // Dr/Cr totals for one ledger in the selected period.
  async function ledgerTotals(conn, isAD, glid, bounds) {
    const rows = await queryAsync(conn, `
      SELECT
        ISNULL(SUM(d.DrAmount), 0) AS dr,
        ISNULL(SUM(d.CrAmount), 0) AS cr
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE d.GLID = ?
        AND ${periodDateCondition(isAD)}
    `, [glid, ...periodDateParams(isAD, bounds)]);

    return {
      dr: num(rows?.[0]?.dr),
      cr: num(rows?.[0]?.cr),
    };
  }

  // Opening balance: all historical movements before the selected date,
  // plus OB1 opening entries which have neither JV_Miti nor JV_Date.
  function openingDateCondition(isAD) {
    return isAD
      ? `(
          m.VoucherNo = 'OB1'
          OR m.JV_Date < CAST(? AS DATE)
          OR (
            m.JV_Date IS NULL
            AND m.JV_Miti IS NOT NULL
            AND m.JV_Miti < ?
          )
        )`
      : `(
          m.VoucherNo = 'OB1'
          OR m.JV_Miti < ?
          OR (
            m.JV_Miti IS NULL
            AND m.JV_Date < CAST(? AS DATE)
          )
        )`;
  }

  function openingDateParams(isAD, bounds) {
    return isAD
      ? [bounds.fromAD, bounds.fromMiti]
      : [bounds.fromMiti, bounds.fromAD];
  }

  // Check whether this particular ledger has historical DB opening data.
  async function hasOpeningHistory(conn, isAD, glid, bounds) {
    const rows = await queryAsync(conn, `
      SELECT TOP 1 1 AS x
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE d.GLID = ?
        AND ${openingDateCondition(isAD)}
    `, [glid, ...openingDateParams(isAD, bounds)]);

    return rows.length > 0;
  }

  // Calculate cumulative opening balance from database history.
  async function openingTotals(conn, isAD, glid, bounds) {
    const rows = await queryAsync(conn, `
      SELECT
        ISNULL(SUM(d.DrAmount), 0) AS dr,
        ISNULL(SUM(d.CrAmount), 0) AS cr
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE d.GLID = ?
        AND ${openingDateCondition(isAD)}
    `, [glid, ...openingDateParams(isAD, bounds)]);

    return {
      dr: num(rows?.[0]?.dr),
      cr: num(rows?.[0]?.cr),
    };
  }

  async function buildReconciliation(conn, {
    bankBookName,
    fromDate,
    toDate,
    isAD,
    showSubLedger,
    excelLedgers = [],
  }) {
    // 1. Bank ledger
    const ledger = (await queryAsync(conn, `
      SELECT TOP 1
        GLID,
        RTRIM(LTRIM(GLName)) AS GLName,
        GlAlias AS GlAlias
      FROM dbo.tbLedgerMaster
      WHERE RTRIM(LTRIM(GLName)) = ?
    `, [norm(bankBookName)]))[0];

    if (!ledger) return { notFound: true };

    // 2. Get both AD and Miti representations of the period.
    const bounds = await getDateBounds(conn, isAD, fromDate, toDate);

    // 3. Opening balance: cumulative DB history or Excel fallback.
    const hasHistory = await hasOpeningHistory(
      conn, isAD, ledger.GLID, bounds
    );

    const openingFromExcel = !hasHistory;

    let opening = { dr: 0, cr: 0 };

    if (openingFromExcel) {
      const ex = excelLedgers.find(
        (e) => key(e.particular) === key(ledger.GLName)
      );

      if (ex) {
        opening = {
          dr: num(ex.openingDebit),
          cr: num(ex.openingCredit),
        };
      }
    } else {
      opening = await openingTotals(
        conn, isAD, ledger.GLID, bounds
      );
    }

    // 4. Selected period totals.
    const period = await ledgerTotals(
      conn, isAD, ledger.GLID, bounds
    );

    // 5. Cheque lines use exactly the same date condition as period totals.
    const lines = await queryAsync(conn, `
      SELECT
        d.DetailID,
        d.SLID,
        d.DrAmount,
        d.CrAmount,
        d.ChequeNo,
        d.ChequeDate,
        m.JournalID,
        m.VoucherNo,
        m.JV_Date,
        m.JV_Miti
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE d.GLID = ?
        AND ${periodDateCondition(isAD)}
      ORDER BY
        COALESCE(m.JV_Date, '19000101'),
        m.JV_Miti,
        m.JournalID,
        d.DetailID
    `, [ledger.GLID, ...periodDateParams(isAD, bounds)]);

    // 6. Optional subledger names.
    const slNames = new Map();

    if (showSubLedger) {
      const sl = await queryAsync(conn, `
        SELECT
          SLID,
          RTRIM(LTRIM(SLName)) AS SLName
        FROM dbo.tbSubLedgerMaster
        WHERE GLID = ?
      `, [ledger.GLID]);

      sl.forEach((s) => slNames.set(s.SLID, s.SLName));
    }

    const addRows = [];
    const lessRows = [];

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
        voucherDate: r.JV_Date
          ? fmtDate(r.JV_Date)
          : norm(r.JV_Miti),
      };

      if (cr > 0) {
        addRows.push({ ...common, amount: r2(cr) });
      }

      if (dr > 0) {
        lessRows.push({ ...common, amount: r2(dr) });
      }
    }

    return {
      totalDr: r2(opening.dr + period.dr),
      totalCr: r2(opening.cr + period.cr),
      addRows,
      lessRows,
      meta: {
        openingFromExcel,
      },
    };
  }

  // ---------- endpoint ----------
  app.post('/api/bankReconciliation', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({
        error: 'Not connected to a database session.',
      });
    }

    let {
      bankBookName,
      fromDate,
      toDate,
      showSubLedger,
      excelLedgers,
    } = req.body ?? {};

    if (!norm(bankBookName) || !fromDate || !toDate) {
      return res.status(400).json({
        error: 'bankBookName, fromDate and toDate are required.',
      });
    }

    try {
      const conn = req.session.conn;
      const isAD = await d.getDateMode(conn);

      fromDate = d.normDate(String(fromDate), isAD);
      toDate = d.normDate(String(toDate), isAD);

      const re = d.dateRegex(isAD);

      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({
          error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.`,
        });
      }

      const result = await buildReconciliation(conn, {
        bankBookName,
        fromDate,
        toDate,
        isAD,
        showSubLedger: !!showSubLedger,
        excelLedgers: excelLedgers ?? [],
      });

      if (result.notFound) {
        return res.status(404).json({
          error: 'Bank Book not found.',
        });
      }

      res.json(result);
    } catch (err) {
      console.error('❌ /api/bankReconciliation:', err);

      const msg = err.message?.startsWith('Invalid DateType')
        ? err.message
        : 'Internal server error.';

      res.status(500).json({ error: msg });
    }
  });
};
