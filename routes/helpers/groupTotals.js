
// routes/helpers/groupTotals.js
const createJournalDates = require('./journalDates');

module.exports = function createGroupTotals(sql) {
  const d = createJournalDates(sql);

  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

  // Convert YYYY/MM/DD to DD/MM/YYYY for tbLocalDate.M_Miti.
  const mitiToTableFormat = (miti) => {
    const [year, month, day] = String(miti).split('/');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to YYYY/MM/DD for journal dates.
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

  // Build both AD and Miti representations of the selected period.
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

  // Selected-period date condition.
  // The alternate date is used only when the primary date is NULL.
  function periodDateCondition(isAD) {
    return isAD
      ? `(
          (
            m.JV_Date >= CAST(? AS DATE)
            AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))
          )
          OR
          (
            m.JV_Date IS NULL
            AND m.JV_Miti >= ?
            AND m.JV_Miti <= ?
          )
        )`
      : `(
          (
            m.JV_Miti >= ?
            AND m.JV_Miti <= ?
          )
          OR
          (
            m.JV_Miti IS NULL
            AND m.JV_Date >= CAST(? AS DATE)
            AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))
          )
        )`;
  }

  function periodDateParams(isAD, bounds) {
    return isAD
      ? [
          bounds.fromAD,
          bounds.toAD,
          bounds.fromMiti,
          bounds.toMiti,
        ]
      : [
          bounds.fromMiti,
          bounds.toMiti,
          bounds.fromAD,
          bounds.toAD,
        ];
  }

  // Cumulative opening balance condition.
  // Includes all historical movements before From Date
  // and OB1 opening entries, including entries without dates.
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

  // Get cumulative opening totals for all ledgers in one grouped query.
  // The presence of a GLID in this Map means that it has DB opening history,
  // even if its net balance is zero.
  async function journalOpeningTotals(conn, isAD, bounds) {
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
          cr: num(r.cr),
        },
      ])
    );
  }

  // Selected-period totals for all ledgers in one grouped query.
  async function journalPeriodTotals(conn, isAD, bounds) {
    const rows = await queryAsync(conn, `
      SELECT
        d.GLID,
        ISNULL(SUM(d.DrAmount), 0) AS dr,
        ISNULL(SUM(d.CrAmount), 0) AS cr
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      WHERE ${periodDateCondition(isAD)}
      GROUP BY d.GLID
    `, periodDateParams(isAD, bounds));

    return new Map(
      rows.map((r) => [
        r.GLID,
        {
          dr: num(r.dr),
          cr: num(r.cr),
        },
      ])
    );
  }

  // Transaction totals:
