// routes/trialBalanceRoute.js
// Usage: require('./routes/trialBalanceRoute')(app, sql);
// Must be registered AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerTrialBalance(app, sql) {
  // Shared journal helpers
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

  // ---------- row builder ----------
  function makeRow(base, opening, period) {
    const net = opening.dr + period.dr - (opening.cr + period.cr);

    return {
      ...base,
      openingDebit: opening.dr,
      openingCredit: opening.cr,
      periodDebit: period.dr,
      periodCredit: period.cr,
      balanceDebit: Math.max(net, 0),
      balanceCredit: Math.max(-net, 0),
    };
  }

  const UNGROUPED = {
    groupName: 'Ungrouped',
    groupAlias: '',
    subGroup: 'Ungrouped',
    subGroupAlias: '',
  };

  // ---------- opening date condition ----------
  // Includes:
  // 1. All OB1 opening vouchers.
  // 2. All vouchers dated before the selected starting date.
  // 3. Alternate date only when the primary date is NULL.

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
             AND m.JV_Date IS NOT NULL
             AND m.JV_Date < CAST(? AS DATE)
           )
         )`;
  }

  function openingDateParams(isAD, bounds) {
    return isAD
      ? [bounds.fromAD, bounds.fromMiti]
      : [bounds.fromMiti, bounds.fromAD];
  }

  // ---------- cumulative opening totals ----------

  // Map<GLID, {dr, cr}>
  async function openingJournalTotals(conn, isAD, bounds) {
    const rows = await queryAsync(
      conn,
      `
        SELECT
          d.GLID,
          ISNULL(SUM(d.DrAmount), 0) AS dr,
          ISNULL(SUM(d.CrAmount), 0) AS cr
        FROM dbo.tbJournalMaster m
        INNER JOIN dbo.tbJournalDetails d
          ON d.JournalID = m.JournalID
        WHERE ${openingDateCondition(isAD)}
        GROUP BY d.GLID
      `,
      openingDateParams(isAD, bounds)
    );

    return new Map(
      rows.map((r) => [
        r.GLID,
        { dr: num(r.dr), cr: num(r.cr) },
      ])
    );
  }

  // Map<"GLID:SLID", {dr, cr}>
  async function openingSubledgerTotals(conn, isAD, bounds) {
    const rows = await queryAsync(
      conn,
      `
        SELECT
          d.GLID,
          d.SLID,
          ISNULL(SUM(d.DrAmount), 0) AS dr,
          ISNULL(SUM(d.CrAmount), 0) AS cr
        FROM dbo.tbJournalMaster m
        INNER JOIN dbo.tbJournalDetails d
          ON d.JournalID = m.JournalID
        WHERE ${openingDateCondition(isAD)}
          AND d.SLID IS NOT NULL
          AND d.SLID <> 0
        GROUP BY d.GLID, d.SLID
      `,
      openingDateParams(isAD, bounds)
    );

    return new Map(
      rows.map((r) => [
        `${r.GLID}:${r.SLID}`,
        { dr: num(r.dr), cr: num(r.cr) },
      ])
    );
  }

  // ---------- core ----------
  async function buildTrialBalance(conn, {
    fromDate,
    toDate,
    isAD,
    excelLedgers = [],
    excelSubledgers = [],
  }) {

    // 1. Requested period is after all DB data -> nothing to show.
    const maxDate = await d.latestJournalDate(conn, isAD);

    if (maxDate && fromDate > maxDate) {
      return { rows: [], meta: { noData: true } };
    }

    // 2. Get AD and LD representations of the selected period.
    // Reuse these bounds for opening and period calculations.
    const dateBounds = await d.getPeriodDateBounds(
      conn,
      isAD,
      fromDate,
      toDate
    );

    // 3. Calculate cumulative opening balances from all previous history.
    const dbOpening = await openingJournalTotals(
      conn,
      isAD,
      dateBounds
    );

    const dbOpeningSub = await openingSubledgerTotals(
      conn,
      isAD,
      dateBounds
    );

    // 4. Calculate selected-period movements.
    const dbPeriod = await d.journalTotals(
      conn,
      isAD,
      fromDate,
      toDate,
      dateBounds
    );

    // 5. Ledgers + group hierarchy.
    const ledgers = await queryAsync(conn, `
      SELECT
        l.GLID,
        RTRIM(LTRIM(l.GLName)) AS GLName,
        l.GlAlias,
        sg.SubGrpName,
        sg.SubGrpAlias,
        g.GrpName,
        g.GrpAlias
      FROM dbo.tbLedgerMaster l
      LEFT JOIN dbo.tbLedgerSubGroup sg
        ON sg.LgrSubGrpID = l.LgrSubGrpID
      LEFT JOIN dbo.tbLedgerGroup g
        ON g.LgrGrpID = sg.LgrGrpID
    `);

    const excelByName = new Map(
      excelLedgers.map((e) => [key(e.particular), e])
    );

    const excelOpening = (e) =>
      e
        ? {
            dr: num(e.openingDebit),
            cr: num(e.openingCredit),
          }
        : ZERO;

    const usedExcel = new Set();

    let anyOpeningFromExcel = false;

    // 6. Build ledger rows.
    const rows = ledgers.map((l) => {
      const k = key(l.GLName);
      const ex = excelByName.get(k);

      if (ex) usedExcel.add(k);

      // Each ledger independently selects its opening source.
      const ledgerOpeningFromExcel = !dbOpening.has(l.GLID);

      if (ledgerOpeningFromExcel) {
        anyOpeningFromExcel = true;
      }

      const opening = ledgerOpeningFromExcel
        ? excelOpening(ex)
        : dbOpening.get(l.GLID);

      const period = dbPeriod.get(l.GLID) ?? ZERO;

      return makeRow(
        {
          glid: l.GLID,
          particular: l.GLName,
          alias: norm(l.GlAlias) || norm(ex?.alias),
          groupName: l.GrpName || 'Ungrouped',
          groupAlias: l.GrpAlias || '',
          subGroup: l.SubGrpName || 'Ungrouped',
          subGroupAlias: l.SubGrpAlias || '',
          subledgers: [],
        },
        opening,
        period
      );
    });

    // 7. Excel-only ledgers (not present in tbLedgerMaster).
    // Their opening balance necessarily comes from Excel.
    for (const [k, ex] of excelByName) {
      if (!k || usedExcel.has(k)) continue;

      anyOpeningFromExcel = true;

      rows.push(
        makeRow(
          {
            glid: null,
            particular: norm(ex.particular),
            alias: norm(ex.alias),
            ...UNGROUPED,
            subledgers: [],
          },
          excelOpening(ex),
          ZERO
        )
      );
    }

    // 8. Subledger opening balances.
    // Use DB opening if the parent ledger has DB history.
    // Otherwise use the Excel opening balance.
    let skippedSubledgers = 0;

    if (excelSubledgers.length) {
      const slRows = await queryAsync(
        conn,
        `
          SELECT
            SLID,
            GLID,
            RTRIM(LTRIM(SlAlias)) AS alias
          FROM dbo.tbSubLedgerMaster
        `
      );

      const subledgerByAlias = new Map(
        slRows.map((r) => [
          key(r.alias),
          { GLID: r.GLID, SLID: r.SLID },
        ])
      );

      const rowsByGlid = new Map(
        rows
          .filter((r) => r.glid != null)
          .map((r) => [r.glid, r])
      );

      const seen = new Set();

      for (const s of excelSubledgers) {
        const alias = key(s.alias);

        const subledger = subledgerByAlias.get(alias);
        const parent = subledger
          ? rowsByGlid.get(subledger.GLID)
          : null;

        if (!alias || !subledger || !parent) {
          skippedSubledgers++;
          continue;
        }

        if (seen.has(alias)) continue;
        seen.add(alias);

        // Follow the opening source selected for the parent ledger.
        const parentOpeningFromExcel = !dbOpening.has(
          subledger.GLID
        );

        const opening = parentOpeningFromExcel
          ? excelOpening(s)
          : dbOpeningSub.get(
              `${subledger.GLID}:${subledger.SLID}`
            ) ?? ZERO;

        parent.subledgers.push(
          makeRow(
            {
              particular: norm(s.particular),
              alias: norm(s.alias),
            },
            opening,
            ZERO
          )
        );
      }
    }

    return {
      rows,
      meta: {
        openingFromExcel: anyOpeningFromExcel,
        skippedSubledgers,
      },
    };
  }

  // ---------- endpoint ----------
  app.post('/api/trialBalance', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({
        error: 'Not connected to a database session.',
      });
    }

    let {
      fromDate,
      toDate,
      excelLedgers,
      excelSubledgers,
    } = req.body ?? {};

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: 'fromDate and toDate are required.',
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

      const result = await buildTrialBalance(conn, {
        fromDate,
        toDate,
        isAD,
        excelLedgers: excelLedgers ?? [],
        excelSubledgers: excelSubledgers ?? [],
      });

      res.json(result);

    } catch (err) {
      console.error('❌ /api/trialBalance:', err);

      const msg =
        err.message?.startsWith('Invalid DateType') ||
        err.message?.startsWith('Date mapping not found')
          ? err.message
          : 'Internal server error.';

      res.status(500).json({ error: msg });
    }
  });
};