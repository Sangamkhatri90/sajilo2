
// routes/groupSummaryRoute.js
// Usage: require('./routes/groupSummaryRoute')(app, sql);
// Register AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerGroupSummary(app, sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

  const net = (open, period) =>
    (open.dr - open.cr) + (period.dr - period.cr);

  const idSet = (arr) =>
    (Array.isArray(arr) && arr.length
      ? new Set(arr.map(String))
      : null);

  const excelOpening = (e) =>
    (e
      ? {
          dr: num(e.openingDebit),
          cr: num(e.openingCredit)
        }
      : ZERO);

  const mapBy = (list, field) =>
    new Map(
      list
        .filter((e) => key(e[field]))
        .map((e) => [key(e[field]), e])
    );

  // --------------------------------------------------
  // DATE CONVERSION HELPERS
  // --------------------------------------------------

  // Convert YYYY/MM/DD to DD/MM/YYYY for tbLocalDate.M_Miti
  const mitiToTableFormat = (miti) => {
    const [year, month, day] = String(miti).split('/');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to YYYY/MM/DD
  const tableFormatToMiti = (miti) => {
    const [day, month, year] = String(miti).split('/');
    return `${year}/${month}/${day}`;
  };

  // Get corresponding AD date from Nepali date.
  async function getADDateFromMiti(conn, miti) {
    const tableMiti = mitiToTableFormat(miti);

    const rows = await queryAsync(conn, `
      SELECT TOP 1
        CONVERT(varchar(10), M_date, 23) AS ADDate
      FROM SAJILODB.dbo.tbLocalDate
      WHERE M_Miti = ?
    `, [tableMiti]);

    if (!rows?.[0]?.ADDate) {
      throw new Error(
        `Cannot find AD date mapping for Miti ${miti}`
      );
    }

    return rows[0].ADDate;
  }

  // Get corresponding Nepali date from AD date.
  async function getMitiFromAD(conn, adDate) {
    const rows = await queryAsync(conn, `
      SELECT TOP 1 M_Miti
      FROM SAJILODB.dbo.tbLocalDate
      WHERE M_date >= CAST(? AS DATE)
        AND M_date < DATEADD(DAY, 1, CAST(? AS DATE))
    `, [adDate, adDate]);

    if (!rows?.[0]?.M_Miti) {
      throw new Error(
        `Cannot find Miti mapping for AD date ${adDate}`
      );
    }

    return tableFormatToMiti(rows[0].M_Miti);
  }

  // Build both AD and LD representations of the report start date.
  async function getOpeningBounds(conn, isAD, fromDate) {
    if (isAD) {
      return {
        fromAD: fromDate,
        fromMiti: await getMitiFromAD(conn, fromDate)
      };
    }

    return {
      fromAD: await getADDateFromMiti(conn, fromDate),
      fromMiti: fromDate
    };
  }

  // --------------------------------------------------
  // CUMULATIVE OPENING BALANCE HELPERS
  // Same opening logic as Bank Reconciliation.
  // --------------------------------------------------

  // Includes all historical transactions before the
  // selected date and all OB1 opening entries.
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

  // Cumulative opening totals grouped by GLID.
  async function openingJournalTotals(conn, isAD, bounds) {
    const rows = await queryAsync(conn, `
      SELECT
        d.GLID,
        ISNULL(SUM(d.DrAmount), 0) AS dr,
        ISNULL(SUM(d.CrAmount), 0) AS cr
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE ${openingDateCondition(isAD)}
      GROUP BY d.GLID
    `, openingDateParams(isAD, bounds));

    return new Map(
      rows.map((r) => [
        r.GLID,
        {
          dr: num(r.dr),
          cr: num(r.cr)
        }
      ])
    );
  }

  // Cumulative opening totals grouped by GLID + SLID.
  async function openingSubledgerTotals(conn, isAD, bounds) {
    const rows = await queryAsync(conn, `
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
    `, openingDateParams(isAD, bounds));

    return new Map(
      rows.map((r) => [
        `${r.GLID}:${r.SLID}`,
        {
          dr: num(r.dr),
          cr: num(r.cr)
        }
      ])
    );
  }

  // --------------------------------------------------
  // BUILD GROUP SUMMARY
  // --------------------------------------------------

  async function buildSummary(conn, {
    fromDate,
    toDate,
    isAD,
    includeOpening,
    subledger,
    subGroupIds,
    ledgerIds,
    excelLedgers = [],
    excelSubledgers = [],
  }) {

    // 1. Period starts after all DB data -> nothing to show.
    const maxDate = await d.latestJournalDate(conn, isAD);

    if (maxDate && fromDate > maxDate) {
      return {
        rows: [],
        meta: { noData: true }
      };
    }

    // 2. Opening: cumulative DB history per GLID,
    // otherwise Excel fallback per ledger.
    let dbOpening = new Map();
    let dbOpeningSub = new Map();

    if (includeOpening) {
      const openingBounds = await getOpeningBounds(
        conn,
        isAD,
        fromDate
      );

      dbOpening = await openingJournalTotals(
        conn,
        isAD,
        openingBounds
      );

      if (subledger) {
        dbOpeningSub = await openingSubledgerTotals(
          conn,
          isAD,
          openingBounds
        );
      }
    }

    // 3. Period totals (one grouped query each).
    const dbPeriod = await d.journalTotals(
      conn,
      isAD,
      fromDate,
      toDate
    );

    const dbPeriodSub = subledger
      ? await d.subledgerTotals(
          conn,
          isAD,
          fromDate,
          toDate
        )
      : new Map();

    // 4. Ledgers + hierarchy in one query,
    // filtered by the selection.
    const wantLedgers = idSet(ledgerIds);
    const wantSubGroups = idSet(subGroupIds);

    const ledgers = (await queryAsync(conn, `
      SELECT
    l.GLID,
    RTRIM(LTRIM(l.GLName)) AS GLName,
    l.GlAlias AS GlAlias,
    sg.LgrSubGrpID AS SubGrpID,
    sg.SubGrpName,
    sg.SubGrpAlias,
    g.LgrGrpID AS GrpID,
    g.GrpName,
    g.GrpAlias
FROM dbo.tbLedgerMaster l
LEFT JOIN dbo.tbLedgerSubGroup sg
    ON sg.LgrSubGrpID = l.LgrSubGrpID
LEFT JOIN dbo.tbLedgerGroup g
    ON g.LgrGrpID = l.LgrGrpID
ORDER BY
    g.LgrGrpID,
    sg.LgrSubGrpID,
    l.GLID
    `)).filter((l) =>
      wantLedgers
        ? wantLedgers.has(String(l.GLID))
        : wantSubGroups
          ? wantSubGroups.has(String(l.SubGrpID))
          : true
    );

    const excelLedgerByName = mapBy(
      excelLedgers,
      'particular'
    );

    let anyOpeningFromExcel = false;

    const rows = ledgers.map((l) => {

      // 5. Decide opening source separately for each ledger.
      const ledgerOpeningFromExcel =
        includeOpening && !dbOpening.has(l.GLID);

      if (ledgerOpeningFromExcel) {
        anyOpeningFromExcel = true;
      }

      const open = !includeOpening
        ? ZERO
        : ledgerOpeningFromExcel
          ? excelOpening(
              excelLedgerByName.get(key(l.GLName))
            )
          : dbOpening.get(l.GLID) ?? ZERO;

      const period = dbPeriod.get(l.GLID) ?? ZERO;

      const amount = net(open, period);

      



      return {
        glid: l.GLID,
        grpId: l.GrpID ?? null,
        grpName: l.GrpName || 'Ungrouped',
        grpAlias: l.GrpAlias || '',
        subGrpId: l.SubGrpID ?? null,
        subGrpName: l.SubGrpName || 'Ungrouped',
        subGrpAlias: l.SubGrpAlias || '',
        ledgerName: l.GLName,
        ledgerAlias: norm(l.GlAlias),
        amount,
        subLedgers: [],
      };
    });

    // 6. Subledgers: a breakdown of their ledger,
    // not added on top of it.
    if (subledger) {
      const rowsByGlid = new Map(
        rows.map((r) => [r.glid, r])
      );

      const excelSubByAlias = mapBy(
        excelSubledgers,
        'alias'
      );

      const excelSubByName = mapBy(
        excelSubledgers,
        'particular'
      );

      const slMaster = await queryAsync(conn, `
        SELECT
          SLID,
          GLID,
          RTRIM(LTRIM(SLName)) AS SLName,
          RTRIM(LTRIM(SlAlias)) AS SLAlias
        FROM dbo.tbSubLedgerMaster
      `);

      for (const s of slMaster) {
        const parent = rowsByGlid.get(s.GLID);

        if (!parent) continue;

        const k = `${s.GLID}:${s.SLID}`;

        const period = dbPeriodSub.get(k) ?? ZERO;

        let open = ZERO;

        if (includeOpening) {

          // Use the same opening source as the parent ledger.
          const parentOpeningFromExcel =
            !dbOpening.has(s.GLID);

          open = parentOpeningFromExcel
            ? excelOpening(
                excelSubByAlias.get(key(s.SLAlias)) ??
                excelSubByName.get(key(s.SLName))
              )
            : dbOpeningSub.get(k) ?? ZERO;
        }

        // Skip subledgers with no movement and no opening.
        if (
          !period.dr &&
          !period.cr &&
          !open.dr &&
          !open.cr
        ) {
          continue;
        }

        const amount = net(open, period);
        

        parent.subLedgers.push({
          name: s.SLName,
          alias: norm(s.SLAlias),
          amount,
        });
      }
    }

    return {
      rows,
      meta: {
        openingFromExcel: anyOpeningFromExcel
      }
    };
  }

  // --------------------------------------------------
  // ENDPOINT
  // --------------------------------------------------

  app.post('/api/groupSummary', async (req, res) => {

    if (!req.session?.conn) {
      return res.status(401).json({
        error: 'Not connected to a database session.'
      });
    }

    let {
      fromDate,
      toDate,
      includeOpening,
      subledger,
      subGroupIds,
      ledgerIds,
      excelLedgers,
      excelSubledgers,
    } = req.body ?? {};

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: 'fromDate and toDate are required.'
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
          error: `Dates must be ${
            isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'
          }.`
        });
      }

      const result = await buildSummary(conn, {
        fromDate,
        toDate,
        isAD,
        includeOpening: !!includeOpening,
        subledger: !!subledger,
        subGroupIds,
        ledgerIds,
        excelLedgers: excelLedgers ?? [],
        excelSubledgers: excelSubledgers ?? [],
      });

      console.info('[groupSummary] response summary', {
        fromDate,
        toDate,
        includeOpening: !!includeOpening,
        subledger: !!subledger,
        subGroupIds: subGroupIds ?? [],
        ledgerIds: ledgerIds ?? [],
        rowCount: result.rows.length,
        noData: !!result.meta?.noData,
      });

      res.json(result);

    } catch (err) {
      console.error('❌ /api/groupSummary:', err);

      const msg = err.message?.startsWith('Invalid DateType')
        ? err.message
        : 'Internal server error.';

      res.status(500).json({ error: msg });
    }
  });
};
