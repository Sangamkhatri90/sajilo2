// routes/receiptPaymentRoute.js
// Usage: require('./routes/receiptPaymentRoute')(app, sql, computeGroupTotals, resolveCategory);
// Register AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerReceiptPayment(app, sql, computeGroupTotals, resolveCategory) {
  const d = createJournalDates(sql);

  app.post('/api/receiptPayment', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { fromDate, toDate, excelLedgers } = req.body ?? {};
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
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }

      // Period starts after all DB data -> nothing to show, no Excel fallback
      const maxDate = await d.latestJournalDate(conn, isAD);
      if (maxDate && fromDate > maxDate) {
        return res.json({ openingBalance: [], transaction: [], balance: [], meta: { noData: true } });
      }

      const { groupIds, groupTotals, groupInfoMap } = await computeGroupTotals(conn, {
        fromDate,
        toDate,
        isAD,
        excelLedgers: excelLedgers ?? [],
      });

      const openingBalance = [];
      const transaction = [];
      const balance = [];

      for (const id of groupIds) {
        const t = groupTotals[id];
        const category = resolveCategory(Array.from(t.categories));
        const particular = groupInfoMap[id]?.name || 'Ungrouped';
        const alias = groupInfoMap[id]?.alias || '';

        if (category === 'C' || category === 'B') {
          // Cash / bank groups: opening + closing balance
          if (t.openingDebit !== 0 || t.openingCredit !== 0) {
            openingBalance.push({ particular, alias, openingDebit: t.openingDebit, openingCredit: t.openingCredit });
          }
          const dr = t.openingDebit + t.periodDebit;
          const cr = t.openingCredit + t.periodCredit;
          const amount = Math.abs(dr - cr);
          if (amount > 0) {
            balance.push({ particular, alias, amount, side: dr > cr ? 'Dr' : 'Cr' });
          }
        } else if (t.periodDebit !== 0 || t.periodCredit !== 0) {
          transaction.push({ particular, alias, periodDebit: t.periodDebit, periodCredit: t.periodCredit });
        }
      }

      res.json({ openingBalance, transaction, balance, meta: {} });
    } catch (err) {
      console.error('❌ /api/receiptPayment:', err);
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};