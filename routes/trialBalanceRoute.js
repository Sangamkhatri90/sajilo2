// routes/trialBalanceRoute.js
const createTrialBalanceService = require('./helpers/trialBalanceService');

module.exports = function registerTrialBalance(app, sql) {
  const { d, buildTrialBalance } = createTrialBalanceService(sql);

  app.post('/api/trialBalance', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { fromDate, toDate, excelLedgers, excelSubledgers } = req.body ?? {};

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'fromDate and toDate are required.' });
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