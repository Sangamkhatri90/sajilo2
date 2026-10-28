// routes/helpers/groupTotals.js
const createJournalDates = require('./journalDates');

module.exports = function createGroupTotals(sql) {
  const d = createJournalDates(sql);
  const key = (v) => d.norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

  async function computeGroupTotals(conn, { fromDate, toDate, isAD, excelLedgers = [] }) {
    // 1. Ledgers
    const ledgers = await d.queryAsync(conn, `
      SELECT GLID, LgrGrpID, RTRIM(LTRIM(GLName)) AS GLName, Category
      FROM dbo.tbLedgerMaster
    `);

    // 2. Opening comes from the DB if it has journal rows in the previous fiscal year,
    //    otherwise from Excel (if loaded)
    const opening = d.openingRange(fromDate, isAD);
    const openingFromExcel = !(await d.hasJournal(conn, isAD, opening.from, opening.to));

    const dbOpening = openingFromExcel
      ? new Map()
      : await d.journalTotals(conn, isAD, opening.from, opening.to);
    const dbPeriod = await d.journalTotals(conn, isAD, fromDate, toDate);

    const excelByName = new Map(excelLedgers.map((e) => [key(e.particular), e]));

    // 3. Roll ledgers up to groups
    const groupTotals = {};
    const accumulate = (grpId, category, glid, period, opening = ZERO) => {
      const g = (groupTotals[grpId] ??= {
        periodDebit: 0, periodCredit: 0,
        openingDebit: 0, openingCredit: 0,
        categories: new Set(), GLIDs: new Set(),
      });
      g.periodDebit += period.dr;
      g.periodCredit += period.cr;
      g.openingDebit += opening.dr;
      g.openingCredit += opening.cr;
      g.categories.add(category);
      g.GLIDs.add(glid);
    };

    for (const l of ledgers) {
      if (!l.GLID || !l.LgrGrpID) continue;

      const category = d.norm(l.Category).toUpperCase();
      const period = dbPeriod.get(l.GLID) ?? ZERO;
      let open = ZERO;

      // Opening balance only matters for cash / bank ledgers (B, C)
      if (category === 'B' || category === 'C') {
        if (openingFromExcel) {
          const ex = excelByName.get(key(l.GLName));
          if (ex) open = { dr: d.num(ex.openingDebit), cr: d.num(ex.openingCredit) };
        } else {
          open = dbOpening.get(l.GLID) ?? ZERO;
        }
      }

      accumulate(l.LgrGrpID, category, l.GLID, period, open);
    }

    // 4. Group names and aliases
    const groupIds = Object.keys(groupTotals);
    const groupInfoMap = {};

    if (groupIds.length) {
      const groups = await d.queryAsync(conn, `
        SELECT LgrGrpID, GrpName, GrpAlias
        FROM dbo.tbLedgerGroup
        WHERE LgrGrpID IN (${groupIds.map(() => '?').join(',')})
      `, groupIds);

      for (const g of groups) {
        groupInfoMap[g.LgrGrpID] = { name: g.GrpName || 'Ungrouped', alias: g.GrpAlias || '' };
      }
    }

    return { groupIds, groupTotals, groupInfoMap };
  }

  function resolveCategory(categories) {
    return categories.includes('C') ? 'C' : categories.includes('B') ? 'B' : 'Other';
  }

  return { computeGroupTotals, resolveCategory };
};