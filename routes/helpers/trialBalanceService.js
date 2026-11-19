// routes/helpers/trialBalanceService.js
const createJournalDates = require('./journalDates');

module.exports = function createTrialBalanceService(sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

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

  async function buildTrialBalance(conn, {
    fromDate,
    toDate,
    isAD,
  }) {
    const maxDate = await d.latestJournalDate(conn, isAD);
    if (maxDate && fromDate > maxDate) {
      return { rows: [], meta: { noData: true } };
    }

    const dateBounds = await d.getPeriodDateBounds(conn, isAD, fromDate, toDate);
    const dbOpening = await openingJournalTotals(conn, isAD, dateBounds);
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

    const rows = ledgers.map((l) => {
      const opening = dbOpening.get(l.GLID) ?? ZERO;
      const period = dbPeriod.get(l.GLID) ?? ZERO;

      return makeRow(
        {
          glid: l.GLID,
          particular: l.GLName,
          alias: norm(l.GlAlias),
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

    return {
      rows,
      meta: {},
    };
  }

  return { d, buildTrialBalance };
};
