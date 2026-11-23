// routes/pearlsRoute.js
const createJournalDates = require('./helpers/journalDates');
const { PEARLS_SQL } = require('./helpers/pearlsQuery');

module.exports = function registerPearls(app, sql) {
  const d = createJournalDates(sql);

  app.post('/api/pearls', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { asOnDate, docClassName } = req.body ?? {};
    asOnDate = String(asOnDate ?? '').trim();
    docClassName = String(docClassName ?? '').trim();

    if (!asOnDate) {
      return res.status(400).json({ error: 'As on date is required.' });
    }

    try {
      const conn = req.session.conn;

      // ---- date mode + validation ----
      const isAD = await d.getDateMode(conn);
      asOnDate = d.normDate(asOnDate, isAD);
      if (!d.dateRegex(isAD).test(asOnDate)) {
        return res.status(400).json({ error: `Date must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }

      // ---- as-on date in both calendars (works in AD and LD mode) ----
      const asOn = await d.getPeriodDateBounds(conn, isAD, asOnDate, asOnDate);

      // ---- fiscal year start: month 04 of the Nepali year containing the as-on date ----
      const [y, m] = asOn.toMiti.split('/').map(Number);
      const fyYear = m >= 4 ? y : y - 1;
      const fyStartMiti = `${fyYear}/04/01`;
      const fy = await d.getPeriodDateBounds(conn, false, fyStartMiti, fyStartMiti);
      const fyStartAD = fy.fromAD;

      if (fyStartAD > asOn.toAD) {
        return res.status(400).json({ error: 'The as-on date is before the fiscal year start.' });
      }

      // ---- optional doc class (same lookup as Cash/Bank Book) ----
      let docClassId = 0;
      if (docClassName) {
        const c = await d.queryAsync(conn,
          `SELECT TOP 1 DocClassID FROM dbo.tbDocClassMaster WHERE DocClassName = ?`, [docClassName]);
        if (!c.length) {
          return res.status(400).json({ error: `Doc class "${docClassName}" not found.` });
        }
        docClassId = c[0].DocClassID;
      }

      // ---- one batch, one result set ----
      const recs = await d.queryAsync(conn, PEARLS_SQL, [asOn.toAD, fyStartAD, docClassId]);

      const numOrNull = (v) => (v === null || v === undefined ? null : d.num(v));
      const rows = [], balances = [], quality = {};

      for (const r of recs) {
        if (r.Section === 'ROW') {
          rows.push({
            sector: d.norm(r.Sector),
            title: d.norm(r.Title),
            standard: d.norm(r.Standard),
            numerator: numOrNull(r.Numerator),
            denominator: numOrNull(r.Denominator),
            ratio: numOrNull(r.Ratio),
          });
        } else if (r.Section === 'BAL') {
          balances.push({
            item: d.norm(r.Title),
            asOn: numOrNull(r.Numerator),
            previous: numOrNull(r.Denominator),
          });
        } else if (r.Section === 'QUALITY') {
          quality[d.norm(r.Title)] = { count: d.num(r.Numerator), amount: d.num(r.Denominator) };
        }
      }

      res.json({ asOnDate, asOnAD: asOn.toAD, fiscalYearStartAD: fyStartAD, rows, balances, quality });
    } catch (err) {
      console.error('❌ /api/pearls:', err);
      const msg = err.message?.startsWith('Invalid DateType') || err.message?.startsWith('Date mapping')
        ? err.message
        : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};