-- Create the first database (SAJILODB) database
CREATE DATABASE SAJILODB;
GO

USE SAJILODB;
GO

-- 1. tbFieldMaster
CREATE TABLE dbo.tbFieldMaster (
    FieldId INT,
    ModuleCode VARCHAR(50),
    FieldCaption VARCHAR(100),
    FieldCaptionNepali VARCHAR(255),
    FieldName VARCHAR(255),
    DataType CHAR(1),
    IsF BIT
);
GO

-- 2. tbLocalDate
CREATE TABLE dbo.tbLocalDate (
    M_date SMALLDATETIME,
    M_Miti VARCHAR(25)
);
GO

-- 3. tbLocalMonth
CREATE TABLE dbo.tbLocalMonth (
    No INT,
    LocalMonth VARCHAR(50)
);
GO

-- 4. tbOrgMaster
CREATE TABLE dbo.tbOrgMaster (
    OrgId INT,
    OrgName VARCHAR(100),
    OrgAlias VARCHAR(10),
    Address1 VARCHAR(50),
    Address2 VARCHAR(50),
    Phone1 VARCHAR(20),
    Phone2 VARCHAR(20),
    Fax VARCHAR(20),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    Status BIT,
    DBName VARCHAR(20),
    Drive CHAR(1),
    IncomeTaxNo VARCHAR(20),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO

-- 5. tbReportHitCount
CREATE TABLE dbo.tbReportHitCount (
    CountID INT,
    LoginID INT,
    ReportName VARCHAR(255),
    HitTime SMALLDATETIME,
    CloseTime SMALLDATETIME
);
GO

-- 6. tbRightMaster
CREATE TABLE dbo.tbRightMaster (
    RightId INT,
    RightName VARCHAR(50),
    RightDescription VARCHAR(100),
    SortOrder MONEY,
    DM VARCHAR(50),
    IsRoot BIT,
    ActionRight BIT,
    ParentRightID INT
);
GO

-- 7. tbShortcutDetails
CREATE TABLE dbo.tbShortcutDetails (
    DetailID INT,
    ShortcutID INT,
    ShortcutGroup VARCHAR(100),
    ShortcutCaption VARCHAR(255),
    ControlKey INT,
    ShortcutKey INT
);
GO

-- 8. tbShortcutMaster
CREATE TABLE dbo.tbShortcutMaster (
    ShortcutID INT,
    ShortcutName VARCHAR(255),
    ProcedureName VARCHAR(255),
    ProcedureIndex VARCHAR(100)
);
GO

-- 9. tbUserLog
CREATE TABLE dbo.tbUserLog (
    LoginID INT,
    UserID INT,
    OrgID INT,
    ComputerName VARCHAR(100),
    WinUserName VARCHAR(100),
    LoginDateTime SMALLDATETIME,
    LogoutDateTime SMALLDATETIME
);
GO

-- 10. tbUserMaster
CREATE TABLE dbo.tbUserMaster (
    UserID INT,
    UserName VARCHAR(50),
    Password VARCHAR(32),
    FullName VARCHAR(100),
    Designation VARCHAR(50),
    ValidFrom SMALLDATETIME,
    ValidTo SMALLDATETIME,
    Status BIT,
    Organization VARCHAR(2048),
    Remarks VARCHAR(1024),
    DocClassName VARCHAR(100),
    WithdrawLimit MONEY
);
GO

-- 11. tbUserRight
CREATE TABLE dbo.tbUserRight (
    UserId INT,
    RightId INT,
    Access BIT,
    NEW BIT,
    EDIT BIT,
    Del BIT,
    Cancel BIT
);
GO

-- 12. tbVersion
CREATE TABLE dbo.tbVersion (
    Version MONEY,
    OC MONEY,
    OD SMALLDATETIME
);
GO

-- 13. tbVoucherRights
CREATE TABLE dbo.tbVoucherRights (
    OrgID INT,
    UserID INT,
    VoucherID INT,
    Access BIT,
    NEW BIT,
    EDIT BIT,
    Del BIT
);
GO



-- Create the second database (Cha7081) database
CREATE DATABASE Cha7081;
GO

USE Cha7081;
GO

-- 1. OldJournals table
CREATE TABLE dbo.OldJournals (
    JournalID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    SLID INT,
    Narration VARCHAR(1024),
    Remarks VARCHAR(1024),
    DrAmount MONEY,
    CrAmount MONEY,
    JV_Date SMALLDATETIME,
    CreatedUserID INT,
    DocClassID INT,
    PostUserID INT,
    PostDate SMALLDATETIME,
    UDVNo INT,
    Type VARCHAR(2) NOT NULL,
    VoucherNo VARCHAR(25) NOT NULL,
    ChequeNo VARCHAR(25) NOT NULL,
    ChequeDate SMALLDATETIME,
    DraweePayee VARCHAR(50),
    JV_Time SMALLDATETIME,
    DBName VARCHAR(11) NOT NULL
);
GO
-- 2. tbAccountCollateralDetails table
CREATE TABLE dbo.tbAccountCollateralDetails (
    CollatoralID INT PRIMARY KEY IDENTITY(1,1),
    SLID INT,
    SLIDCol INT,
    SNo INT,
    Amount MONEY
);
GO
-- 3. tbAccountRenew table
CREATE TABLE dbo.tbAccountRenew (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    RenewDate SMALLDATETIME,
    MemberID INT,
    GLID INT,
    SLIDOld INT,
    SLIDNew INT,
    Amount FLOAT
);
GO
-- 4. tbAdjustmentDetails table
CREATE TABLE dbo.tbAdjustmentDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    AdjustmentID INT,
    ProductId INT,
    Sign CHAR(1),
    Batch VARCHAR(10) NOT NULL,
    Rate MONEY NOT NULL,
    Quantity MONEY NOT NULL,
    GodownID INT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 5. tbAdjustmentMaster table
CREATE TABLE dbo.tbAdjustmentMaster (
    AdjustmentId INT PRIMARY KEY IDENTITY(1,1),
    AdjustmentNo VARCHAR(25),
    Date SMALLDATETIME,
    Cause VARCHAR(50),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 6. tbAreaMaster table
CREATE TABLE dbo.tbAreaMaster (
    AreaID INT PRIMARY KEY IDENTITY(1,1),
    AreaName VARCHAR(50),
    AreaAlias VARCHAR(10),
    Remarks VARCHAR(1024),
    Address VARCHAR(100),
    ContactPerson VARCHAR(100),
    Phone VARCHAR(100)
);
GO
-- 7. tbAutoNumberSetting table
CREATE TABLE dbo.tbAutoNumberSetting (
    VoucherId INT,
    Category VARCHAR(50),
    StartDate SMALLDATETIME,
    EndDate SMALLDATETIME,
    Prefix VARCHAR(15),
    Suffix VARCHAR(15),
    StartFrom INT,
    EndTo INT,
    BodyLength INT,
    FillChar CHAR(1)
);
GO
-- 8. tbBTDetails table
CREATE TABLE dbo.tbBTDetails (
    BTID INT PRIMARY KEY IDENTITY(1,1),
    Module VARCHAR(25),
    [Document] INT,
    SLNo INT,
    Percentage MONEY NOT NULL,
    Amount MONEY NOT NULL
);
GO
-- 9. tbBTMaster table
CREATE TABLE dbo.tbBTMaster (
    BTId INT PRIMARY KEY IDENTITY(1,1),
    BTName VARCHAR(50),
    BTCode VARCHAR(25),
    Formula VARCHAR(1024),
    Module VARCHAR(25),
    GLID INT,
    BTSign CHAR(1),
    Percentage MONEY NOT NULL,
    SortOrder INT NOT NULL,
    Status BIT NOT NULL,
    ItemWise BIT NOT NULL,
    Supress BIT NOT NULL,
    Remarks VARCHAR(1024)
);
GO
-- 10. tbChalanMaster table
CREATE TABLE dbo.tbChalanMaster (
    ChalanID INT PRIMARY KEY IDENTITY(1,1),
    DocumentNo VARCHAR(25) NOT NULL,
    DocumentDate SMALLDATETIME,
    LetterNumber VARCHAR(50),
    ReceiverName VARCHAR(100),
    Subject VARCHAR(100),
    PostalNumber VARCHAR(50),
    IdentityNumber VARCHAR(50),
    ChalanDateTime VARCHAR(50),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT,
    EntryType VARCHAR(50),
    SLID INT
);
GO
-- 11. tbChequeIssueDetails table
CREATE TABLE dbo.tbChequeIssueDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    ChequeIssueID INT,
    Sno INT,
    ChequeNo VARCHAR(25),
    Locked BIT
);
GO
-- 12. tbChequeIssueMaster table
CREATE TABLE dbo.tbChequeIssueMaster (
    ChequeIssueID INT PRIMARY KEY IDENTITY(1,1),
    SLID INT,
    IssueDate SMALLDATETIME,
    TotalCheque INT,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    ChequeNoFrom VARCHAR(25),
    ChequeNoTo VARCHAR(25)
);
GO
-- 13. tbClosedDay table
CREATE TABLE dbo.tbClosedDay (
    ClosedDate SMALLDATETIME
);
GO
-- 14. tbCollectionChequeMaster table
CREATE TABLE dbo.tbCollectionChequeMaster (
    CollectionChequeID INT PRIMARY KEY IDENTITY(1,1)        ,
    TransactionNo VARCHAR(25),
    GLID INT,
    SLID INT,
    GLIDDraweeBank INT,
    ChequeNo VARCHAR(25),
    ChequeDate SMALLDATETIME,
    DraweeBankBranch VARCHAR(25),
    FundSource VARCHAR(1024),
    TransactionDate SMALLDATETIME,
    Collected BIT,
    Posted BIT,
    CollectedDate SMALLDATETIME,
    Amount MONEY,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    DocClassID INT
);
GO
-- 15. tbCollectionVoucherSummary table
CREATE TABLE dbo.tbCollectionVoucherSummary (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    SLID INT,
    DrAmount MONEY,
    CrAmount MONEY
);
GO
-- 16. tbCollectorMaster table
CREATE TABLE dbo.tbCollectorMaster (
    CollectorID INT PRIMARY KEY IDENTITY(1,1),
    CollectorName VARCHAR(50),
    CollectorAlias VARCHAR(25),
    Address1 VARCHAR(25),
    Address2 VARCHAR(25),
    Phone1 VARCHAR(15),
    Phone2 VARCHAR(15),
    Fax VARCHAR(25),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    IncomeTaxNo VARCHAR(20),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    CommissionPercent MONEY,
    InActive BIT
);
GO
-- 17. tbCompanyMaster table
CREATE TABLE dbo.tbCompanyMaster (
    CompanyID INT PRIMARY KEY IDENTITY(1,1),
    CompanyName VARCHAR(50),
    CompanyAlias VARCHAR(25),
    Address1 VARCHAR(25),
    Address2 VARCHAR(25),
    Phone1 VARCHAR(15),
    Phone2 VARCHAR(15),
    Fax VARCHAR(25),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    IncomeTaxNo VARCHAR(20),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
-- 18. tbComplainMaster table
CREATE TABLE dbo.tbComplainMaster (
    ComplainID INT PRIMARY KEY IDENTITY(1,1),
    DocumentNo VARCHAR(25) NOT NULL,
    DocumentDate SMALLDATETIME,
    SolutionType VARCHAR(50),
    SolutionDate SMALLDATETIME,
    AreaID INT,
    SLID INT,
    Problem VARCHAR(250),
    Phone VARCHAR(50),
    Amount MONEY,
    Solved BIT,
    Worker VARCHAR(100),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 19. tbCostCenterMaster table
CREATE TABLE dbo.tbCostCenterMaster (
    CostCenterID INT PRIMARY KEY IDENTITY(1,1),
    CostCenterName VARCHAR(50),
    CostCenterAlias VARCHAR(10),
    Remarks VARCHAR(1024)
);

GO
-- 20. tbDayCloseLog table
CREATE TABLE dbo.tbDayCloseLog (
    RecordID INT PRIMARY KEY IDENTITY(1,1),
    ClosedOpenedDate SMALLDATETIME,
    CloseOpenType VARCHAR(25),
    CloseOpenUserID INT,
    CloseOpenDateTime SMALLDATETIME
);
GO
-- 21. tbDaywiseAccountBalance table
CREATE TABLE dbo.tbDaywiseAccountBalance (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    BalanceDate SMALLDATETIME,
    SLID INT,
    Balance FLOAT,
    Interest FLOAT
);
GO
-- 22. tbDeletedJournalDetails table
CREATE TABLE dbo.tbDeletedJournalDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    JournalID INT,
    SNo INT,
    GLID INT,
    GLIDMain INT,
    SLID INT,
    Narration VARCHAR(1024),
    DrAmount MONEY,
    CrAmount MONEY,
    ChequeNo VARCHAR(25),
    ChequeDate SMALLDATETIME,
    CashDate SMALLDATETIME,
    DraweePayee VARCHAR(50),
    Single BIT,
    NotCapital BIT
);
GO
-- 23. tbDeletedJournalMaster table
CREATE TABLE dbo.tbDeletedJournalMaster (
    JournalID INT PRIMARY KEY IDENTITY(1,1),
    VoucherNo VARCHAR(25) NOT NULL,
    SLIDPR INT,
    Rebate MONEY,
    Penalty MONEY,
    FundSource VARCHAR(100),
    DepositedBy VARCHAR(100),
    TransType VARCHAR(100),
    DepositedByContact VARCHAR(100),
    JV_Date SMALLDATETIME,
    ReceivedTill SMALLDATETIME,
    ReceivedTillInterest SMALLDATETIME,
    InterestAmount MONEY,
    JV_Miti VARCHAR(10),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    PostUserID INT,
    PostDate SMALLDATETIME,
    CheckUserID INT,
    CheckDate SMALLDATETIME,
    ApprovedUserID INT,
    ApprovedDate SMALLDATETIME,
    UDVNo VARCHAR(25),
    Prov INT,
    DocClassID INT,
    Auto BIT,
    AutoModule INT,
    MemberID INT,
    CollectorID INT,
    DeletedUserID INT,
    DeletedDate SMALLDATETIME
);
GO
-- 24. tbDenominationMaster table
CREATE TABLE dbo.tbDenominationMaster (
    DenominationID INT PRIMARY KEY IDENTITY(1,1),
    Denomination INT,
    Description VARCHAR(50)
);
GO
-- 25. tbDistrictMaster table
CREATE TABLE dbo.tbDistrictMaster (
    DistrictID INT PRIMARY KEY IDENTITY(1,1),
    District VARCHAR(100),
    Alias VARCHAR(25)
);
GO
--26. tbDividendDistributionDetails table
CREATE TABLE dbo.tbDividendDistributionDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    DistributionID INT,
    Sno INT,
    MemberID INT,
    SLID INT,
    Amount MONEY,
    Tax MONEY,
    NetAmount MONEY
);
GO
-- 27. tbDividendDistributionMaster table
CREATE TABLE dbo.tbDividendDistributionMaster (
    DistributionID INT PRIMARY KEY IDENTITY(1,1),
    JournalID INT,
    DistributionType VARCHAR(50),
    TransactionDate SMALLDATETIME,
    GLID INT,
    GLIDSaving INT,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
-- 28. tbDocAdjMaster table
CREATE TABLE dbo.tbDocAdjMaster (
    DocAdjID INT PRIMARY KEY IDENTITY(1,1) ,
    SNo INT,
    AdjDate SMALLDATETIME,
    JournalID INT,
    JVAmount MONEY,
    ModuleCode VARCHAR(25),
    DocID INT,
    DocAmount MONEY,
    Remarks VARCHAR(1024)
);
GO
-- 29. tbDocClassMaster table
CREATE TABLE dbo.tbDocClassMaster (
    DocClassID INT PRIMARY KEY IDENTITY(1,1),
    DocClassName VARCHAR(50),
    DocClassAlias VARCHAR(25),
    Address1 VARCHAR(25),
    Address2 VARCHAR(25),
    Phone1 VARCHAR(15),
    Phone2 VARCHAR(15),
    Fax VARCHAR(25),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    IncomeTaxNo VARCHAR(20),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
-- 30. tbDocDetails table
CREATE TABLE dbo.tbDocDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1) ,
    DocID INT,
    FieldID INT,
    UDFID INT,
    BTID INT,
    SubjectID INT,
    ExamID INT,
    Section VARCHAR(25),
    Caption VARCHAR(255),
    FontName VARCHAR(50),
    FontSize INT,
    FontBold BIT,
    FontItalic BIT,
    FontUnderline BIT,
    ForeColor VARCHAR(100),
    Format VARCHAR(50),
    Supress BIT,
    TermType CHAR(1),
    MarkType VARCHAR(10),
    Align CHAR(1),
    X INT,
    Y INT,
    Width INT,
    Height INT,
    AutoSize BIT,
    FieldType VARCHAR(25)
);
GO
-- 31. tbDocDetailsPhoto table
CREATE TABLE dbo.tbDocDetailsPhoto (
    PhotoID INT PRIMARY KEY IDENTITY(1,1),
    DetailID INT,
    Photo IMAGE
);
GO
-- 32. tbDocMaster table
CREATE TABLE dbo.tbDocMaster (
    DocID INT PRIMARY KEY IDENTITY(1,1),
    ModuleCode VARCHAR(25),
    Name VARCHAR(100),
    HHeight MONEY,
    DHeight MONEY,
    FHeight MONEY,
    DetailLength INT,
    PrintOnline BIT,
    MarkSheet BIT,
    Remarks VARCHAR(1024),
    SupressCashBank BIT,
    SupressAutoRows BIT
);
GO
-- 33. tbEMIDetails table
CREATE TABLE dbo.tbEMIDetails (
    EMIID INT PRIMARY KEY IDENTITY(1,1),
    SLID INT,
    SNo INT,
    EMIDate SMALLDATETIME,
    Principal MONEY,
    Interest MONEY,
    Balance MONEY,
    PrincipalPaid MONEY,
    InterestPaid MONEY
);
GO
-- 34. tbFiscalYearMaster table
CREATE TABLE dbo.tbFiscalYearMaster (
    YearID INT PRIMARY KEY IDENTITY(1,1),
    TransactionStartDate SMALLDATETIME,
    StartDate SMALLDATETIME,
    EndDate SMALLDATETIME,
    CurrentFiscal BIT,
    Remarks VARCHAR(1024),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME
);
GO
-- 35. tbFormulaDetails table
CREATE TABLE dbo.tbFormulaDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    FormulaID INT,
    ProductId INT,
    Batch VARCHAR(10),
    Rate MONEY,
    Quantity MONEY,
    GodownID INT,
    ByProduct BIT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 36. tbFormulaMaster table
CREATE TABLE dbo.tbFormulaMaster (
    FormulaId INT PRIMARY KEY IDENTITY(1,1),
    FormulaName VARCHAR(50),
    Date SMALLDATETIME,
    Quantity MONEY,
    ProductID INT,
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT
);
GO
-- 37. tbGodownMaster table
CREATE TABLE dbo.tbGodownMaster (
    GodownID INT PRIMARY KEY IDENTITY(1,1),
    GodownName VARCHAR(50),
    GodownAlias VARCHAR(25),
    Address1 VARCHAR(25),
    Address2 VARCHAR(25),
    Phone1 VARCHAR(15),
    Phone2 VARCHAR(15),
    Fax VARCHAR(25),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    IncomeTaxNo VARCHAR(20),
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
-- 38. tbInterestCalculationMethods table
CREATE TABLE dbo.tbInterestCalculationMethods (
    MethodID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    EffectiveDate SMALLDATETIME,
    InterestMethod VARCHAR(50),
    Taxable BIT,
    IgnoreAcOpenedMonth BIT,
    TaxRate MONEY,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
-- 39. tbInterestCalculationMethodsDetails table
CREATE TABLE dbo.tbInterestCalculationMethodsDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    MethodID INT,
    Sno INT,
    FromBalance MONEY,
    ToBalance MONEY,
    InterestRate MONEY
);
GO
-- 40. tbInterestProvisionDetails table
CREATE TABLE dbo.tbInterestProvisionDetails (
    InterestID INT PRIMARY KEY IDENTITY(1,1),
    TillDate SMALldatetime,
    CalculationDate SMALldatetime,
    SLID INT,
    InterestAmount MONEY,
    JournalID INT,
    CalculatedInterestAmount MONEY
);
GO
-- 41. tbIssueDetails table
CREATE TABLE dbo.tbIssueDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    IssueID INT,
    ProductId INT,
    Batch VARCHAR(10),
    Rate MONEY,
    Quantity MONEY,
    GodownID INT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 42. tbIssueMaster table
CREATE TABLE dbo.tbIssueMaster (
    IssueId INT PRIMARY KEY IDENTITY(1,1),
    IssueNo VARCHAR(25),
    FormulaID INT,
    Date SMALldatetime,
    CostCenterID INT,
    CreatedDate SMALldatetime,
    CreatedUserID INT,
    ModifiedDate SMALldatetime,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 43. tbIssueReturnDetails table
CREATE TABLE dbo.tbIssueReturnDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    IssueReturnID INT,
    ProductId INT,
    Batch VARCHAR(10),
    Rate MONEY,
    Quantity MONEY,
    GodownID INT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 44. tbIssueReturnMaster table
CREATE TABLE dbo.tbIssueReturnMaster (
    IssueReturnId INT PRIMARY KEY IDENTITY(1,1),
    ReturnNo VARCHAR(25),
    Date SMALLDATETIME,
    CostCenterID INT,
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 45. tbJournal table
CREATE TABLE dbo.tbJournal (
    Type VARCHAR(2),
    Single BIT,
    JournalID INT PRIMARY KEY IDENTITY(1,1),
    VoucherNo VARCHAR(25) NOT NULL,
    JV_Date SMALLDATETIME,
    JV_Time SMALLDATETIME,
    JV_Miti VARCHAR(10),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    PostUserID INT,
    PostDate SMALLDATETIME,
    UDVNo INT,
    Prov BIT,
    SNo INT,
    GLID INT,
    SLID INT,
    Narration VARCHAR(1024),
    DrAmount MONEY,
    CrAmount MONEY,
    ChequeNo VARCHAR(25) NOT NULL,
    ChequeDate SMALLDATETIME,
    CashDate SMALLDATETIME,
    DraweePayee VARCHAR(50),
    DocClassID INT,
    CollectorID INT,
    NotCapital BIT
);
GO
-- 46. tbJournalDenomination table
CREATE TABLE dbo.tbJournalDenomination (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    JournalID INT,
    DenominationID INT,
    Nos INT
);
GO
-- 47. tbJournalDetails table
CREATE TABLE dbo.tbJournalDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    JournalID INT,
    SNo INT,
    GLID INT,
    GLIDMain INT,
    SLID INT,
    Narration VARCHAR(1024),
    DrAmount MONEY,
    CrAmount MONEY,
    ChequeNo VARCHAR(25),
    ChequeDate SMALldatetime,
    CashDate SMALldatetime,
    DraweePayee VARCHAR(50),
    Single BIT,
    NotCapital BIT,
    GLIDLoanDC INT,
    SLIDLoanDC INT,
    MemberIDDC INT,
    LoanAmountDC MONEY,
    LoanInterestDC MONEY,
    NotCapitalDC BIT,
    AutoRow BIT,
    Rebate_D MONEY,
    Penalty_D MONEY,
    ReceivedTill_D MONEY,
    ReceivedTillInterest_D MONEY,
    DrInterest MONEY,
    CrInterest MONEY
);
GO
-- 48. tbJournalMaster table
CREATE TABLE dbo.tbJournalMaster (
    JournalID INT PRIMARY KEY IDENTITY(1,1),
    VoucherNo VARCHAR(25) NOT NULL,
    SLIDPR INT,
    Rebate MONEY,
    Penalty MONEY,
    FundSource VARCHAR(100),
    DepositedBy VARCHAR(100),
    TransType VARCHAR(100),
    DepositedByContact VARCHAR(100),
    JV_Date SMALldatetime,
    ReceivedTill MONEY,
    ReceivedTillInterest MONEY,
    InterestAmount MONEY,
    JV_Miti VARCHAR(10),
    CreatedDate SMALldatetime,
    CreatedUserID INT,
    ModifiedDate SMALldatetime,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    PostUserID INT,
    PostDate SMALldatetime,
    CheckUserID INT,
    CheckDate SMALldatetime,
    ApprovedUserID INT,
    ApprovedDate SMALldatetime,
    UDVNo VARCHAR(25),
    Prov INT,
    DocClassID INT,
    Auto BIT,
    AutoModule BIT,
    MemberID INT,
    CollectorID INT,
    GLIDCashDC INT,
    TotalAmountDC MONEY,
    SuspiciousTransaction BIT,
    BillingID INT,
    TenderAmount MONEY,
    RefundAmount MONEY,
    ReceivedAmount MONEY,
    DraweePayeeForSMS VARCHAR(50)
);
GO
-- 49. tbJournalUnitBillingDetails table
CREATE TABLE dbo.tbJournalUnitBillingDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    JournalID INT,
    BillingID INT,
    SNo INT,
    BillMonthYear VARCHAR(25),
    RebPen VARCHAR(25),
    BillDate SMALldatetime,
    RebPenRate MONEY,
    RebPenAmount MONEY,
    BillAmount MONEY,
    PayableAmount MONEY,
    ServiceCharge MONEY,
    DemandCharge MONEY
);
GO
-- 50. tbLedgerGroup table
CREATE TABLE dbo.tbLedgerGroup (
    LgrGrpID INT PRIMARY KEY IDENTITY(1,1),
    GrpName VARCHAR(50),
    GrpAlias VARCHAR(10),
    AltAlias VARCHAR(10),
    MGrpID INT,
    Remarks VARCHAR(1024),
    IEAL CHAR(1),
    GrpCategory VARCHAR(100)
);

GO
-- 51. tbLedgerMaster table
CREATE TABLE dbo.tbLedgerMaster (
    GLID INT PRIMARY KEY IDENTITY(1,1),
    GLName VARCHAR(255),
    GlAlias VARCHAR(10),
    AltAlias VARCHAR(10),
    Category VARCHAR(25) NOT NULL,
    Address1 VARCHAR(50),
    Address2 VARCHAR(50),
    Phone1 VARCHAR(50),
    Phone2 VARCHAR(50),
    Fax VARCHAR(50),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    InterestRate MONEY,
    IncomeTaxNo VARCHAR(20),
    LgrGrpID INT,
    LgrSubGrpID INT,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    SavingorLoan VARCHAR(50),
    ValidFrom SMALLDATETIME,
    ValidTo SMALLDATETIME,
    Schedule VARCHAR(50),
    UseOpenTimeInterateRateAlways BIT,
    CapitalizePenaltyAfterDays BIT,
    Duration INT,
    Collateralable BIT,
    ChequeIssue BIT,
    PenaltyRebateBasedOnPaymentDay BIT,
    OverDraft BIT,
    OverDraftAmount MONEY,
    Penalty MONEY,
    InstallmentDay INT,
    MinBalanceDrawable MONEY,
    MinBalance MONEY,
    InterestCapitalized BIT,
    GLIDTransfer INT,
    PreNoticeonWithdraw BIT,
    PreNoticeAmount MONEY,
    PreNoticeDays INT,
    Installments INT,
    PenaltyonInstallment BIT,
    RebatePenaltyBasedonInterestPostDate BIT,
    PenaltyonInterest BIT,
    Revolving BIT,
    MaxLoanAmount MONEY,
    EMIScheme BIT,
    ANPrefix VARCHAR(50),
    ANSuffix VARCHAR(15),
    ANStartFrom INT,
    ANEndTo INT,
    ANBodyLength INT,
    ANFillChar CHAR(1),
    GLIDInterestTransfer INT,
    NatureofAccount VARCHAR(100),
    PearlsSetting VARCHAR(255),
    MaturityDate SMALLDATETIME,
    PenaltyBasedOnTotalDuePrincipal BIT,
    ConvertAge BIT,
    ConvertAcDuration INT,
    GLIDConvertTo INT,
    AreaID INT,
    SMSCharge MONEY
);
GO
-- 52. tbLedgerSubGroup table
CREATE TABLE dbo.tbLedgerSubGroup (
    LgrSubGrpID INT PRIMARY KEY IDENTITY(1,1),
    SubGrpName VARCHAR(50),
    SubGrpAlias VARCHAR(10),
    AltAlias VARCHAR(10),
    LgrGrpID INT,
    Remarks VARCHAR(1024),
    IEAL CHAR(1),
    DepreciationPercent MONEY
);
GO
-- 53. tblisolog table
CREATE TABLE dbo.tblisolog (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RequestMTI CHAR(4),
    ProcessCode CHAR(6),
    ISOTxnDateTime VARCHAR(10),
    TraceNo VARCHAR(6),
    RRNo VARCHAR(12),
    DebitBranchId CHAR(3),
    DebitAccount VARCHAR(12),
    CreditBranchId CHAR(3),
    CreditAccountNo VARCHAR(12),
    ResponseMTI CHAR(4),
    ResponseCode CHAR(2),
    Remarks1 VARCHAR(200),
    Remarks2 VARCHAR(200),
    TxnDate DATETIME,
    ResponseDescription VARCHAR(100)
);
GO
-- 54. tblresponsecode table
CREATE TABLE dbo.tblresponsecode (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ResponseCode CHAR(2),
    ResponseDesc VARCHAR(100)
);
GO
-- 55. tbMemberKYM table
CREATE TABLE dbo.tbMemberKYM (
    MemberIDKYM INT PRIMARY KEY IDENTITY(1,1),
    KYM_MemberAlias VARCHAR(25),
    KYM_MemberName VARCHAR(50),
    KYM_DocumentNo VARCHAR(50),
    KYM_DateOfBirth SMALldatetime,
    KYM_DocumentIssueAddress VARCHAR(50),
    KYM_Sex VARCHAR(10),
    MotherName VARCHAR(100),
    KYM_FatherName VARCHAR(100),
    MaritalStatus VARCHAR(100),
    SpouseName VARCHAR(100),
    FamilyType VARCHAR(100),
    Profession VARCHAR(100),
    ProfessionOther VARCHAR(100),
    KYM_PAN VARCHAR(20),
    SpouseProfession VARCHAR(100),
    SpouseProfessionOther VARCHAR(100),
    OtherEarningRelation VARCHAR(100),
    OtherEarningProfession VARCHAR(100),
    OtherEarningProfessionOther VARCHAR(100),
    FamilyMemberatHighRank VARCHAR(100),
    FamilyMemberatHighRankName VARCHAR(100),
    FamilyMemberatHighRankRelation VARCHAR(100),
    FamilyMemberatHighRankPosition VARCHAR(100),
    TState VARCHAR(10),
    KYM_TDistrict VARCHAR(10),
    KYM_TVDC VARCHAR(10),
    KYM_TWardNo VARCHAR(50),
    KYM_TAddress VARCHAR(50),
    KYM_TContactNumber VARCHAR(50),
    THouseNo VARCHAR(50),
    PState VARCHAR(100),
    KYM_PDistrict VARCHAR(50),
    KYM_PVDC VARCHAR(50),
    KYM_PWardNo VARCHAR(50),
    KYM_PAddress VARCHAR(50),
    KYM_PContactNumber VARCHAR(50),
    PHouseNo VARCHAR(50),
    EmailID VARCHAR(100),
    OrgWorkAreaResidence VARCHAR(100),
    VoterIDNo VARCHAR(50),
    VotingBooth VARCHAR(50),
    DurationofStayatWorkPlace VARCHAR(50),
    PassportNo VARCHAR(50),
    PurposeofMembership VARCHAR(50),
    MemberatOtherSACOS INT,
    FamilyMemberInvolvedinOtherSACOS VARCHAR(100),
    MultiSACOSReasonSelf VARCHAR(100),
    MultiSACOSReasonFamilyMember VARCHAR(100),
    FamilyMemberinThisSACOS VARCHAR(100),
    FamilyIncomeYearly MONEY,
    IncomeAgriculture MONEY,
    IncomeBusiness MONEY,
    IncomeEmployment MONEY,
    IncomeForeignEmployment MONEY,
    IncomeDescription VARCHAR(100),
    IncomeOther MONEY,
    ShareAmount MONEY,
    SavingAmount MONEY,
    OtherAmountName VARCHAR(100),
    OtherAmount MONEY,
    AnnualNoofTransaction INT,
    AnnualAmountofTransaction MONEY,
    OrgLoanSavingEstimate MONEY,
    UpdatedDate SMALldatetime,
    UpdatedBy VARCHAR(50),
    KYM_CreatedBy INT,
    KYM_CreatedDateTime SMALldatetime,
    KYM_LastSavedBy INT,
    KYM_LastSavedDateTime SMALldatetime,
    KYM_Remarks VARCHAR(1024),
    OrgRenewDate SMALldatetime,
    OrgPurpose VARCHAR(255),
    OrgBusinessType VARCHAR(255),
    OrgWorkArea VARCHAR(255),
    OrgNumberofBranch INT,
    OrgLocationofBranch VARCHAR(255),
    OrgMemorandom VARCHAR(255),
    OrgYearlyAnnualTransaction MONEY,
    OrgLastTransactionFinancialDetail VARCHAR(100),
    OrgTaxClearance VARCHAR(100),
    OrgKYMofCEO VARCHAR(100),
    OrgDecisionofCommittee VARCHAR(100)
);
GO
-- 56. tbMemberKYMDetailsFamilyMemberonOther table
CREATE TABLE dbo.tbMemberKYMDetailsFamilyMemberonOther (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    MemberIDKYM INT,
    OrgName VARCHAR(100),
    MembershipNo VARCHAR(25)
);
GO
-- 57. tbMemberKYMDetailsFamilyMemberonThis table
CREATE TABLE dbo.tbMemberKYMDetailsFamilyMemberonThis (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    MemberIDKYM INT,
    MemberID INT
);
GO
-- 58. tbMemberKYMDetailsSelfMemberonOther table
CREATE TABLE dbo.tbMemberKYMDetailsSelfMemberonOther (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    MemberIDKYM INT,
    OrgName VARCHAR(100),
    MembershipNo VARCHAR(25)
);
GO
-- 59. tbMemberMaster table
CREATE TABLE dbo.tbMemberMaster (
    MemberID INT PRIMARY KEY IDENTITY(1,1),
    MemberType VARCHAR(25),
    MemberName VARCHAR(50),
    MemberAlias VARCHAR(25),
    AltAlias VARCHAR(10),
    ProfessionID INT,
    QualificationID INT,
    Address1 VARCHAR(25),
    Address2 VARCHAR(25),
    Phone1 VARCHAR(15),
    Phone2 VARCHAR(15),
    Fax VARCHAR(25),
    Email VARCHAR(100),
    Pan VARCHAR(20),
    IncomeTaxNo VARCHAR(20),
    ContactPerson VARCHAR(50),
    DOR SMALLDATETIME,
    Age VARCHAR(25),
    Sex VARCHAR(10),
    Status VARCHAR(25),
    DateOfBirth SMALLDATETIME,
    TDistrict VARCHAR(50),
    TVDC VARCHAR(50),
    TWardNo INT,
    TAddress VARCHAR(100),
    TContactNumber VARCHAR(50),
    PDistrict VARCHAR(50),
    PVDC VARCHAR(50),
    PWardNo INT,
    PAddress VARCHAR(100),
    PContactNumber VARCHAR(50),
    GuardianRelation VARCHAR(50),
    FatherName VARCHAR(50),
    GrandFatherName VARCHAR(50),
    FatherAddress VARCHAR(100),
    FatherContactNumber VARCHAR(100),
    NextofKinName VARCHAR(150),
    NextofKinAddress VARCHAR(50),
    NextofKinContactNumber VARCHAR(100),
    Relation VARCHAR(150),
    DocumentType VARCHAR(50),
    DocumentNo VARCHAR(50),
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    DocClassID INT,
    MemberIDIntroducedBy1 INT,
    MemberIDIntroducedBy2 INT,
    Mobile VARCHAR(50),
    AltMemberName VARCHAR(50),
    DocumentIssueDate SMALLDATETIME,
    DocumentIssueAddress VARCHAR(50),
    LeftDate SMALLDATETIME
);
GO
-- 60. tbMemberPhoto table
CREATE TABLE dbo.tbMemberPhoto (
    MemberID INT PRIMARY KEY ,
    Photo IMAGE,
    Sign1 IMAGE,
    Sign2 IMAGE,
    Sign3 IMAGE,
    Sign4 IMAGE
);
GO
-- 61. tbMergedBillDetails table
CREATE TABLE dbo.tbMergedBillDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    BillID INT,
    SNo INT,
    Particular VARCHAR(255),
    SLID INT,
    Amount MONEY,
    JournalID INT,
    IsPrincipal BIT,
    IsInterest BIT
);
GO
-- 62. tbMergedBillMaster table
CREATE TABLE dbo.tbMergedBillMaster (
    BillID INT PRIMARY KEY IDENTITY(1,1),
    BillNo INT,
    BillDate SMALLDATETIME,
    MemberID INT,
    SLID INT,
    Remarks VARCHAR(1024)
);
GO
-- 63. tbMobileAlertSetting table
CREATE TABLE dbo.tbMobileAlertSetting (
    AlertID INT PRIMARY KEY IDENTITY(1,1),
    SLID INT,
    EffectiveDate SMALLDATETIME,
    AlertonWithdraw BIT,
    AlertonWithdrawAmount MONEY,
    AlertonDeposit BIT,
    AlertonDepositAmount MONEY,
    AlertonScheduleDate BIT,
    AlertonFixedMaturity BIT,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    RenewDate SMALLDATETIME,
    ExpiryDate SMALLDATETIME
);
GO
-- 64. tbNarrationMaster table
CREATE TABLE dbo.tbNarrationMaster (
    NarrationID INT PRIMARY KEY IDENTITY(1,1),
    Narration VARCHAR(1024)
);
GO
-- 65. tbOldDatabases table
CREATE TABLE dbo.tbOldDatabases (
    DBID INT PRIMARY KEY IDENTITY(1,1),
    DBName VARCHAR(50),
    SNo INT,
    OrgID INT
);
GO
-- 66. tbOpeningBalanceMaster table
CREATE TABLE dbo.tbOpeningBalanceMaster (
    OpeningBalanceID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    SLID INT,
    DrCr VARCHAR(50),
    Amount MONEY,
    Interest MONEY,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024),
    DocClassID INT
);
GO
-- 67. tbOtherAutoNumberSetting table
CREATE TABLE dbo.tbOtherAutoNumberSetting (
    Module VARCHAR(50),
    Category VARCHAR(50),
    StartDate SMALLDATETIME,
    EndDate SMALLDATETIME,
    Prefix VARCHAR(15),
    Suffix VARCHAR(15),
    StartFrom INT,
    EndTo INT,
    BodyLength INT,
    FillChar CHAR(1)
);

