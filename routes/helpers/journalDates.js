// routes/helpers/journalDates.js

// Master DB that holds tbLocalDate (AD <-> LD mapping).
// Override with env var if named differently. Validated because it is
// interpolated into SQL (identifiers can't be parameterized).
const MASTER_DB = process.env.SQL_DATABASE || 'SAJILODB';
if (!/^[A-Za-z0-9_]+$/.test(MASTER_DB)) {
  throw new Error(`Invalid master DB name: "${MASTER_DB}"`);
}

module.exports = function createJournalDates(sql) {
  const queryAsync = (conn, query, params = []) =>
    new Promise((resolve, reject) =>
      sql.query(conn, query, params, (err, rows) =>
        err ? reject(err) : resolve(rows)
      )
    );

  const norm = (v) => String(v ?? '').trim();
  const num = (v) => Number.parseFloat(v) || 0;

  // true = AD (English date, JV_Date)
  // false = LD (Nepali date, JV_Miti)
  async function getDateMode(conn) {
    const rows = await queryAsync(
      conn,
      `SELECT TOP 1 DateType FROM dbo.tbSystemSettings`
    );

    const t = norm(rows?.[0]?.DateType).toUpperCase();

    if (t === 'AD') return true;
    if (t === 'LD' || t === 'BS') return false;

    throw new Error(`Invalid DateType in tbSystemSettings: "${t}"`);
  }

  const normDate = (d, isAD) =>
    isAD ? d.replace(/\//g, '-') : d.replace(/-/g, '/');

  const dateRegex = (isAD) =>
    isAD
      ? /^\d{4}-\d{2}-\d{2}$/
      : /^\d{4}\/\d{2}\/\d{2}$/;

  // Primary-date-only condition (2 params: from, to).
  // Retained for compatibility with existing callers.
  const dateBetween = (isAD) =>
    isAD
      ? `m.JV_Date >= CAST(? AS DATE)
         AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))`
      : `m.JV_Miti BETWEEN ? AND ?`;

  // YYYY/MM/DD -> DD/MM/YYYY (tbLocalDate format)
  function mitiToTableFormat(miti) {
    const [year, month, day] = norm(miti).split('/');
    if (!year || !month || !day) return null;
    return `${day}/${month}/${year}`;
  }

  // DD/MM/YYYY -> YYYY/MM/DD
  function tableFormatToMiti(miti) {
    const [day, month, year] = norm(miti).split('/');
    if (!year || !month || !day) return null;
    return `${year}/${month}/${day}`;
  }

  // LD -> AD via tbLocalDate.
  // Some LD months have 32 days but not every year has day 32 in the table.
  // If the exact day is missing, step toward the inside of the month:
  //   direction 'back'    (use for a period END)   -> try day-1, day-2
  //   direction 'forward' (use for a period START) -> try day+1, day+2
  async function getADDateFromMiti(conn, miti, direction = 'back') {
    const [year, month, day] = norm(miti).split('/');
    if (!year || !month || !day) return null;

    const step = direction === 'forward' ? 1 : -1;
    const d0 = parseInt(day, 10);

    for (let i = 0; i <= 2; i++) {
      const d = d0 + step * i;
      if (d < 1) break;

      const tableMiti = `${String(d).padStart(2, '0')}/${month}/${year}`;

      const rows = await queryAsync(
        conn,
        `
          SELECT TOP 1
            CONVERT(varchar(10), M_date, 23) AS ADDate
          FROM ${MASTER_DB}.dbo.tbLocalDate
          WHERE M_Miti = ?
        `,
        [tableMiti]
      );

      if (rows?.[0]?.ADDate) return norm(rows[0].ADDate);
    }

    return null;
  }

  // AD -> LD via tbLocalDate.
  async function getMitiFromAD(conn, adDate) {
    const rows = await queryAsync(
      conn,
      `
        SELECT TOP 1 M_Miti AS Miti
        FROM ${MASTER_DB}.dbo.tbLocalDate
        WHERE M_date >= CAST(? AS DATE)
          AND M_date < DATEADD(DAY, 1, CAST(? AS DATE))
      `,
      [adDate, adDate]
    );

    return rows?.[0]?.Miti
      ? tableFormatToMiti(rows[0].Miti)
      : null;
  }

  // Both date formats for the selected period.
  // Throws if any mapping is missing so reports never silently drop rows.
  // Compute once per request and pass the result to the functions below.
  async function getPeriodDateBounds(conn, isAD, fromDate, toDate) {
    let bounds;

    if (isAD) {
      const [fromMiti, toMiti] = await Promise.all([
        getMitiFromAD(conn, fromDate),
        getMitiFromAD(conn, toDate),
      ]);
      bounds = { fromAD: fromDate, toAD: toDate, fromMiti, toMiti };
    } else {
      const [fromAD, toAD] = await Promise.all([
        getADDateFromMiti(conn, fromDate, 'forward'),
        getADDateFromMiti(conn, toDate, 'back'),
      ]);
      bounds = { fromMiti: fromDate, toMiti: toDate, fromAD, toAD };
    }

    const missing = Object.entries(bounds)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length) {
      throw new Error(
        `Date mapping not found in ${MASTER_DB}.dbo.tbLocalDate ` +
        `for ${fromDate} - ${toDate} (missing: ${missing.join(', ')})`
      );
    }

    return bounds;
  }

  // Primary date is checked first.
  // Alternate date is checked ONLY when the primary date is NULL.
  const periodDateCondition = (isAD) =>
    isAD
      ? `(
           (
             m.JV_Date >= CAST(? AS DATE)
             AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))
           )
           OR
           (
             m.JV_Date IS NULL
             AND m.JV_Miti BETWEEN ? AND ?
           )
         )`
      : `(
           (
             m.JV_Miti BETWEEN ? AND ?
           )
           OR
           (
             m.JV_Miti IS NULL
             AND m.JV_Date >= CAST(? AS DATE)
             AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))
           )
         )`;

  function periodDateParams(isAD, bounds) {
    return isAD
      ? [bounds.fromAD, bounds.toAD, bounds.fromMiti, bounds.toMiti]
      : [bounds.fromMiti, bounds.toMiti, bounds.fromAD, bounds.toAD];
  }

  // Previous fiscal year (fiscal year starts in month 04).
  // Months 01-03 belong to the fiscal year that started the year before.
  // LD month 03 can have 32 days, so its end is 03/32.
  function openingRange(fromDate, isAD) {
    const y = parseInt(fromDate.slice(0, 4), 10);
    const mth = parseInt(fromDate.slice(5, 7), 10);
    const fy = mth >= 4 ? y : y - 1;

    return isAD
      ? { from: `${fy - 1}-04-01`, to: `${fy}-03-31` }
      : { from: `${fy - 1}/04/01`, to: `${fy}/03/32` };
  }

  async function latestJournalDate(conn, isAD) {
    const expr = isAD
      ? `CONVERT(varchar(10), MAX(CAST(m.JV_Date AS DATE)), 23)`
      : `MAX(m.JV_Miti)`;

    // If any voucher has only its alternate date populated,
    // return NULL so the caller does not incorrectly skip the report.
    const fallbackCondition = isAD
      ? `x.JV_Date IS NULL AND x.JV_Miti IS NOT NULL`
      : `x.JV_Miti IS NULL AND x.JV_Date IS NOT NULL`;

    const rows = await queryAsync(
      conn,
      `
        SELECT
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM dbo.tbJournalMaster x
              WHERE ${fallbackCondition}
            )
            THEN NULL
            ELSE ${expr}
          END AS maxDate
        FROM dbo.tbJournalMaster m
      `
    );

    return rows?.[0]?.maxDate
      ? String(rows[0].maxDate)
      : null;
  }

  // Optional 5th arg `bounds`: pass a precomputed getPeriodDateBounds()
  // result to avoid repeating the tbLocalDate lookups.
  async function hasJournal(conn, isAD, from, to, bounds) {
    const b = bounds || (await getPeriodDateBounds(conn, isAD, from, to));

    const rows = await queryAsync(
      conn,
      `
        SELECT TOP 1 1 AS x
        FROM dbo.tbJournalMaster m
        WHERE ${periodDateCondition(isAD)}
      `,
      periodDateParams(isAD, b)
    );

    return rows.length > 0;
  }

  // Map<GLID, {dr, cr}>
  async function journalTotals(conn, isAD, from, to, bounds) {
    const b = bounds || (await getPeriodDateBounds(conn, isAD, from, to));

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
        WHERE ${periodDateCondition(isAD)}
        GROUP BY d.GLID
      `,
      periodDateParams(isAD, b)
    );

    return new Map(
      rows.map((r) => [r.GLID, { dr: num(r.dr), cr: num(r.cr) }])
    );
  }

  // Map<"GLID:SLID", {dr, cr}>
  async function subledgerTotals(conn, isAD, from, to, bounds) {
    const b = bounds || (await getPeriodDateBounds(conn, isAD, from, to));

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
        WHERE ${periodDateCondition(isAD)}
          AND d.SLID IS NOT NULL
          AND d.SLID <> 0
        GROUP BY d.GLID, d.SLID
      `,
      periodDateParams(isAD, b)
    );

    return new Map(
      rows.map((r) => [
        `${r.GLID}:${r.SLID}`,
        { dr: num(r.dr), cr: num(r.cr) },
      ])
    );
  }

  return {
    queryAsync,
    norm,
    num,
    getDateMode,
    normDate,
    dateRegex,
    dateBetween,
    periodDateCondition,
    periodDateParams,
    getPeriodDateBounds,
    openingRange,
    latestJournalDate,
    hasJournal,
    journalTotals,
    subledgerTotals,
  };
};