// routes/cashBankBookDetailRoute.js
const createJournalDates = require('./helpers/journalDates');

module.exports = function registerCashBankBookDetail(app, sql) {
  const d = createJournalDates(sql);

  app.post('/api/cashBankBookDetail', async (req, res) => {
    if (!req.session?.conn) {
      return res.status(401).json({ error: 'Not connected to a database session.' });
    }

    let { fromDate, toDate, ledgerName, docClassName, userName,
          showNarrationT, showNarrationM, showSubLedger, showAlias,showCheque  } = req.body ?? {};
    ledgerName = String(ledgerName ?? '').trim();
    if (!fromDate || !toDate || !ledgerName) {
      return res.status(400).json({ error: 'fromDate, toDate and ledger are required.' });
    }

    try {
      const conn = req.session.conn;

      // ---- ledger (Cash/Bank only) ----
      const lg = await d.queryAsync(conn, `
        SELECT TOP 1 GLID, RTRIM(LTRIM(GLName)) AS GLName
        FROM dbo.tbLedgerMaster
        WHERE RTRIM(LTRIM(GLName)) = ? AND Category IN ('B','C')`, [ledgerName]);
      if (!lg.length) return res.status(400).json({ error: `Cash/Bank ledger "${ledgerName}" not found.` });
      const glid = lg[0].GLID;

      // ---- optional filters (period only; opening stays unfiltered) ----
      const fParts = [], fParams = [];
      if (docClassName) {
        const c = await d.queryAsync(conn,
          `SELECT TOP 1 DocClassID FROM dbo.tbDocClassMaster WHERE DocClassName = ?`, [docClassName]);
        if (!c.length) return res.status(400).json({ error: `Doc class "${docClassName}" not found.` });
        fParts.push('AND m.DocClassID = ?'); fParams.push(c[0].DocClassID);
      }
      if (userName) {
        const u = await d.queryAsync(conn,
          `SELECT TOP 1 UserID FROM SAJILODB.dbo.tbUserMaster WHERE UserName = ?`, [userName]);
        if (!u.length) return res.status(400).json({ error: `User "${userName}" not found.` });
        fParts.push('AND m.CreatedUserID = ?'); fParams.push(u[0].UserID);
      }
      const filterSql = fParts.join(' ');

      // ---- dates ----
      const isAD = await d.getDateMode(conn);
      fromDate = d.normDate(String(fromDate), isAD);
      toDate = d.normDate(String(toDate), isAD);
      const re = d.dateRegex(isAD);
      if (!re.test(fromDate) || !re.test(toDate)) {
        return res.status(400).json({ error: `Dates must be ${isAD ? 'YYYY-MM-DD' : 'YYYY/MM/DD'}.` });
      }
      if (fromDate > toDate) return res.status(400).json({ error: 'From date cannot be greater than To date.' });

      const bounds = await d.getPeriodDateBounds(conn, isAD, fromDate, toDate);

      // ---- opening Dr / Cr (all history before From + OB1) ----
      const openCond = isAD
        ? `(m.VoucherNo = 'OB1' OR m.JV_Date < CAST(? AS DATE)
            OR (m.JV_Date IS NULL AND m.JV_Miti IS NOT NULL AND m.JV_Miti < ?))`
        : `(m.VoucherNo = 'OB1' OR m.JV_Miti < ?
            OR (m.JV_Miti IS NULL AND m.JV_Date < CAST(? AS DATE)))`;
      const openParams = isAD ? [bounds.fromAD, bounds.fromMiti] : [bounds.fromMiti, bounds.fromAD];

      const o = await d.queryAsync(conn, `
        SELECT ISNULL(SUM(d.DrAmount),0) AS dr, ISNULL(SUM(d.CrAmount),0) AS cr
        FROM dbo.tbJournalMaster m
        JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        WHERE d.GLID = ? AND ${openCond}`, [glid, ...openParams]);
      const openDr = d.num(o[0].dr), openCr = d.num(o[0].cr);

      // ---- voucher lines of every voucher that touches this ledger ----
      const dateExpr = isAD
        ? `ISNULL(CONVERT(varchar(10), CAST(m.JV_Date AS DATE), 23), x.d)`
        : `ISNULL(m.JV_Miti, x.d)`;
      const apply = isAD
        ? `OUTER APPLY (SELECT TOP 1 CONVERT(varchar(10), M_date, 23) AS d
             FROM SAJILODB.dbo.tbLocalDate
             WHERE M_Miti = SUBSTRING(m.JV_Miti,9,2)+'/'+SUBSTRING(m.JV_Miti,6,2)+'/'+LEFT(m.JV_Miti,4)) x`
        : `OUTER APPLY (SELECT TOP 1 RIGHT(M_Miti,4)+'/'+SUBSTRING(M_Miti,4,2)+'/'+LEFT(M_Miti,2) AS d
             FROM SAJILODB.dbo.tbLocalDate
             WHERE M_date >= CAST(m.JV_Date AS DATE)
               AND M_date < DATEADD(DAY,1,CAST(m.JV_Date AS DATE))) x`;

      const lines = await d.queryAsync(conn, `
        SELECT m.JournalID, m.VoucherNo, ${dateExpr} AS dt, m.Remarks,
               d.SNo, d.GLID, d.SLID, RTRIM(LTRIM(l.GLName)) AS GLName,
               RTRIM(LTRIM(s.SLName)) AS SLName, RTRIM(LTRIM(s.SlAlias)) AS SlAlias,
               d.DrAmount, d.CrAmount, d.Narration,d.ChequeNo
        FROM dbo.tbJournalMaster m
        JOIN dbo.tbJournalDetails d ON d.JournalID = m.JournalID
        LEFT JOIN dbo.tbLedgerMaster l ON l.GLID = d.GLID
        LEFT JOIN dbo.tbSubLedgerMaster s ON s.SLID = d.SLID AND d.SLID <> 0
        ${apply}
        WHERE m.VoucherNo <> 'OB1'
          AND ${d.periodDateCondition(isAD)}
          ${filterSql}
          AND EXISTS (SELECT 1 FROM dbo.tbJournalDetails b
                      WHERE b.JournalID = m.JournalID AND b.GLID = ?)
        ORDER BY ${dateExpr}, m.JournalID, d.SNo`,
        [...d.periodDateParams(isAD, bounds), ...fParams, glid]);

      // ---- group lines into vouchers ----
      const fmtDate = (s) => { const p = String(s).split(/[-/]/); return `${p[2]}/${p[1]}/${p[0]}`; };
      const vMap = new Map();
      let receiptTotal = 0, paymentTotal = 0;

      for (const r of lines) {
        let v = vMap.get(r.JournalID);
        if (!v) {
          v = { date: fmtDate(r.dt), voucherNo: d.norm(r.VoucherNo), remarks: d.norm(r.Remarks),
                lines: [], narrations: [] ,subledgers: new Map(),cheques: new Set(),bankDr: 0, bankCr: 0 };
          vMap.set(r.JournalID, v);
        }
        const dr = d.num(r.DrAmount), cr = d.num(r.CrAmount);
        const nar = d.norm(r.Narration);
        const chq = d.norm(r.ChequeNo);
        if (chq) v.cheques.add(chq);
        
        if (nar && !v.narrations.includes(nar)) v.narrations.push(nar);
        
        if (Number(r.GLID) !== Number(glid) && r.SLID && d.norm(r.SLName)) {
          v.subledgers.set(r.SLID, {
            name: d.norm(r.SLName),
            alias: d.norm(r.SlAlias),
          });
        }
        if (Number(r.GLID) === Number(glid)) {      // the Cash/Bank line itself -> totals
          receiptTotal += dr; paymentTotal += cr;
        } else if (cr > 0) {                         // contra credit = bank receipt
          v.lines.push({ particular: d.norm(r.GLName), receipt: cr, payment: 0 });
        } else if (dr > 0) {                         // contra debit = bank payment
          v.lines.push({ particular: d.norm(r.GLName), receipt: 0, payment: dr });
        }
        if (Number(r.GLID) === Number(glid)) {      // the Cash/Bank line itself -> totals
          receiptTotal += dr; paymentTotal += cr;
          v.bankDr += dr; v.bankCr += cr;  
        }         
      }

            let running = openDr - openCr;
      const vouchers = [...vMap.values()].map((v) => {
        running += v.bankDr - v.bankCr;              // balance after this voucher
        return {
          date: v.date,
          voucherNo: v.voucherNo,
          lines: v.lines,
          subLedger: showSubLedger ? [...v.subledgers.values()].join('/') : '',
          chequeNo: showCheque ? [...v.cheques].join(', ') : '',
          narrations: showNarrationT ? v.narrations : [],
          remarks: showNarrationM ? v.remarks : '',
          receipt: v.bankDr,
          payment: v.bankCr,
          balance: running,
        };
      });

      res.json({
        ledger: lg[0].GLName,
        opening: openDr - openCr,
        vouchers,
        daily: { receipt: receiptTotal, payment: paymentTotal },
        total: { receipt: openDr + receiptTotal, payment: openCr + paymentTotal },
      });
    } catch (err) {
      console.error('❌ /api/cashBankBookDetail:', err);
      const msg = err.message?.startsWith('Invalid DateType') || err.message?.startsWith('Date mapping')
        ? err.message : 'Internal server error.';
      res.status(500).json({ error: msg });
    }
  });
};
