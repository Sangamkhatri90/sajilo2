// routes/trialBalanceRoute.js
// Usage: require('./routes/trialBalanceRoute')(app, sql);
// Must be registered AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerTrialBalance(app, sql) {
  // Shared journal helpers (tbJournalMaster date + tbJournalDetails amounts, AD/LD aware)
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };

  // ---------- row builder ----------
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

  const UNGROUPED = {
    groupName: 'Ungrouped', groupAlias: '',
    subGroup: 'Ungrouped', subGroupAlias: '',
  };

  // ---------- core ----------
  async function buildTrialBalance(conn, { fromDate, toDate, isAD, excelLedgers = [], excelSubledgers = [] }) {
    // 1. Requested period is after all DB data -> nothing to show (no Excel fallback)
    const maxDate = await d.latestJournalDate(conn, isAD);
    if (maxDate && fromDate > maxDate) {
      return { rows: [], meta: { noData: true } };
    }

    // 2. Does the DB cover the opening fiscal year? If not, Excel supplies opening.
    const opening = d.openingRange(fromDate, isAD);
    const openingFromExcel = !(await d.hasJournal(conn, isAD, opening.from, opening.to));

    const dbOpening = openingFromExcel
      ? new Map()
      : await d.journalTotals(conn, isAD, opening.from, opening.to);
    const dbPeriod = await d.journalTotals(conn, isAD, fromDate, toDate);

    // 3. Ledgers + group hierarchy in a single query
    const ledgers = await queryAsync(conn, `
      SELECT l.GLID, RTRIM(LTRIM(l.GLName)) AS GLName, l.GlAlias,
             sg.SubGrpName, sg.SubGrpAlias, g.GrpName, g.GrpAlias
      FROM dbo.tbLedgerMaster l
      LEFT JOIN dbo.tbLedgerSubGroup sg ON sg.LgrSubGrpID = l.LgrSubGrpID
      LEFT JOIN dbo.tbLedgerGroup g     ON g.LgrGrpID = sg.LgrGrpID
    `);

    const excelByName = new Map(excelLedgers.map((e) => [key(e.particular), e]));
    const excelOpening = (e) => (e ? { dr: num(e.openingDebit), cr: num(e.openingCredit) } : ZERO);
    const usedExcel = new Set();

    const rows = ledgers.map((l) => {
      const k = key(l.GLName);
      const ex = excelByName.get(k);
      if (ex) usedExcel.add(k);

      return makeRow(
        {
          glid: l.GLID,
          particular: l.GLName,
          alias: norm(l.GlAlias) || norm(ex?.alias),
          groupName: l.GrpName || 'Ungrouped',
          groupAlias: l.GrpAlias || '',
          subGroup: l.SubGrpName || 'Ungrouped',
          subGroupAlias: l.SubGrpAlias || '',
          subledgers: [],
        },
        openingFromExcel ? excelOpening(ex) : dbOpening.get(l.GLID) ?? ZERO,
        dbPeriod.get(l.GLID) ?? ZERO
      );
    });

    // Excel-only ledgers (old accounts not in master), only when Excel is the opening source
    if (openingFromExcel) {
      for (const [k, ex] of excelByName) {
        if (!k || usedExcel.has(k)) continue;
        rows.push(makeRow(
          { glid: null, particular: norm(ex.particular), alias: norm(ex.alias), ...UNGROUPED, subledgers: [] },
          excelOpening(ex),
          ZERO
        ));
      }
    }

    // 4. Subledgers (amounts exist only in Excel)
    let skippedSubledgers = 0;
    if (excelSubledgers.length) {
      const slRows = await queryAsync(
        conn, `SELECT GLID, RTRIM(LTRIM(SlAlias)) AS alias FROM dbo.tbSubLedgerMaster`
      );
      const glidByAlias = new Map(slRows.map((r) => [key(r.alias), r.GLID]));
      const rowsByGlid = new Map(rows.filter((r) => r.glid != null).map((r) => [r.glid, r]));
      const seen = new Set();

      for (const s of excelSubledgers) {
        const alias = key(s.alias);
        const parent = rowsByGlid.get(glidByAlias.get(alias));
        if (!alias || !parent) { skippedSubledgers++; continue; }
        if (seen.has(alias)) continue;
        seen.add(alias);

        parent.subledgers.push(makeRow(
          { particular: norm(s.particular), alias: norm(s.alias) },
          excelOpening(s),
          ZERO
        ));
      }
    }

    return { rows, meta: { openingFromExcel, skippedSubledgers } };
  }

  // ---------- endpoint ----------
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
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
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
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};