GO
-- 68. tbPartywiseProduct table
CREATE TABLE dbo.tbPartywiseProduct (
    GLID INT PRIMARY KEY,
    ProductID INT,
    Rate MONEY
);
GO
-- 69. tbPassBookCheck table
CREATE TABLE dbo.tbPassBookCheck (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SLID INT,
    CheckDate SMALldatetime
);
GO
-- 70. tbPenaltyCalculationMethods table
CREATE TABLE dbo.tbPenaltyCalculationMethods (
    MethodID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    EffectiveDate SMALldatetime,
    CreatedBy INT,
    CreatedDateTime SMALldatetime,
    LastSavedBy INT,
    LastSavedDateTime SMALldatetime,
    Remarks VARCHAR(1024)
);
GO
-- 71. tbPenaltyCalculationMethodsDetails table
CREATE TABLE dbo.tbPenaltyCalculationMethodsDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    MethodID INT,
    Sno INT,
    FromDay INT,
    ToDay INT,
    PercentageonP NUMERIC(38, 9),
    PercentageonI MONEY,
    PerDay BIT,
    PercentageonPrincipalBalance MONEY
);
GO
-- 72. tbProductDiscount table
CREATE TABLE dbo.tbProductDiscount (
    ProductID INT PRIMARY KEY,
    SalesDiscountPercent MONEY,
    PurchaseDiscountPercent MONEY
);
GO
-- 73. tbProductGroup table
CREATE TABLE dbo.tbProductGroup (
    GrpID INT PRIMARY KEY IDENTITY(1,1),
    GrpName VARCHAR(50),
    GrpAlias VARCHAR(10),
    AltAlias VARCHAR(10),
    MGrpID INT,
    Remarks VARCHAR(1024),
    Category VARCHAR(100)
);
GO
-- 74. tbProductMaster table
CREATE TABLE dbo.tbProductMaster (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    GrpID INT,
    CompanyID INT,
    Name VARCHAR(50),
    Alias VARCHAR(50),
    AltAlias VARCHAR(50),
    Location VARCHAR(50),
    Rack VARCHAR(50),
    Packing VARCHAR(25),
    RecorderLevel INT,
    MinStock MONEY,
    OpeningStock MONEY,
    MRP MONEY,
    SaleRate MONEY,
    BuyRate MONEY,
    TradeRate MONEY,
    ServiceProduct BIT,
    EMI MONEY,
    FirstEMIDate SMALldatetime,
    RawMaterial BIT,
    MaxStock MONEY,
    LastSavedBy INT,
    LastSavedDateTime SMALldatetime,
    Remarks VARCHAR(1024),
    GLIDSales INT,
    GLIDSalesReturn INT,
    GLIDPurchase INT,
    GLIDPurchaseReturn INT,
    UnitID INT,
    MultipleUnit BIT,
    UnitID2 INT,
    RelationFactor FLOAT,
    RoomType INT
);
GO
-- 75. tbProductUnitDetails table
CREATE TABLE dbo.tbProductUnitDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    ProductId INT,
    UnitId INT,
    RelationFactor NUMERIC(16, 9)
);
GO
-- 76. tbProfessionMaster table
CREATE TABLE dbo.tbProfessionMaster (
    ProfessionID INT,
    Profession VARCHAR(100),
    Alias VARCHAR(25)
);
GO
-- 77. tbPurchaseDetails table
CREATE TABLE dbo.tbPurchaseDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    PurchaseID INT,
    ProductId INT,
    MFGDate SMALLDATETIME,
    EXPDate SMALLDATETIME,
    Batch VARCHAR(10) NOT NULL,
    Rate NUMERIC(16, 9) NOT NULL,
    Quantity MONEY NOT NULL,
    MRP MONEY NOT NULL,
    GodownID INT,
    OrderIDD INT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 78. tbPurchaseExpiryBreakageReturnDetails table
