// routes/groupSummaryRoute.js
// Usage: require('./routes/groupSummaryRoute')(app, sql);
// Register AFTER express.json() and the session middleware.

const createJournalDates = require('./helpers/journalDates');

module.exports = function registerGroupSummary(app, sql) {
  const d = createJournalDates(sql);
  const { queryAsync, norm, num } = d;

  const key = (v) => norm(v).toLowerCase();
  const ZERO = { dr: 0, cr: 0 };
  const net = (open, period) => (open.dr - open.cr) + (period.dr - period.cr);
  const idSet = (arr) => (Array.isArray(arr) && arr.length ? new Set(arr.map(String)) : null);
  const excelOpening = (e) => (e ? { dr: num(e.openingDebit), cr: num(e.openingCredit) } : ZERO);
  const mapBy = (list, field) =>
    new Map(list.filter((e) => key(e[field])).map((e) => [key(e[field]), e]));

  async function buildSummary(conn, {
    fromDate, toDate, isAD, includeOpening, subledger,
    subGroupIds, ledgerIds, excelLedgers = [], excelSubledgers = [],
  }) {
    // 1. Period starts after all DB data -> nothing to show (no Excel fallback)
    const maxDate = await d.latestJournalDate(conn, isAD);
    if (maxDate && fromDate > maxDate) {
      return { rows: [], meta: { noData: true } };
    }

    // 2. Opening: DB if it has journal rows in the previous fiscal year, otherwise Excel
    let openingFromExcel = false;
    let dbOpening = new Map();
    let dbOpeningSub = new Map();

    if (includeOpening) {
      const o = d.openingRange(fromDate, isAD);
      openingFromExcel = !(await d.hasJournal(conn, isAD, o.from, o.to));
      if (!openingFromExcel) {
        dbOpening = await d.journalTotals(conn, isAD, o.from, o.to);
        if (subledger) dbOpeningSub = await d.subledgerTotals(conn, isAD, o.from, o.to);
      }
    }

    // 3. Period totals (one grouped query each)
    const dbPeriod = await d.journalTotals(conn, isAD, fromDate, toDate);
    const dbPeriodSub = subledger ? await d.subledgerTotals(conn, isAD, fromDate, toDate) : new Map();

    // 4. Ledgers + hierarchy in one query, filtered by the selection
    const wantLedgers = idSet(ledgerIds);
    const wantSubGroups = idSet(subGroupIds);

    const ledgers = (await queryAsync(conn, `
      SELECT l.GLID, RTRIM(LTRIM(l.GLName)) AS GLName, l.GlAlias AS GlAlias,
             sg.LgrSubGrpID AS SubGrpID, sg.SubGrpName, sg.SubGrpAlias,
             g.LgrGrpID AS GrpID, g.GrpName, g.GrpAlias
      FROM dbo.tbLedgerMaster l
      LEFT JOIN dbo.tbLedgerSubGroup sg ON sg.LgrSubGrpID = l.LgrSubGrpID
      LEFT JOIN dbo.tbLedgerGroup g     ON g.LgrGrpID = sg.LgrGrpID
      ORDER BY g.LgrGrpID, sg.LgrSubGrpID, l.GLID
    `)).filter((l) =>
      wantLedgers ? wantLedgers.has(String(l.GLID))
        : wantSubGroups ? wantSubGroups.has(String(l.SubGrpID))
        : true
    );

    const excelLedgerByName = mapBy(excelLedgers, 'particular');

    const rows = ledgers.map((l) => {
      const open = !includeOpening ? ZERO
        : openingFromExcel ? excelOpening(excelLedgerByName.get(key(l.GLName)))
        : dbOpening.get(l.GLID) ?? ZERO;

      return {
        glid: l.GLID,
        grpId: l.GrpID ?? null,
        grpName: l.GrpName || 'Ungrouped',
        grpAlias: l.GrpAlias || '',
        subGrpId: l.SubGrpID ?? null,
        subGrpName: l.SubGrpName || 'Ungrouped',
        subGrpAlias: l.SubGrpAlias || '',
        ledgerName: l.GLName,
        ledgerAlias: norm(l.GlAlias),
        amount: net(open, dbPeriod.get(l.GLID) ?? ZERO),
        subLedgers: [],
      };
    });

    // 5. Subledgers: a breakdown of their ledger, not added on top of it
    if (subledger) {
      const rowsByGlid = new Map(rows.map((r) => [r.glid, r]));
      const excelSubByAlias = mapBy(excelSubledgers, 'alias');
      const excelSubByName = mapBy(excelSubledgers, 'particular');

      const slMaster = await queryAsync(conn, `
        SELECT SLID, GLID,
               RTRIM(LTRIM(SLName)) AS SLName,
               RTRIM(LTRIM(SlAlias)) AS SLAlias
        FROM dbo.tbSubLedgerMaster
      `);

      for (const s of slMaster) {
        const parent = rowsByGlid.get(s.GLID);
        if (!parent) continue;

        const k = `${s.GLID}:${s.SLID}`;
        const period = dbPeriodSub.get(k) ?? ZERO;

        let open = ZERO;
        if (includeOpening) {
          open = openingFromExcel
            ? excelOpening(excelSubByAlias.get(key(s.SLAlias)) ?? excelSubByName.get(key(s.SLName)))
            : dbOpeningSub.get(k) ?? ZERO;
        }

        // skip subledgers with no movement and no opening at all
        if (!period.dr && !period.cr && !open.dr && !open.cr) continue;

        parent.subLedgers.push({
          name: s.SLName,
          alias: norm(s.SLAlias),
          amount: net(open, period),
        });
      }
    }

    return { rows, meta: { openingFromExcel } };
  }

  // ---------- endpoint ----------
  app.post('/api/groupSummary', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let {
      fromDate, toDate, includeOpening, subledger,
      subGroupIds, ledgerIds, excelLedgers, excelSubledgers,
    } = req.body ?? {};

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

      res.json(await buildSummary(conn, {
        fromDate, toDate, isAD,
        includeOpening: !!includeOpening,
        subledger: !!subledger,
        subGroupIds, ledgerIds,
        excelLedgers: excelLedgers ?? [],
        excelSubledgers: excelSubledgers ?? [],
      }));
    } catch (err) {
      console.error('❌ /api/groupSummary:', err);
      const msg = err.message?.startsWith('Invalid DateType') ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};