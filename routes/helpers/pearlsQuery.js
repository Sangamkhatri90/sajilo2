// routes/helpers/pearlsQuery.js
// One T-SQL batch -> ONE result set (Section, Ord, Sector, Title, Standard, Numerator, Denominator, Ratio).
// Parameters (in order): 1) as-on date (AD)  2) fiscal-year start (AD)  3) DocClassID (0 = all)
const PEARLS_SQL = `
SET NOCOUNT ON;
DECLARE @To date = CAST(? AS DATE),
        @FYStart date = CAST(? AS DATE),
        @DocClassID int = NULLIF(CAST(? AS INT), 0);
DECLARE @Prev date = DATEADD(day, -1, @FYStart);
DECLARE @Over12 dec(18,2) = 0, @Under12 dec(18,2) = 0;

IF OBJECT_ID('tempdb..#Loan') IS NOT NULL DROP TABLE #Loan;
IF OBJECT_ID('tempdb..#Due')  IS NOT NULL DROP TABLE #Due;
IF OBJECT_ID('tempdb..#Map')  IS NOT NULL DROP TABLE #Map;
IF OBJECT_ID('tempdb..#Bal')  IS NOT NULL DROP TABLE #Bal;
IF OBJECT_ID('tempdb..#T')    IS NOT NULL DROP TABLE #T;
IF OBJECT_ID('tempdb..#V')    IS NOT NULL DROP TABLE #V;
IF OBJECT_ID('tempdb..#Out')  IS NOT NULL DROP TABLE #Out;

-- Loans outstanding as on @To (posted, not trashed)
SELECT JD.SLID, SUM(ISNULL(JD.DrAmount,0) - ISNULL(JD.CrAmount,0)) AS Outstanding
INTO #Loan
FROM dbo.tbJournalDetails JD
JOIN dbo.tbJournalMaster JM ON JM.JournalID = JD.JournalID
WHERE ISNULL(JM.IsTrashed,0) = 0 AND JM.PostDate IS NOT NULL
  AND (@DocClassID IS NULL OR JM.DocClassID = @DocClassID)
  AND JD.GLID IN (90,91,92,94,99,103)
  AND (JM.VoucherNo = 'OB1' OR JM.JV_Date < DATEADD(day, 1, @To))
GROUP BY JD.SLID
HAVING SUM(ISNULL(JD.DrAmount,0) - ISNULL(JD.CrAmount,0)) > 0.5;

-- Due date = MaturityDate, else next unpaid installment date
;WITH Sch AS (
  SELECT E.SLID, E.EMIDate,
         SUM(E.Principal) OVER (PARTITION BY E.SLID ORDER BY E.SNo ROWS UNBOUNDED PRECEDING) AS CumPrin,
         SUM(E.Principal) OVER (PARTITION BY E.SLID) AS TotPrin
  FROM dbo.tbEMIDetails E WHERE E.SLID IN (SELECT SLID FROM #Loan)
)
SELECT L.SLID, L.Outstanding, ISNULL(SM.Closed,0) AS Closed,
       COALESCE(SM.MaturityDate,
                (SELECT MIN(S.EMIDate) FROM Sch S
                  WHERE S.SLID = L.SLID AND S.CumPrin > S.TotPrin - L.Outstanding + 1)) AS D
INTO #Due
FROM #Loan L LEFT JOIN dbo.tbSubLedgerMaster SM ON SM.SLID = L.SLID;

-- Closed loans are not delinquent
SELECT
  @Over12  = ISNULL(SUM(CASE WHEN D <  DATEADD(year,-1,@To) THEN Outstanding END),0),
  @Under12 = ISNULL(SUM(CASE WHEN D <  @To AND D >= DATEADD(year,-1,@To) THEN Outstanding END),0)
FROM #Due WHERE Closed = 0;

-- Membership
DECLARE @MemNew int, @MemPrev int;
SELECT @MemNew = COUNT(*)
FROM dbo.tbSubLedgerMaster SM
JOIN dbo.tbMemberMaster MM ON MM.MemberID = SM.MemberID
WHERE SM.GLID = 1 AND SM.ClosedDate IS NULL
  AND SM.AccountOpenDate <= @To
  AND MM.DOR >= @FYStart AND MM.DOR <= @To;
SELECT @MemPrev = COUNT(*) FROM dbo.tbSubLedgerMaster
 WHERE GLID = 1 AND AccountOpenDate < @Prev AND ClosedDate IS NULL;

CREATE TABLE #Map (GLID int, Line varchar(10));
INSERT #Map SELECT GLID,'LOAN'    FROM dbo.tbLedgerMaster WHERE GLID IN (90,91,92,94,99,103);
INSERT #Map SELECT GLID,'PROV'    FROM dbo.tbLedgerMaster WHERE GLID IN (7,10);
INSERT #Map SELECT GLID,'SAV'     FROM dbo.tbLedgerMaster WHERE GLID IN (12,15,16,20,21,22,23,24,25,26,27,28,29,30,96,203,225,230,240,241);
INSERT #Map SELECT GLID,'EXT'     FROM dbo.tbLedgerMaster WHERE GLID BETWEEN 31 AND 36;
INSERT #Map SELECT GLID,'SH'      FROM dbo.tbLedgerMaster WHERE GLID = 1;
INSERT #Map SELECT GLID,'IC'      FROM dbo.tbLedgerMaster WHERE GLID IN (2,4,5,6,8,9,227,236,237,238);
INSERT #Map SELECT GLID,'LIQINV'  FROM dbo.tbLedgerMaster WHERE GLID BETWEEN 82 AND 89;
INSERT #Map SELECT GLID,'FININV'  FROM dbo.tbLedgerMaster WHERE GLID IN (75,76);
INSERT #Map SELECT GLID,'CASH'    FROM dbo.tbLedgerMaster WHERE GLID = 56;
INSERT #Map SELECT GLID,'BANK'    FROM dbo.tbLedgerMaster WHERE GLID BETWEEN 57 AND 71;
INSERT #Map SELECT GLID,'FIXED'   FROM dbo.tbLedgerMaster WHERE GLID IN (107,128,129,130,131,132,133,134,135,136,137,138,139,140,141,209,210,211,212);
INSERT #Map SELECT GLID,'EXTCOST' FROM dbo.tbLedgerMaster WHERE GLID IN (177,178);
INSERT #Map SELECT GLID,'OPEX'    FROM dbo.tbLedgerMaster
  WHERE GLID BETWEEN 146 AND 176 OR GLID IN (179,180,204,205,206,207,214,215,220,221,234,250,252,253);
INSERT #Map SELECT GLID,'INCOME'  FROM dbo.tbLedgerMaster WHERE GLID BETWEEN 181 AND 199;
INSERT #Map SELECT GLID,'NZ'      FROM dbo.tbLedgerMaster
  WHERE GLID IN (2,3,4,5,6,7,8,9,10,11,15,96,208,217,227,236,237,238,240,
                 41,42,43,44,45,
                 46,47,48,49,50,51,52,53,54,55,200,201,213,232,248,249);
INSERT #Map SELECT GLID,'TA'      FROM dbo.tbLedgerMaster
  WHERE GLID BETWEEN 1 AND 55 OR GLID IN (96,200,201,203,208,213,217,225,227,230,232,236,237,238,240,241,248,249);
INSERT #Map SELECT GLID,'ASSET'   FROM dbo.tbLedgerMaster
  WHERE (GLID BETWEEN 56 AND 141 AND GLID <> 96)
     OR GLID IN (209,210,211,212,233,235,239,242,243,244,251);

SELECT JD.GLID,
  SUM(CASE WHEN JM.VoucherNo = 'OB1' OR JM.JV_Date < DATEADD(day, 1, @To)
           THEN ISNULL(JD.DrAmount,0) - ISNULL(JD.CrAmount,0) END) AS Cur,
  SUM(CASE WHEN JM.VoucherNo = 'OB1' OR JM.JV_Date < @FYStart
           THEN ISNULL(JD.DrAmount,0) - ISNULL(JD.CrAmount,0) END) AS Prev
INTO #Bal
FROM dbo.tbJournalDetails JD
JOIN dbo.tbJournalMaster JM ON JM.JournalID = JD.JournalID
WHERE ISNULL(JM.IsTrashed,0) = 0 AND JM.PostDate IS NOT NULL
  AND (@DocClassID IS NULL OR JM.DocClassID = @DocClassID)
GROUP BY JD.GLID;

SELECT m.Line,
  SUM(b.Cur)  * CASE WHEN m.Line IN ('PROV','SAV','EXT','SH','IC','TA','INCOME','NZ') THEN -1 ELSE 1 END AS Cur,
  SUM(b.Prev) * CASE WHEN m.Line IN ('PROV','SAV','EXT','SH','IC','TA','INCOME','NZ') THEN -1 ELSE 1 END AS Prev
INTO #T
FROM #Map m JOIN #Bal b ON b.GLID = m.GLID
GROUP BY m.Line;

SELECT
  Loan     = SUM(CASE WHEN Line='LOAN'    THEN Cur END),
  Prov     = SUM(CASE WHEN Line='PROV'    THEN Cur END),
  Sav      = SUM(CASE WHEN Line='SAV'     THEN Cur END),
  Ext      = SUM(CASE WHEN Line='EXT'     THEN Cur END),
  Sh       = SUM(CASE WHEN Line='SH'      THEN Cur END),
  IC       = SUM(CASE WHEN Line='IC'      THEN Cur END),
  LiqInv   = SUM(CASE WHEN Line='LIQINV'  THEN Cur END),
  FinInv   = ISNULL(SUM(CASE WHEN Line='FININV' THEN Cur END),0),
  Cash     = SUM(CASE WHEN Line='CASH'    THEN Cur END),
  Bank     = SUM(CASE WHEN Line='BANK'    THEN Cur END),
  Fixed    = SUM(CASE WHEN Line='FIXED'   THEN Cur END),
  ExtCost  = SUM(CASE WHEN Line='EXTCOST' THEN Cur END),
  Opex     = SUM(CASE WHEN Line='OPEX'    THEN Cur END),
  Inc      = SUM(CASE WHEN Line='INCOME'  THEN Cur END),
  NZ       = SUM(CASE WHEN Line='NZ'      THEN Cur END),
  TA       = SUM(CASE WHEN Line='TA'      THEN Cur END),
  LoanPrev = SUM(CASE WHEN Line='LOAN'    THEN Prev END),
  SavPrev  = SUM(CASE WHEN Line='SAV'     THEN Prev END),
  ExtPrev  = SUM(CASE WHEN Line='EXT'     THEN Prev END),
  TAPrev   = SUM(CASE WHEN Line='ASSET'   THEN Prev END),
  ShPrev   = SUM(CASE WHEN Line='SH'      THEN Prev END),
  ICPrev   = SUM(CASE WHEN Line='IC'      THEN Prev END)
INTO #V
FROM #T;

CREATE TABLE #Out (
  Section varchar(10), Ord int, Sector varchar(5), Title varchar(200), Standard varchar(50),
  Numerator dec(18,2), Denominator dec(18,2), Ratio dec(9,2));

-- Report rows
INSERT #Out
SELECT 'ROW', r.Ord, r.Sector, r.Title, r.Standard,
       CAST(r.Num AS dec(18,2)), CAST(r.Den AS dec(18,2)),
       CAST(100.0 * r.Num / NULLIF(r.Den,0) AS dec(9,2))
FROM #V v
CROSS APPLY (VALUES
 ( 1,'P','Protection',NULL,NULL,NULL),
 ( 2,'', 'Loan Losses Allowances For Greater than One Year Deliquent Loan','100',
        CASE WHEN v.Prov < @Over12 THEN v.Prov ELSE @Over12 END, @Over12),
 ( 3,'', 'Loan Losses Allowances For Upto One Year Deliquent Loan','35',
        CASE WHEN v.Prov-@Over12 <= 0 THEN 0
             WHEN v.Prov-@Over12 < @Under12 THEN v.Prov-@Over12 ELSE @Under12 END, @Under12),
 ( 4,'', 'Provision for Loan Loss','1',
        CASE WHEN v.Prov-@Over12-@Under12 > 0 THEN v.Prov-@Over12-@Under12 ELSE 0 END, v.Loan-@Over12-@Under12),
 ( 5,'E','Effective Financial Structure',NULL,NULL,NULL),
 ( 6,'', 'Net Loans','70-80%', v.Loan-@Over12-0.35*@Under12, v.TA),
 ( 7,'', 'Liquid Investment','upto 16%', v.LiqInv, v.TA),
 ( 8,'', 'Financial Investment','upto 2%', v.FinInv, v.TA),
 ( 9,'', 'Non-Financial Investment','upto 2%', 0, v.TA),
 (10,'', 'Saving Deposits','70-80%', v.Sav, v.TA),
 (11,'', 'External Credits','upto 5%', v.Ext, v.TA),
 (12,'', 'Member Shares','10-100%', v.Sh, v.TA),
 (13,'', 'Institutional Capital','10-100%', v.IC, v.TA),
 (14,'', 'Net Institutional Capital','10-100%', v.IC + v.Inc - v.Opex - v.ExtCost, v.TA),
 (15,'A','Asset Quality',NULL,NULL,NULL),
 (16,'', 'Total Loan Delinquency','upto 5%', @Over12+@Under12, v.Loan),
 (17,'', 'Non-Earning Assets','upto 5%', v.Fixed+v.Cash, v.TA),
 (18,'', 'Net Zero Cost Funds','From 200%', v.NZ, v.Fixed+v.Cash),
 (19,'R','Rates of Return and Cost',NULL,NULL,NULL),
 (20,'', 'Net Loan Income','Entrepreneurial Rate', 0, (v.Loan+v.LoanPrev)/2),
 (21,'', 'Financial Cost Saving Deposit','>Inflation Rate', 0, (v.Sav+v.SavPrev+v.ShPrev)/2),
 (22,'', 'Financial Cost External Credit','Market Rate', v.ExtCost, (v.Ext+v.ExtPrev)/2),
 (23,'', 'Financial Cost Member Share','Market Rate', 0, (v.Sh+v.ShPrev)/2),
 (24,'', 'Operating Expenses','upto 5%', v.Opex, (v.TA+v.TAPrev)/2),
 (25,'', 'Net Income','From 10%', 0.8*(v.Inc - v.Opex - v.ExtCost), (v.TA+v.TAPrev)/2),
 (26,'L','Liquid Asset',NULL,NULL,NULL),
 (27,'', 'Liquid Reserves','10 %', v.Cash+v.Bank+v.LiqInv, v.Sav),
 (28,'', 'Non-Earning Liquid Assets','<1%', v.Cash, v.TA),
 (29,'S','Sign of Growth',NULL,NULL,NULL),
 (30,'', 'Member Shares','upto 20%', v.Sh-v.ShPrev, v.ShPrev),
 (31,'', 'Institutional Capital','From 10%', v.IC-v.ICPrev, v.ICPrev),
 (32,'', 'Membership','From 15%', @MemNew, @MemPrev),
 (33,'', 'Total Assets','From Inflation+10%', v.TA-v.TAPrev, v.TAPrev)
) r(Ord, Sector, Title, Standard, Num, Den);

-- Balances behind the denominators (Numerator = as on date, Denominator = previous year-end)
INSERT #Out
SELECT 'BAL', b.Ord, '', b.Item, NULL, CAST(b.Cur AS dec(18,2)), CAST(b.Prev AS dec(18,2)), NULL
FROM #V v
CROSS APPLY (VALUES
 ( 1,'Total Assets (current = credit side, previous = asset side)', v.TA, v.TAPrev),
 ( 2,'Gross Loans',        v.Loan,   v.LoanPrev),
 ( 3,'Saving Deposits',    v.Sav,    v.SavPrev),
 ( 4,'External Credits',   v.Ext,    v.ExtPrev),
 ( 5,'Member Shares',      v.Sh,     v.ShPrev),
 ( 6,'Institutional Capital', v.IC,  v.ICPrev),
 ( 7,'Net Zero Cost Funds',v.NZ,     NULL),
 ( 8,'Fixed Assets',       v.Fixed,  NULL),
 ( 9,'Cash',               v.Cash,   NULL),
 (10,'Banks',              v.Bank,   NULL),
 (11,'Liquid Investments', v.LiqInv, NULL),
 (12,'Income (all)',       v.Inc,    NULL),
 (13,'Operating Expenses', v.Opex,   NULL),
 (14,'Financial Cost External Credit', v.ExtCost, NULL),
 (15,'Delinquent > 1 year',  @Over12,  NULL),
 (16,'Delinquent up to 1 year', @Under12, NULL)
) b(Ord, Item, Cur, Prev);

-- Data-quality flags (Numerator = count, Denominator = amount)
INSERT #Out VALUES
 ('QUALITY',1,'','ClosedLoansWithBalance',NULL,
   (SELECT COUNT(*) FROM #Due WHERE Closed = 1),
   (SELECT ISNULL(SUM(Outstanding),0) FROM #Due WHERE Closed = 1), NULL),
 ('QUALITY',2,'','LoansNoDueDate',NULL,
   (SELECT COUNT(*) FROM #Due WHERE Closed = 0 AND D IS NULL),
   (SELECT ISNULL(SUM(Outstanding),0) FROM #Due WHERE Closed = 0 AND D IS NULL), NULL),
 ('QUALITY',3,'','UnpostedVouchers',NULL,
   (SELECT COUNT(*) FROM dbo.tbJournalMaster
     WHERE ISNULL(IsTrashed,0) = 0 AND PostDate IS NULL AND JV_Date <= @To), 0, NULL),
 ('QUALITY',4,'','VouchersNoADDate',NULL,
   (SELECT COUNT(*) FROM dbo.tbJournalMaster
     WHERE ISNULL(IsTrashed,0) = 0 AND PostDate IS NOT NULL AND JV_Date IS NULL
       AND ISNULL(VoucherNo,'') <> 'OB1'), 0, NULL),
 ('QUALITY',5,'','ClosedFlagNoClosedDate',NULL,
   (SELECT COUNT(*) FROM dbo.tbSubLedgerMaster
     WHERE GLID = 1 AND ClosedDate IS NULL AND ISNULL(Closed,0) = 1), 0, NULL),
 ('QUALITY',6,'','SharesNoMemberId',NULL,
   (SELECT COUNT(*) FROM dbo.tbSubLedgerMaster
     WHERE GLID = 1 AND ClosedDate IS NULL AND MemberID IS NULL AND AccountOpenDate <= @To), 0, NULL);

SELECT Section, Ord, Sector, Title, Standard, Numerator, Denominator, Ratio
FROM #Out
ORDER BY CASE Section WHEN 'ROW' THEN 1 WHEN 'BAL' THEN 2 ELSE 3 END, Ord;
`;

module.exports = { PEARLS_SQL };