CREATE TABLE dbo.tbPurchaseExpiryBreakageReturnDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    PurchaseExpiryBreakageID INT,
    ProductId INT,
    Batch VARCHAR(10) NOT NULL,
    Rate MONEY NOT NULL,
    Quantity MONEY NOT NULL,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 79. tbPurchaseExpiryBreakageReturnMaster table
CREATE TABLE dbo.tbPurchaseExpiryBreakageReturnMaster (
    PurchaseExpiryBreakageId INT PRIMARY KEY IDENTITY(1,1),
    PurchaseExpiryBreakageNo VARCHAR(25),
    Date SMALLDATETIME,
    GLID INT,
    SLID INT,
    Supplier VARCHAR(50),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 80. tbPurchaseMaster table
CREATE TABLE dbo.tbPurchaseMaster (
    PurchaseID INT PRIMARY KEY IDENTITY(1,1),
    PurchaseNo VARCHAR(25),
    OrderID INT,
    Date SMALLDATETIME,
    GLID INT,
    SLID INT,
    PartyBillNo VARCHAR(100),
    CashBill BIT,
    Supplier VARCHAR(50),
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT,
    Cancelled BIT
);
GO
-- 81. tbPurchaseOrderDetails table
CREATE TABLE dbo.tbPurchaseOrderDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    OrderID INT,
    ProductId INT,
    Batch VARCHAR(10) NOT NULL,
    Rate MONEY NOT NULL,
    Quantity MONEY NOT NULL,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 82. tbPurchaseOrderMaster table
CREATE TABLE dbo.tbPurchaseOrderMaster (
    OrderId INT PRIMARY KEY IDENTITY(1,1),
    OrderNo VARCHAR(25),
    Date SMALldatetime,
    GLID INT,
    SLID INT,
    Party VARCHAR(50),
    CreatedDate SMALldatetime,
    CreatedUserID INT,
    ModifiedDate SMALldatetime,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT
);
GO
-- 83. tbPurchaseReturnDetails table
CREATE TABLE dbo.tbPurchaseReturnDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SNo INT,
    PurchaseID INT,
    ProductId INT,
    Batch VARCHAR(10) NOT NULL,
    Rate MONEY NOT NULL,
    Quantity MONEY NOT NULL,
    GodownID INT,
    Quantity2 NUMERIC(16, 9),
    UnitID2 INT
);
GO
-- 84. tbPurchaseReturnMaster table
CREATE TABLE dbo.tbPurchaseReturnMaster (
    PurchaseID INT PRIMARY KEY IDENTITY(1,1),
    PurchaseNo VARCHAR(25),
    RefPurchaseID INT,
    Date SMALldatetime,
    GLID INT,
    SLID INT,
    CashBill BIT,
    Supplier VARCHAR(50),
    CreatedDate SMALldatetime,
    CreatedUserID INT,
    ModifiedDate SMALldatetime,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT,
    Cancelled BIT
);
GO
-- 85. tbQualificationMaster table
CREATE TABLE dbo.tbQualificationMaster (
    QualificationID INT PRIMARY KEY IDENTITY(1,1),
    Qualification VARCHAR(100),
    Alias VARCHAR(25)
);
GO
-- 86. tbRateCalculationMethods table
CREATE TABLE dbo.tbRateCalculationMethods (
    MethodID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    EffectiveDate SMALldatetime,
    CreatedBy INT,
    CreatedDateTime SMALldatetime,
    LastSavedBy INT,
    LastSavedDateTime SMALldatetime,
    Remarks VARCHAR(1024)
);
GO
-- 87. tbRateCalculationMethodsDetails table
CREATE TABLE dbo.tbRateCalculationMethodsDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    MethodID INT,
    Sno INT,
    FromUnit MONEY,
    ToUnit MONEY,
    Amount MONEY,
    RatePerUnit MONEY,
    ServiceCharge MONEY,
    DemandCharge MONEY
);
GO
-- 88. tbRateCategoryMaster table
CREATE TABLE dbo.tbRateCategoryMaster (
    RateCategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(50),
    CategoryAlias VARCHAR(10),
    Remarks VARCHAR(1024)
);
GO
-- 89. tbRateCategorywiseProductRate table
CREATE TABLE dbo.tbRateCategorywiseProductRate (
    RateCategoryID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT,
    SaleRate MONEY,
    BuyRate MONEY
);
GO
-- 90. tbRebateCalculationMethods table
CREATE TABLE dbo.tbRebateCalculationMethods (
    MethodID INT PRIMARY KEY IDENTITY(1,1),
    GLID INT,
    EffectiveDate SMALldatetime,
    CreatedBy INT,
    CreatedDateTime SMALldatetime,
    LastSavedBy INT,
    LastSavedDateTime SMALldatetime,
    Remarks VARCHAR(1024)
);
GO
-- 91. tbRebateCalculationMethodsDetails table
CREATE TABLE dbo.tbRebateCalculationMethodsDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    MethodID INT,
    Sno INT,
    FromDay INT,
    ToDay INT,
    Amount MONEY,
    Percentage MONEY
);
GO
--92. dbo.tbReceiptDetails table
CREATE TABLE [dbo].[tbReceiptDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [ReceiptID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10),
    [Rate] MONEY,
    [Quantity] MONEY,
    [GodownID] INT,
    [ByProduct] BIT,
    [FormulaID] INT,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--93 dbo.tbReceiptMaster table 
CREATE TABLE [dbo].[tbReceiptMaster] (
    [ReceiptId] INT PRIMARY KEY IDENTITY(1,1),
    [ReceiptNo] VARCHAR(25),
    [Date] SMALLDATETIME,
    [CostCenterID] INT,
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [IssueID] INT,
    [Printed] BIT
);
GO
--94. dbo.tbReceiptReturnDetails table
CREATE TABLE [dbo].[tbReceiptReturnDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [ReceiptReturnID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10),
    [Rate] MONEY,
    [Quantity] MONEY,
    [GodownID] INT,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--95. dbo.tbReceiptReturnMaster table
CREATE TABLE [dbo].[tbReceiptReturnMaster] (
    [ReceiptReturnId] INT PRIMARY KEY IDENTITY(1,1),
    [ReturnNo] VARCHAR(25),
    [Date] SMALLDATETIME,
    [CostCenterID] INT,
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT
);
GO
--96. dbo.tbRouteMaster table
CREATE TABLE [dbo].[tbRouteMaster] (
    [RouteID] INT PRIMARY KEY IDENTITY(1,1),
    [Route] VARCHAR(100),
    [Alias] VARCHAR(25)
);
GO
--97. dbo.tbSalesDetails table 
CREATE TABLE [dbo].[tbSalesDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [SalesID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10) NOT NULL,
    [Rate] MONEY NOT NULL,
    [Quantity] MONEY NOT NULL,
    [ItemRemarks] VARCHAR(1024),
    [GodownID] INT,
    [OrderIDD] INT,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--98. dbo.tbSalesExpiryBreakageReturnDetails table
CREATE TABLE [dbo].[tbSalesExpiryBreakageReturnDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [SalesExpiryBreakageID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10) NOT NULL,
    [Rate] MONEY NOT NULL,
    [Quantity] MONEY NOT NULL,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--99. dbo.tbSalesExpiryBreakageReturnMaster table 
CREATE TABLE [dbo].[tbSalesExpiryBreakageReturnMaster] (
    [SalesExpiryBreakageId] INT PRIMARY KEY IDENTITY(1,1),
    [SalesExpiryBreakageNo] VARCHAR(25),
    [Date] SMALLDATETIME,
    [GLID] INT,
    [SLID] INT,
    [Customer] VARCHAR(50),
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT
);
GO
--100. dbo.tbSalesMaster table
CREATE TABLE [dbo].[tbSalesMaster] (
    [SalesId] INT PRIMARY KEY IDENTITY(1,1),
    [SalesNo] VARCHAR(25),
    [OpenFrom] VARCHAR(25),
    [OrderID] INT,
    [Date] SMALLDATETIME,
    [DueDate] SMALLDATETIME,
    [DueTill] SMALLDATETIME,
    [GLID] INT,
    [SLID] INT,
    [CashBill] BIT,
    [Received] BIT,
    [GLIDReceivedAc] INT,
    [Customer] VARCHAR(50),
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Cancelled] BIT,
    [CashReceived] MONEY,
    [Printed] BIT,
    [RateCategoryID] INT
);
GO
--101. dbo.tbSalesOrderDetails table
CREATE TABLE [dbo].[tbSalesOrderDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [OrderID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10) NOT NULL,
    [Rate] MONEY NOT NULL,
    [Quantity] MONEY NOT NULL,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--102. dbo.tbSalesOrderMaster table 
CREATE TABLE [dbo].[tbSalesOrderMaster] (
    [OrderId] INT PRIMARY KEY IDENTITY(1,1),
    [OrderNo] VARCHAR(25),
    [Date] SMALldatetime,
    [GLID] INT,
    [SLID] INT,
    [Party] VARCHAR(50),
    [CreatedDate] SMALldatetime,
    [CreatedUserID] INT,
    [ModifiedDate] SMALldatetime,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT
);
GO
--103. dbo.tbSalesQuotationDetails table
CREATE TABLE [dbo].[tbSalesQuotationDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [QuotationID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10) NOT NULL,
    [Rate] MONEY NOT NULL,
    [Quantity] MONEY NOT NULL,
    [ItemRemarks] VARCHAR(1024),
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--104. dbo.tbSalesQuotationMaster table
CREATE TABLE [dbo].[tbSalesQuotationMaster] (
    [QuotationId] INT PRIMARY KEY IDENTITY(1,1),
    [QuotationNo] VARCHAR(25),
    [Date] SMALLDATETIME,
    [GLID] INT,
    [SLID] INT,
    [Party] VARCHAR(50),
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT
);
GO
--105. [dbo].[tbSalesReturnDetails] table
CREATE TABLE [dbo].[tbSalesReturnDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [SalesID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10) NOT NULL,
    [Rate] MONEY NOT NULL,
    [Quantity] MONEY NOT NULL,
    [GodownID] INT,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--106. [dbo].[tbSalesReturnMaster] table
CREATE TABLE [dbo].[tbSalesReturnMaster] (
    [SalesId] INT PRIMARY KEY IDENTITY(1,1),
    [SalesNo] VARCHAR(25),
    [RefSalesID] INT,
    [Date] SMALLDATETIME,
    [GLID] INT,
    [SLID] INT,
    [CashBill] BIT,
    [Customer] VARCHAR(50),
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT,
    [Cancelled] BIT
);
GO
--107. [dbo].[tbShareNumberDetails] table
CREATE TABLE [dbo].[tbShareNumberDetails] (
    [ShareID] INT PRIMARY KEY IDENTITY(1,1),
    [ShareNumberID] INT,
    [SNo] INT,
    [ShareNo] INT,
    PRIMARY KEY ([ShareID], [ShareNumberID], [SNo])
);
GO
--108. [dbo].[tbShareNumberMaster] table
CREATE TABLE [dbo].[tbShareNumberMaster] (
    [ShareNumberID] INT PRIMARY KEY IDENTITY(1,1),
    [GenerateNo] VARCHAR(25),
    [GenerateDate] SMALLDATETIME,
    [TotalShare] INT,
    [ShareRate] INT,
    [CreatedBy] INT,
    [CreatedDateTime] SMALLDATETIME,
    [LastSavedBy] INT,
    [LastSavedDateTime] SMALLDATETIME,
    [Remarks] VARCHAR(1024),
    [ShareNoFrom] INT,
    [ShareNoTo] INT
);
GO
--109. [dbo].[tbShareTransactionDetails] table
CREATE TABLE [dbo].[tbShareTransactionDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [ShareTransactionID] INT,
    [Sno] INT,
    [ShareID] INT,
    [Sold] BIT
);
GO
--110. [dbo].[tbShareTransactionMaster] table
CREATE TABLE [dbo].[tbShareTransactionMaster] (
    [ShareTransactionID] INT PRIMARY KEY IDENTITY(1,1),
    [TransactionNo] VARCHAR(25),
    [TransactionType] VARCHAR(25),
    [GLID] INT,
    [SLID] INT,
    [GLIDTransferTo] INT,
    [SLIDTransferTo] INT,
    [TransactionDate] SMALLDATETIME,
    [TotalShare] INT,
    [ShareIDFrom] INT,
    [ShareIDTo] INT,
    [CreatedBy] INT,
    [CreatedDateTime] SMALLDATETIME,
    [LastSavedBy] INT,
    [LastSavedDateTime] SMALLDATETIME,
    [Remarks] VARCHAR(1024)
);
GO
--111. [dbo].[tbSMSLog] table
CREATE TABLE [dbo].[tbSMSLog] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [MemberID] INT,
    [SLID] INT,
    [ModuleName] VARCHAR(100),
    [SMSDate] DATETIME,
    [SMSDateTime] DATETIME,
    [SMS] VARCHAR(500),
    [MobileNo] VARCHAR(50),
    [Remarks] VARCHAR(1024)
);
GO
--112. [dbo].[tbStartedDay] table
CREATE TABLE [dbo].[tbStartedDay] (
    [RecordID] INT PRIMARY KEY IDENTITY(1,1),
    [StartedDate] SMALLDATETIME,
    [StartedUserID] INT,
    [StartedDateTime] SMALLDATETIME
);
GO
--113. [dbo].[tbStockTransferDetails] table
CREATE TABLE [dbo].[tbStockTransferDetails] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [TransferID] INT,
    [ProductId] INT,
    [Batch] VARCHAR(10),
    [Rate] MONEY,
    [Quantity] MONEY,
    [GodownIDFrom] INT,
    [GodownIDTo] INT,
    [Quantity2] NUMERIC(16, 9),
    [UnitID2] INT
);
GO
--114. [dbo].[tbStockTransferMaster] table
CREATE TABLE [dbo].[tbStockTransferMaster] (
    [TransferId] INT PRIMARY KEY IDENTITY(1,1),
    [TransferNo] VARCHAR(25),
    [Date] SMALLDATETIME,
    [CreatedDate] SMALLDATETIME,
    [CreatedUserID] INT,
    [ModifiedDate] SMALLDATETIME,
    [ModifiedUserID] INT,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [Printed] BIT
);
GO
--115. [dbo].[tbSubLedgerLog] table
CREATE TABLE [dbo].[tbSubLedgerLog] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SLID] INT,
    [ActionType] VARCHAR(255),
    [TranDate] DATETIME,
    [StartDate] SMALLDATETIME,
    [EndDate] SMALLDATETIME,
    [Remarks] VARCHAR(1024),
    [LogNo] INT,
    [IsOnLine] VARCHAR(1)
);
GO
--116. [dbo].[tbSubLedgerMaster] table
CREATE TABLE [dbo].[tbSubLedgerMaster] (
    [SLID] INT PRIMARY KEY IDENTITY(1,1),
    [SLType] VARCHAR(50),
    [AccountOpenDate] SMALLDATETIME,
    [SLName] VARCHAR(255),
    [SlAlias] VARCHAR(25),
    [AltAlias] VARCHAR(10),
    [GLID] INT,
    [MemberID] INT,
    [Address1] VARCHAR(50),
    [Address2] VARCHAR(50),
    [Phone1] VARCHAR(50),
    [Phone2] VARCHAR(15),
    [Fax] VARCHAR(25),
    [Email] VARCHAR(100),
    [Mobile] VARCHAR(50),
    [Pan] VARCHAR(20),
    [IncomeTaxNo] VARCHAR(20),
    [NextofKinName] VARCHAR(100),
    [NextofKinAddress] VARCHAR(150),
    [NextofKinContactNumber] VARCHAR(50),
    [Relation] VARCHAR(50),
    [LoanAmount] MONEY,
    [LoanDuration] MONEY,
    [FirstInstallmentDate] SMALLDATETIME,
    [InstallmentAmount] MONEY,
    [MaturityDate] SMALLDATETIME,
    [Closed] BIT,
    [CollateralType] VARCHAR(100),
    [CollateralDescription] VARCHAR(100),
    [CollateralLandDistrict] VARCHAR(50),
    [CollateralLandVDC] VARCHAR(50),
    [CollateralLandWardNo] VARCHAR(50),
    [CollateralLandPlotNo] VARCHAR(50),
    [CollateralLandOwner] VARCHAR(50),
    [CollateralLandOwnerCCNo] VARCHAR(50),
    [CollateralLandShare] VARCHAR(50),
    [CollateralLandArea] VARCHAR(50),
    [CollateralLandRemarks] VARCHAR(1024),
    [CollateralShareNo] VARCHAR(50),
    [CollateralShareCompany] VARCHAR(100),
    [CollateralShares] INT,
    [CollateralShareValue] MONEY,
    [CollateralShareCurrentValue] MONEY,
    [CollateralSharePurchaseDate] SMALLDATETIME,
    [CollateralShareRemarks] VARCHAR(1024),
    [CollateralGoldWeight] VARCHAR(50),
    [SLIDTransfer] INT,
    [SpecialInterestRate] MONEY,
    [SpecialTaxRate] MONEY,
    [CreatedBy] INT,
    [CreatedDateTime] SMALLDATETIME,
    [LastSavedBy] INT,
    [LastSavedDateTime] SMALLDATETIME,
    [Remarks] VARCHAR(1024),
    [DocClassID] INT,
    [CollectorID] INT,
    [RouteID] INT,
    [Locked] BIT,
    [ClosedDate] SMALLDATETIME,
    [EmailAlert] BIT,
    [MobileAlert] BIT,
    [ApplySpecialInterestRate] BIT,
    [ApplySpecialTaxRate] BIT,
    [ScheduleSL] VARCHAR(50),
    [DOB] SMALLDATETIME,
    [Gender] VARCHAR(50),
    [InstallmentatLastDateofMonth] BIT,
    [SLIDTransferLoanFrom] INT,
    [GraceMonths] INT,
    [AltSLName] VARCHAR(100),
    [ReadingDay] VARCHAR(10),
    [SLDocumentType] VARCHAR(50),
    [SLDocumentNo] VARCHAR(50),
    [SLOverDraftAmount] MONEY,
    [SLMinBalance] MONEY
);
GO
--117. [dbo].[tbSubLedgerPhoto] table
CREATE TABLE [dbo].[tbSubLedgerPhoto] (
    [SLID] INT PRIMARY KEY,
    [Photo] IMAGE,
    [Sign1] IMAGE,
    [Sign2] IMAGE,
    [Sign3] IMAGE,
    [Sign4] IMAGE
);
GO
--118. [dbo].[tbSystemSettingAcClosingBillSetup] table
CREATE TABLE [dbo].[tbSystemSettingAcClosingBillSetup] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [GLID] INT,
    [SLID] INT,
    [Amount] MONEY
);
GO
--119. [dbo].[tbSystemSettingBillSetup] table
CREATE TABLE [dbo].[tbSystemSettingBillSetup] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [GLID] INT,
    [SLID] INT,
    [Amount] MONEY
);
GO
--120. [dbo].[tbSystemSettingClosingMapping] table
CREATE TABLE [dbo].[tbSystemSettingClosingMapping] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [GLID] INT,
    [SLID] INT,
    [Amount] MONEY
);
GO
--121. [dbo].[tbSystemSettingMBankExclude] table
CREATE TABLE [dbo].[tbSystemSettingMBankExclude] (
    [DetailID] INT PRIMARY KEY IDENTITY(1,1),
    [SNo] INT,
    [SLID] INT
);
GO
--122. [dbo].[tbSystemSettings] table
CREATE TABLE [dbo].[tbSystemSettings] (
    DateType CHAR(2),
    DateFormat CHAR(10),
    LockNew BIT,
    LockEdit BIT,
    LockDelete BIT,
    LockDateFrom SMALLDATETIME,
    LockDateTo SMALLDATETIME,
    DefaultVoucherAction CHAR(1),
    ShowTACode BIT,
    NCB CHAR(1),
    NBB CHAR(1),
    MinCB CHAR(1),
    MinCBAmount MONEY,
    MaxCB CHAR(1),
    MaxCBAmount MONEY,
    MaxPBC BIT,
    MaxPBCAmount MONEY,
    VoucherOnlinePrint CHAR(1),
    InterestTaxRate MONEY,
    MinSB CHAR(1),
    MaxSB CHAR(1),
    BookedOrder CHAR(1),
    RecorderLevel CHAR(1),
    AutoBackup BIT,
    AutoBackupDayDiff TINYINT,
    BackupPath VARCHAR(255),
    AutoBackupDate SMALLDATETIME,
    RemindBackup BIT,
    RemindBackupDayDiff TINYINT,
    RemindDate SMALLDATETIME,
    BackupDate SMALLDATETIME,
    Version MONEY,
    AlertStock BIT,
    BatchExpiry BIT,
    UDF BIT,
    NIC CHAR(1),
    AutoPopUp BIT,
    CashBook INT,
    ProfitLoss INT,
    GLIDInterestIncomeAc INT,
    GLIDInterestExpenseAc INT,
    GLIDRebateAc INT,
    GLIDPenaltyAc INT,
    InterestPayable INT,
    InterestReceivable INT,
    GLIDTaxOnInterest INT,
    GLIDContraLedgerForReceivableInterest INT,
    CounterBillDesign VARCHAR(50),
    SLWithMultipleGL BIT,
    Incentive INT,
    InterestRound VARCHAR(50),
    InterestTaxDecimal VARCHAR(50),
    DebitStudentFromBill BIT,
    StudentBillDesign VARCHAR(50),
    StudentReceiptDesign VARCHAR(50),
    DocClassCaption BIT,
    GodownSystem VARCHAR(50),
    ProfitCaption VARCHAR(50),
    LossCaption BIT,
    Trading BIT,
    ConfirmSaving BIT,
    Nepali VARCHAR(1024),
    UseTACodeBilling MONEY,
    ShowAllProductInHospitalBiilling INT,
    ReportFooter MONEY,
    SourceofFundMaxLimit INT,
    GLIDShareAc BIT,
    SharePrice VARCHAR(7000),
    InterestPostingVoucher VARCHAR(50),
    ShareTransactionVoucher BIT,
    StatementFormat VARCHAR(1024),
    ShowShareAcInFrontPanel BIT,
    VoucherFooter BIT,
    DocClassCaptionNepali BIT,
    ShowLastDate INT,
    LastBackupLocation MONEY,
    SubGroupSystem MONEY,
    DayClosing BIT,
    FastDayClosing INT,
    GLIDIncomeTaxAc INT,
    IncomeTaxPercent BIT,
    DividendTaxRate BIT,
    GLIDDividendTaxAc BIT,
    ShowStartupAlertForMaturedAccounts INT,
    ShowStartupAlertForInstallment VARCHAR(100),
    ShowStartupAlertForFixedMatured VARCHAR(1024),
    GLIDTrialDifference VARCHAR(100),
    EmailAddress MONEY,
    EmailPassword VARCHAR(50),
    MailSendingComputer VARCHAR(50),
    EmailAlert BIT,
    ItemCaption VARCHAR(7000),
    AliasCaption VARCHAR(255),
    CCCaption BIT,
    AltAliasCaption MONEY,
    AllowDuplicateAlias MONEY,
    NegativeStock BIT,
    ProductWiseAc BIT,
    Sales BIT,
    SalesReturn BIT,
    SundryDebtors BIT,
    Purchase BIT,
    PurchaseReturn BIT,
    SundryCreditors BIT,
    PermanentLock BIT,
    AlertforDocument BIT,
    ChequeLock BIT,
    SMSService BIT,
    WeborModem BIT,
    WebSMSMessageURL VARCHAR(7000),
    WebSMSSuccessMessage VARCHAR(50),
    WebSMSBalanceQueryURL VARCHAR(1024),
    AlertonWithdrawAmount BIT,
    AlertonDepositAmount BIT,
    MessageInstallment BIT,
    MessageMaturityLoan INT,
    MessageMaturityDeposit INT,
    MessageDeposit INT,
    MessageWithdraw INT,
    TabCollection INT,
    MBankVoucher INT,
    GLIDMBank INT,
    SCTVoucher INT,
    GLIDSCT BIT,
    NepaliSMS VARCHAR(100),
    SMSExEFile VARCHAR(1024),
    GLIDDemandChargeUnit VARCHAR(100),
    GLIDServiceChargeUnit MONEY,
    GLIDTarrifIncomeUnit VARCHAR(50),
    GLIDContraforReceivableTarrifUnit VARCHAR(50),
    UnitBillingVoucher VARCHAR(50),
    UnitCashReceiptVoucher BIT,
    VoucherApprovedByName CHAR(1),
    VoucherApprovedByDesignation BIT,
    VoucherCheckedByName INT,
    VoucherCheckedByDesignation INT,
    VoucherVerifiedByName INT,
    VoucherVerifiedByDesignation INT,
    MessageLongTimeNoTran VARCHAR(100)
);
GO
--123. [dbo].[tbTACodeMaster] table
CREATE TABLE [dbo].[tbTACodeMaster] (
    TACodeID INT PRIMARY KEY IDENTITY(1,1),
    TACodeMenuID INT,
    CodeName VARCHAR(50),
    Alias VARCHAR(25),
    AltAlias VARCHAR(25),
    MTACodeID INT,
    Remarks VARCHAR(1024)
);
GO
--124. [dbo].[tbTACodeMenuMaster] table
CREATE TABLE [dbo].[tbTACodeMenuMaster] (
    TACodeMenuID INT PRIMARY KEY IDENTITY(1,1),
    CodeMenuName VARCHAR(25),
    Alias VARCHAR(25),
    Active BIT,
    Inventory BIT,
    MenuOrder TINYINT,
    Remarks VARCHAR(1024)
);
GO
--125. [dbo].[tbUDFDetails] table
CREATE TABLE [dbo].[tbUDFDetails] (
    UDFID INT PRIMARY KEY,
    [Document] INT,
    SLNo INT,
    Value VARCHAR(1024)
);
GO
--126. [dbo].[tbUDFMaster] table
CREATE TABLE [dbo].[tbUDFMaster] (
    UDFID INT PRIMARY KEY IDENTITY(1,1),
    Module VARCHAR(10),
    Name VARCHAR(50),
    Type VARCHAR(10),
    Length INT,
    AllowDecimal BIT,
    SortOrder INT,
    Mandatory BIT,
    Status BIT,
    ItemWise BIT NOT NULL,
    ShowTotal BIT NOT NULL,
    Remarks VARCHAR(1024)
);
GO
--127. [dbo].[tbUnitBillingMaster] table
CREATE TABLE [dbo].[tbUnitBillingMaster] (
    BillingID INT PRIMARY KEY IDENTITY(1,1),
    DocumentNo VARCHAR(25) NOT NULL,
    MonthName VARCHAR(50),
    ForYear INT,
    DocumentDate SMALLDATETIME,
    GLID INT,
    SLID INT,
    Unit MONEY,
    PreviousUnit MONEY,
    CurrentUnit MONEY,
    Amount MONEY,
    CreatedDate SMALLDATETIME,
    CreatedUserID INT,
    ModifiedDate SMALLDATETIME,
    ModifiedUserID INT,
    Remarks VARCHAR(1024),
    DocClassID INT,
    Printed BIT,
    ResetMeter BIT,
    ResetMeterReason VARCHAR(100),
    ServiceCharge MONEY,
    DemandCharge MONEY,
    Adjusted BIT
);
GO
--128. [dbo].[tbUnitMaster] table
CREATE TABLE [dbo].[tbUnitMaster] (
    UnitID INT PRIMARY KEY IDENTITY(1,1),
    UnitName VARCHAR(50),
    UnitAlias VARCHAR(10),
    DecimalPlaces INT,
    Remarks VARCHAR(1024)
);
GO
--129. [dbo].[tbUserDefinedVoucher] table
CREATE TABLE [dbo].[tbUserDefinedVoucher] (
    UDVNo INT PRIMARY KEY IDENTITY(1,1),
    MenuName VARCHAR(50),
    Alias VARCHAR(25),
    DebitSide VARCHAR(25),
    CreditSide VARCHAR(25),
    MenuOrder TINYINT,
    AllowAdjustment BIT,
    ShowTACode BIT,
    Remarks VARCHAR(1024),
    EntryType VARCHAR(50),
    SingleSide VARCHAR(25),
    DefaultPrintDesign VARCHAR(50),
    EnglishMenuName VARCHAR(50),
    PrintReceipt BIT,
    DebitSideSL VARCHAR(25),
    CreditSideSL VARCHAR(25)
);
GO
--130. [dbo].[tbVaultDenomination] table
CREATE TABLE [dbo].[tbVaultDenomination] (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    TransactionID INT,
    DenominationID INT,
    Nos INT
);
GO
--131. [dbo].[tbVaultMaster] table
CREATE TABLE [dbo].[tbVaultMaster] (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    TransactionNo VARCHAR(25),
    TransactionType VARCHAR(25),
    TransactionDate SMALLDATETIME,
    UserID INT,
    UserName VARCHAR(100),
    DaysCashOutAmount MONEY,
    ReceivedAmount MONEY,
    PaidAmount MONEY,
    TotalAmount MONEY,
    CreatedBy INT,
    CreatedDateTime SMALLDATETIME,
    LastSavedBy INT,
    LastSavedDateTime SMALLDATETIME,
    Remarks VARCHAR(1024)
);
GO
--132. [dbo].[tbVdcMaster] table
CREATE TABLE [dbo].[tbVdcMaster] (
    VdcID INT PRIMARY KEY IDENTITY(1,1),
    Vdc VARCHAR(100),
    Alias VARCHAR(25)
);




