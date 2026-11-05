const createJournalDates = require('./helpers/journalDates');

module.exports = function registerDayBook(app, sql, computeGroupTotals) {
  const d = createJournalDates(sql);

  // User list for "Filter For User" (no password returned)
  app.get('/api/dayBook/users', async (req, res) => {
    if (!req.session?.conn) return res.status(401).json({ error: 'Not connected to a database session.' });
    try {
      const rows = await d.queryAsync(req.session.conn,
        `SELECT UserName, FullName FROM SAJILODB.dbo.tbUserMaster ORDER BY UserName`);
      res.json(rows);
    } catch (err) {
      console.error('❌ /api/dayBook/users:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  app.post('/api/dayBook', async (req, res) => {
    if (!req.session?.conn) return res.status(401).json({ error: 'Not connected to a database session.' });

    let { fromDate, toDate, excelLedgers, detail, showZero, userName, docClassName } = req.body ?? {};
    if (!fromDate || !toDate) return res.status(400).json({ error: 'fromDate and toDate are required.' });

    try {
      const conn = req.session.conn;
      const isAD = await d.getDateMode(conn);

      fromDate = d.normDate(String(fromDate), isAD);
      toDate = d.normDate(String(toDate), isAD);

      const re = d.dateRegex(isAD);
      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }
      if (fromDate > toDate) return res.status(400).json({ error: 'From date cannot be greater than To date.' });

      // Resolve filters: name -> ID
      const filters = {};
      if (userName) {
        const u = await d.queryAsync(conn,
          `SELECT TOP 1 UserID FROM SAJILODB.dbo.tbUserMaster WHERE UserName = ?`, [userName]);
        if (!u.length) return res.status(400).json({ error: `User "${userName}" not found.` });
        filters.userId = u[0].UserID;
      }
      if (docClassName) {
        const c = await d.queryAsync(conn,
          `SELECT TOP 1 DocClassID FROM dbo.tbDocClassMaster WHERE DocClassName = ?`, [docClassName]);
        if (!c.length) return res.status(400).json({ error: `Doc class "${docClassName}" not found.` });
        filters.docClassId = c[0].DocClassID;
      }

      const { groupIds, groupTotals, groupInfoMap, groupLedgerRecords } = await computeGroupTotals(conn, {
        fromDate, toDate, isAD,
        excelLedgers: excelLedgers ?? [],
        allVouchers: true,
        filters,
      });

      // One item per group, or per ledger when detail is on
      const items = [];
      for (const id of groupIds) {
        const t = groupTotals[id];
        const gName = groupInfoMap[id]?.name || 'Ungrouped';
        const alias = groupInfoMap[id]?.alias || '';
        if (detail) {
          for (const l of groupLedgerRecords[id] ?? []) {
            items.push({ gid: id, particular: l.GLName, alias,
              openingDebit: l.openingDebit, openingCredit: l.openingCredit,
              periodDebit: l.periodDebit, periodCredit: l.periodCredit });
          }
        } else {
          items.push({ gid: id, particular: gName, alias,
            openingDebit: t.openingDebit, openingCredit: t.openingCredit,
            periodDebit: t.periodDebit, periodCredit: t.periodCredit });
        }
      }

      const openingBalance = [], transaction = [], balance = [];
      for (const it of items) {
        const { particular, alias } = it;
        if ([12, 13].includes(Number(it.gid))) {
          if (showZero || it.openingDebit !== 0 || it.openingCredit !== 0) {
            openingBalance.push({ particular, alias,
              openingDebit: it.openingDebit, openingCredit: it.openingCredit });
          }
          const dr = it.openingDebit + it.periodDebit;
          const cr = it.openingCredit + it.periodCredit;
          const amount = Math.abs(dr - cr);
          if (showZero || amount > 0) balance.push({ particular, alias, amount, side: dr > cr ? 'Dr' : 'Cr' });
        } else if (showZero || it.periodDebit !== 0 || it.periodCredit !== 0) {
          transaction.push({ particular, alias,
            periodDebit: it.periodDebit, periodCredit: it.periodCredit });
        }
      }

      res.json({ openingBalance, transaction, balance, meta: {} });
    } catch (err) {
      console.error('❌ /api/dayBook:', err);
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};