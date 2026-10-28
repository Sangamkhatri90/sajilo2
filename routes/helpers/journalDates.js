// routes/helpers/journalDates.js
module.exports = function createJournalDates(sql) {
  const queryAsync = (conn, query, params = []) =>
    new Promise((resolve, reject) =>
      sql.query(conn, query, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

  const norm = (v) => String(v ?? '').trim();
  const num = (v) => Number.parseFloat(v) || 0;

  // true = AD (English date, JV_Date), false = LD (Nepali date, JV_Miti)
  async function getDateMode(conn) {
    const rows = await queryAsync(conn, `SELECT TOP 1 DateType FROM dbo.tbSystemSettings`);
    const t = norm(rows?.[0]?.DateType).toUpperCase();
    if (t === 'AD') return true;
    if (t === 'LD' || t === 'BS') return false;
    throw new Error(`Invalid DateType in tbSystemSettings: "${t}"`);
  }

  const normDate = (d, isAD) => (isAD ? d.replace(/\//g, '-') : d.replace(/-/g, '/'));
  const dateRegex = (isAD) => (isAD ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}\/\d{2}\/\d{2}$/);

  // WHERE fragment on tbJournalMaster (alias m). Always takes two params: [from, to].
  // AD uses a range so an index on JV_Date can be used and a time part never drops the last day.
  const dateBetween = (isAD) =>
    isAD
      ? `m.JV_Date >= CAST(? AS DATE) AND m.JV_Date < DATEADD(DAY, 1, CAST(? AS DATE))`
      : `m.JV_Miti BETWEEN ? AND ?`;

  // Previous fiscal year (fiscal year starts in month 04).
  // Months 01-03 belong to the fiscal year that started the year before.
  // LD month 03 can have 32 days, so its end is 03/32.
  function openingRange(fromDate, isAD) {
    const y = parseInt(fromDate.slice(0, 4), 10);
    const mth = parseInt(fromDate.slice(5, 7), 10);
    const fy = mth >= 4 ? y : y - 1;   // year the current fiscal year started
    return isAD
      ? { from: `${fy - 1}-04-01`, to: `${fy}-03-31` }
      : { from: `${fy - 1}/04/01`, to: `${fy}/03/32` };
  }

  async function latestJournalDate(conn, isAD) {
    const expr = isAD
      ? `CONVERT(varchar(10), MAX(CAST(m.JV_Date AS DATE)), 23)`
      : `MAX(m.JV_Miti)`;
    const rows = await queryAsync(conn, `SELECT ${expr} AS maxDate FROM dbo.tbJournalMaster m`);
    return rows?.[0]?.maxDate ? String(rows[0].maxDate) : null;
  }

  async function hasJournal(conn, isAD, from, to) {
    const rows = await queryAsync(
      conn,
      `SELECT TOP 1 1 AS x FROM dbo.tbJournalMaster m WHERE ${dateBetween(isAD)}`,
      [from, to]
    );
    return rows.length > 0;
  }

  // Map<GLID, {dr, cr}> in one grouped query
  async function journalTotals(conn, isAD, from, to) {
    const rows = await queryAsync(
      conn,
      `SELECT d.GLID,
              ISNULL(SUM(d.DrAmount), 0) AS dr,
              ISNULL(SUM(d.CrAmount), 0) AS cr
       FROM dbo.tbJournalMaster m
       INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
       WHERE ${dateBetween(isAD)}
       GROUP BY d.GLID`,
      [from, to]
    );
    return new Map(rows.map((r) => [r.GLID, { dr: num(r.dr), cr: num(r.cr) }]));
  }

  // Map<"GLID:SLID", {dr, cr}> for subledger lines
  async function subledgerTotals(conn, isAD, from, to) {
    const rows = await queryAsync(
      conn,
      `SELECT d.GLID, d.SLID,
              ISNULL(SUM(d.DrAmount), 0) AS dr,
              ISNULL(SUM(d.CrAmount), 0) AS cr
       FROM dbo.tbJournalMaster m
       INNER JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
       WHERE ${dateBetween(isAD)} AND d.SLID IS NOT NULL AND d.SLID <> 0
       GROUP BY d.GLID, d.SLID`,
      [from, to]
    );
    return new Map(rows.map((r) => [`${r.GLID}:${r.SLID}`, { dr: num(r.dr), cr: num(r.cr) }]));
  }

  return {
    queryAsync, norm, num,
    getDateMode, normDate, dateRegex, dateBetween,
    openingRange, latestJournalDate, hasJournal, journalTotals, subledgerTotals,
  };
};