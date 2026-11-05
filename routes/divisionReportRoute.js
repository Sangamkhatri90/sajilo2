// routes/divisionReportRoute.js
const createTrialBalanceService = require('./helpers/trialBalanceService');

module.exports = function registerDivisionReport(app, sql) {
  const { d, buildTrialBalance } = createTrialBalanceService(sql);

  app.post('/api/DR/tablepop', async (req, res) => {
    const conn = req.session?.conn;
    if (!conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    const { fromDate: f, toDate: t, excelLedgers } = req.body ?? {};
    if (!f || !t) {
      return res.status(400).json({ error: 'fromDate and toDate are required.' });
    }

    try {
      const isAD = await d.getDateMode(conn);
      const fromDate = d.normDate(String(f), isAD);
      const toDate = d.normDate(String(t), isAD);

      const re = d.dateRegex(isAD);
      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({
          error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.`,
        });
      }

      const { rows, meta } = await buildTrialBalance(conn, {
        fromDate,
        toDate,
        isAD,
        excelLedgers: excelLedgers ?? [],
      });

      if (meta?.noData) return res.json([]);

      // Signed net: positive = Dr, negative = Cr
      res.json(
        rows.map((r) => ({
          "group name": r.groupName,
          "group alias": r.groupAlias,
          particular: r.particular,
          alias: r.alias,
          number: r.glid ?? '',
          openingBalance: r.openingDebit - r.openingCredit,
          period: r.periodDebit - r.periodCredit,
          total: r.balanceDebit - r.balanceCredit, // opening + period
        }))
      );
    } catch (err) {
      console.error('❌ /api/DR/tablepop:', err);
      const msg =
        err.message?.startsWith('Invalid DateType') ||
        err.message?.startsWith('Date mapping not found')
          ? err.message
          : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};