// Include non-cash/bank ledger entries ONLY from journals
// that contain a Cash/Bank entry (LgrGrpID 12 or 13).
async function journalCashTransactionTotals(conn, isAD, bounds) {
  const rows = await queryAsync(conn, `
    WITH CashJournals AS (
      SELECT
        d.JournalID
      FROM dbo.tbJournalMaster m
      INNER JOIN dbo.tbJournalDetails d
        ON d.JournalID = m.JournalID
      INNER JOIN dbo.tbLedgerMaster l
        ON l.GLID = d.GLID
      WHERE ${periodDateCondition(isAD)}
        AND l.LgrGrpID IN (12, 13)
      GROUP BY d.JournalID
      HAVING SUM(
        ABS(ISNULL(d.DrAmount, 0)) +
        ABS(ISNULL(d.CrAmount, 0))
      ) > 0
    )
    SELECT
      d.GLID,
      ISNULL(SUM(d.DrAmount), 0) AS dr,
      ISNULL(SUM(d.CrAmount), 0) AS cr
    FROM CashJournals cj
    INNER JOIN dbo.tbJournalDetails d
      ON d.JournalID = cj.JournalID
    LEFT JOIN dbo.tbLedgerMaster l
      ON l.GLID = d.GLID
    WHERE ISNULL(l.LgrGrpID, -1) NOT IN (12, 13)
    GROUP BY d.GLID
  `, periodDateParams(isAD, bounds));

  return new Map(
    rows.map((r) => [
      r.GLID,
      {
        dr: num(r.dr),
        cr: num(r.cr),
      },
    ])
  );
}

  async function computeGroupTotals(
    conn,
    {
      fromDate,
      toDate,
      isAD,
      excelLedgers = [],
    }
  ) {
    // 1. Get ledgers.
    const ledgers = await queryAsync(conn, `
      SELECT
        GLID,
        LgrGrpID,
        RTRIM(LTRIM(GLName)) AS GLName,
        Category
      FROM dbo.tbLedgerMaster
    `);

    // 2. Build both date representations.
    const bounds = await getDateBounds(
      conn,
      isAD,
      fromDate,
      toDate
    );

    // 3. Get cumulative opening and selected-period totals.
    // 3. Get cumulative opening and selected-period totals.

// Historical totals: opening balances.
const dbOpening = await journalOpeningTotals(
  conn,
  isAD,
  bounds
);

// All period movements: required for Cash/Bank closing balances.
const dbPeriod = await journalPeriodTotals(
  conn,
  isAD,
  bounds
);

// Period movements for non-cash/bank ledgers:
// only journals containing Cash/Bank transactions.
const dbCashTransactionPeriod = await journalCashTransactionTotals(
  conn,
  isAD,
  bounds
);

    // 4. Prepare Excel opening balances.
    const excelByName = new Map(
      (Array.isArray(excelLedgers) ? excelLedgers : [])
        .map((e) => [key(e.particular), e])
    );

    // 5. Roll ledgers up to groups.
    const groupTotals = {};
    const groupLedgerRecords = {};

    const accumulate = (
      grpId,
      category,
      glid,
      period,
      opening = ZERO
    ) => {
      const g = (groupTotals[grpId] ??= {
        periodDebit: 0,
        periodCredit: 0,
        openingDebit: 0,
        openingCredit: 0,
        categories: new Set(),
        GLIDs: new Set(),
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

      const category = norm(l.Category).toUpperCase();

      const isCashBankGroup = [12, 13].includes(Number(l.LgrGrpID));

const period = isCashBankGroup
  ? (dbPeriod.get(l.GLID) ?? ZERO)
  : (dbCashTransactionPeriod.get(l.GLID) ?? ZERO);

      let open = ZERO;
      let openingSource = 'none';

      // Opening balances are required only for Cash and Bank.
      if (category === 'B' || category === 'C') {
        if (dbOpening.has(l.GLID)) {
          // Use cumulative database history when available.
          open = dbOpening.get(l.GLID);
          openingSource = 'database';
        } else {
          // Otherwise use Excel opening balance for this ledger only.
          const ex = excelByName.get(key(l.GLName));

          if (ex) {
            open = {
              dr: num(ex.openingDebit),
              cr: num(ex.openingCredit),
            };
            openingSource = 'Excel';
          }
        }
      }

      (groupLedgerRecords[l.LgrGrpID] ??= []).push({
        GLID: l.GLID,
        GLName: l.GLName,
        Category: category,
        periodDebit: period.dr,
        periodCredit: period.cr,
        openingDebit: open.dr,
        openingCredit: open.cr,
        openingSource,
      });

      accumulate(
        l.LgrGrpID,
        category,
        l.GLID,
        period,
        open
      );
    }

    // 6. Group names and aliases.
    const groupIds = Object.keys(groupTotals);
    const groupInfoMap = {};

    if (groupIds.length) {
      const groups = await queryAsync(conn, `
        SELECT
          LgrGrpID,
          GrpName,
          GrpAlias
        FROM dbo.tbLedgerGroup
        WHERE LgrGrpID IN (${groupIds.map(() => '?').join(',')})
      `, groupIds);

      for (const g of groups) {
        groupInfoMap[g.LgrGrpID] = {
          name: g.GrpName || 'Ungrouped',
          alias: g.GrpAlias || '',
        };
      }
    }

    

    return {
      groupIds,
      groupTotals,
      groupInfoMap,
    };
  }

  function resolveCategory(categories) {
    return categories.includes('C')
      ? 'C'
      : categories.includes('B')
        ? 'B'
        : 'Other';
  }

  return {
    computeGroupTotals,
    resolveCategory,
  };
};
