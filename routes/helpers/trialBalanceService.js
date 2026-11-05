// routes/helpers/trialBalanceService.js
const createJournalDates = require('./journalDates');

module.exports = function createTrialBalanceService(sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

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

  function openingDateCondition(isAD) {
    return isAD
      ? `(
           m.VoucherNo = 'OB1'
           OR m.JV_Date < CAST(? AS DATE)
           OR (m.JV_Date IS NULL AND m.JV_Miti IS NOT NULL AND m.JV_Miti < ?)
         )`
      : `(
           m.VoucherNo = 'OB1'
           OR m.JV_Miti < ?
           OR (m.JV_Miti IS NULL AND m.JV_Date IS NOT NULL AND m.JV_Date < CAST(? AS DATE))
         )`;
  }

  function openingDateParams(isAD, bounds) {
    return isAD
      ? [bounds.fromAD, bounds.fromMiti]
      : [bounds.fromMiti, bounds.fromAD];
  }

  async function openingJournalTotals(conn, isAD, bounds) {
    const rows = await queryAsync(
      conn,
      `
        SELECT d.GLID,
               ISNULL(SUM(d.DrAmount), 0) AS dr,
               ISNULL(SUM(d.CrAmount), 0) AS cr
        FROM dbo.tbJournalMaster m
        INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        WHERE ${openingDateCondition(isAD)}
        GROUP BY d.GLID
      `,
      openingDateParams(isAD, bounds)
    );
    return new Map(rows.map((r) => [r.GLID, { dr: num(r.dr), cr: num(r.cr) }]));
  }

  async function openingSubledgerTotals(conn, isAD, bounds) {
    const rows = await queryAsync(
      conn,
      `
        SELECT d.GLID, d.SLID,
               ISNULL(SUM(d.DrAmount), 0) AS dr,
               ISNULL(SUM(d.CrAmount), 0) AS cr
        FROM dbo.tbJournalMaster m
        INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        WHERE ${openingDateCondition(isAD)}
          AND d.SLID IS NOT NULL AND d.SLID <> 0
        GROUP BY d.GLID, d.SLID
      `,
      openingDateParams(isAD, bounds)
    );
    return new Map(
      rows.map((r) => [`${r.GLID}:${r.SLID}`, { dr: num(r.dr), cr: num(r.cr) }])
    );
  }

  async function buildTrialBalance(conn, {
    fromDate,
    toDate,
    isAD,
    excelLedgers = [],
    excelSubledgers = [],
  }) {
    const maxDate = await d.latestJournalDate(conn, isAD);
    if (maxDate && fromDate > maxDate) {
      return { rows: [], meta: { noData: true } };
    }

    const dateBounds = await d.getPeriodDateBounds(conn, isAD, fromDate, toDate);
    const dbOpening = await openingJournalTotals(conn, isAD, dateBounds);
    const dbOpeningSub = await openingSubledgerTotals(conn, isAD, dateBounds);
    const dbPeriod = await d.journalTotals(conn, isAD, fromDate, toDate, dateBounds);

    const ledgers = await queryAsync(conn, `
      SELECT l.GLID,
             RTRIM(LTRIM(l.GLName)) AS GLName,
             l.GlAlias,
             sg.SubGrpName, sg.SubGrpAlias,
             g.GrpName, g.GrpAlias
      FROM dbo.tbLedgerMaster l
      LEFT JOIN dbo.tbLedgerSubGroup sg ON sg.LgrSubGrpID = l.LgrSubGrpID
      LEFT JOIN dbo.tbLedgerGroup g ON g.LgrGrpID = sg.LgrGrpID
    `);

    const excelByName = new Map(excelLedgers.map((e) => [key(e.particular), e]));
    const excelOpening = (e) =>
      e ? { dr: num(e.openingDebit), cr: num(e.openingCredit) } : ZERO;

    const usedExcel = new Set();
    let anyOpeningFromExcel = false;

    const rows = ledgers.map((l) => {
      const k = key(l.GLName);
      const ex = excelByName.get(k);
      if (ex) usedExcel.add(k);

      const ledgerOpeningFromExcel = !dbOpening.has(l.GLID);
      if (ledgerOpeningFromExcel) anyOpeningFromExcel = true;

      const opening = ledgerOpeningFromExcel ? excelOpening(ex) : dbOpening.get(l.GLID);
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

    let skippedSubledgers = 0;

    if (excelSubledgers.length) {
      const slRows = await queryAsync(
        conn,
        `SELECT SLID, GLID, RTRIM(LTRIM(SlAlias)) AS alias FROM dbo.tbSubLedgerMaster`
      );

      const subledgerByAlias = new Map(
        slRows.map((r) => [key(r.alias), { GLID: r.GLID, SLID: r.SLID }])
      );
      const rowsByGlid = new Map(
        rows.filter((r) => r.glid != null).map((r) => [r.glid, r])
      );
      const seen = new Set();

      for (const s of excelSubledgers) {
        const alias = key(s.alias);
        const subledger = subledgerByAlias.get(alias);
        const parent = subledger ? rowsByGlid.get(subledger.GLID) : null;

        if (!alias || !subledger || !parent) {
          skippedSubledgers++;
          continue;
        }
        if (seen.has(alias)) continue;
        seen.add(alias);

        const parentOpeningFromExcel = !dbOpening.has(subledger.GLID);
        const opening = parentOpeningFromExcel
          ? excelOpening(s)
          : dbOpeningSub.get(`${subledger.GLID}:${subledger.SLID}`) ?? ZERO;

        parent.subledgers.push(
          makeRow(
            { particular: norm(s.particular), alias: norm(s.alias) },
            opening,
            ZERO
          )
        );
      }
    }

    return {
      rows,
      meta: { openingFromExcel: anyOpeningFromExcel, skippedSubledgers },
    };
  }

  return { d, buildTrialBalance };
};