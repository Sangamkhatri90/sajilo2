// routes/incomeStatementRoute.js
// Usage: require('./routes/incomeStatementRoute')(app, sql);
// Register AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

// Same hardcoded group IDs as the old routes
const SECTIONS = [
  { name: 'Income', grpId: 20 },
  { name: 'Expenditure', grpId: 19 },
];

module.exports = function registerIncomeStatement(app, sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm } = d;

  const ZERO = { dr: 0, cr: 0 };
  const r2 = (n) => Math.round(n * 100) / 100;
  const getOrAdd = (m, k, make) => { if (!m.has(k)) m.set(k, make()); return m.get(k); };

  async function buildIncomeStatement(conn, { fromDate, toDate, isAD, subledger }) {
    // No journal entries in the period (after the last entry or before the first) -> nothing to show
    if (!(await d.hasJournal(conn, isAD, fromDate, toDate))) {
      return { sections: [], balance: 0, meta: { noData: true } };
    }

    // Period totals: one grouped query instead of one per ledger
    const period = await d.journalTotals(conn, isAD, fromDate, toDate);
    const periodSub = subledger ? await d.subledgerTotals(conn, isAD, fromDate, toDate) : new Map();

    // Groups -> subgroups -> ledgers in one query
    const grpIds = SECTIONS.map((s) => s.grpId);
    const rows = await queryAsync(conn, `
      SELECT g.LgrGrpID AS GrpID, g.GrpName, g.GrpAlias,
             sg.LgrSubGrpID AS SubGrpID, sg.SubGrpName, sg.SubGrpAlias,
             l.GLID, RTRIM(LTRIM(l.GLName)) AS GLName, l.GlAlias AS GlAlias
      FROM dbo.tbLedgerGroup g
      LEFT JOIN dbo.tbLedgerSubGroup sg ON sg.LgrGrpID = g.LgrGrpID
      LEFT JOIN dbo.tbLedgerMaster l    ON l.LgrSubGrpID = sg.LgrSubGrpID
      WHERE g.LgrGrpID IN (${grpIds.map(() => '?').join(',')})
      ORDER BY g.LgrGrpID, sg.LgrSubGrpID, l.GLID
    `, grpIds);

    const groups = new Map();
    for (const r of rows) {
      const g = getOrAdd(groups, r.GrpID, () => ({
        name: norm(r.GrpName), alias: norm(r.GrpAlias), subs: new Map(),
      }));
      if (r.SubGrpID == null) continue;

      const s = getOrAdd(g.subs, r.SubGrpID, () => ({
        name: norm(r.SubGrpName), alias: norm(r.SubGrpAlias), ledgers: [],
      }));
      if (r.GLID != null) s.ledgers.push({ glid: r.GLID, name: norm(r.GLName), alias: norm(r.GlAlias) });
    }

    // Subledger master (only when requested)
    const subsByGlid = new Map();
    if (subledger) {
      const slRows = await queryAsync(conn, `
        SELECT SLID, GLID, RTRIM(LTRIM(SLName)) AS SLName, RTRIM(LTRIM(SlAlias)) AS SLAlias
        FROM dbo.tbSubLedgerMaster
      `);
      for (const s of slRows) getOrAdd(subsByGlid, s.GLID, () => []).push(s);
    }

    const sections = [];
    const totals = {};

    for (const sec of SECTIONS) {
      const g = groups.get(sec.grpId);
      if (!g) continue;   // group missing -> skip the section, as before

      let sectionTotal = 0;

      const subGroups = [...g.subs.values()].map((sub) => {
        let subTotal = 0;
        const ledgers = [];

        for (const l of sub.ledgers) {
          const p = period.get(l.glid) ?? ZERO;
          const amount = p.dr - p.cr;
          subTotal += amount;
          if (Math.abs(amount) < 0.005) continue;   // zero ledgers are not listed

          const subLedgers = (subsByGlid.get(l.glid) ?? [])
            .map((s) => ({ s, p: periodSub.get(`${l.glid}:${s.SLID}`) }))
            .filter((x) => x.p && (x.p.dr || x.p.cr))
            .map((x) => ({
              name: x.s.SLName,
              alias: norm(x.s.SLAlias),
              amount: r2(x.p.dr - x.p.cr),
            }));

          ledgers.push({ name: l.name, alias: l.alias, amount: r2(amount), subLedgers });
        }

        sectionTotal += subTotal;
        return { name: sub.name, alias: sub.alias, amount: r2(subTotal), ledgers };
      });

      totals[sec.name] = sectionTotal;
      sections.push({
        name: sec.name,
        grpName: g.name,
        grpAlias: g.alias,
        total: r2(sectionTotal),
        subGroups,
      });
    }

    return {
      sections,
      balance: r2((totals.Income ?? 0) - (totals.Expenditure ?? 0)),
      meta: {},
    };
  }

  // ---------- endpoint ----------
  app.post('/api/incomeStatement', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { fromDate, toDate, subledger } = req.body ?? {};
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

      res.json(await buildIncomeStatement(conn, { fromDate, toDate, isAD, subledger: !!subledger }));
    } catch (err) {
      console.error('❌ /api/incomeStatement:', err);
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};