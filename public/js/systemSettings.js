document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("myForm122");
  if (!form) return;

  const movableDiv = document.getElementById("movableDiv122");
  const openButton = document.getElementById("toggleButton122");
  const closeButton = document.getElementById("closeButton122");
  const cancelButton = document.getElementById("cancelButton122");
  const browseButton = document.getElementById("SSBrowse");
  const systemLinks = form.querySelectorAll(".ss-anchor .toggle-link");
  const systemContents = form.querySelectorAll(":scope > .ss-fieldset .contents > div");

  const fields = {
    dateFormat: document.getElementById("SSFormat"),
    dateAD: document.getElementById("SSAD"),
    dateLD: document.getElementById("SSLD"),
    showLastDate: document.getElementById("SSShowLastDate"),
    defaultHold: document.getElementById("SSDefaultHold"),
    defaultPost: document.getElementById("SSDefaultPost"),
    lockNew: document.getElementById("SSNew"),
    lockEdit: document.getElementById("SSEdit"),
    lockDelete: document.getElementById("SSDelete"),
    lockDateEnabled: document.getElementById("SSDCheckbox"),
    lockDateFrom: document.getElementById("SSDFrom"),
    lockDateTo: document.getElementById("SSDTo"),
    autoBackup: document.getElementById("SSCheckedAB"),
    autoBackupDayDiff: document.getElementById("SSIDDiff"),
    backupPath: document.getElementById("SSBPath"),
    remindBackup: document.getElementById("SSRBCheckBox"),
    remindBackupDayDiff: document.getElementById("SSIEvery"),
    autoFilterListings: document.getElementById("SSAutoFilterListings"),
    subGroupSystem: document.getElementById("SSSubGroupSystem"),
    udf: document.getElementById("SSUDF"),
    confirmSaving: document.getElementById("SSConfirmSaving"),
  };

  const mapping2Fields = {
    taxOnInterest: document.getElementById("SSM2TaxOnInterest"),
    contraReceivableInterest: document.getElementById("SSM2ContraReceivableInterest"),
    shareAcMainLedger: document.getElementById("SSM2ShareAcMainLedger"),
    interestPostingVoucher: document.getElementById("SSM2InterestPostingVoucher"),
    shareTransactionVoucher: document.getElementById("SSM2ShareTransactionVoucher"),
    nicBlock: document.getElementById("SSM2NICBlock"),
    nicWarning: document.getElementById("SSM2NICWarning"),
    nicIgnore: document.getElementById("SSM2NICIgnore"),
    showShareAcInFrontPanel: document.getElementById("SSM2ShowShareAcInFrontPanel"),
    showMaturedLoanAlert: document.getElementById("SSM2ShowMaturedLoanAlert"),
    dayClosing: document.getElementById("SSM2DayClosing"),
    fastDayClose: document.getElementById("SSM2FastDayClose"),
    slowDayClose: document.getElementById("SSM2SlowDayClose"),
    showFixedMaturedAlert: document.getElementById("SSM2ShowFixedMaturedAlert"),
    showInstallmentAlert: document.getElementById("SSM2ShowInstallmentAlert"),
  };
  const financialFields = {
    ncbBlock: document.getElementById("SSFNCBBlock"),
    ncbWarning: document.getElementById("SSFNCBWarning"),
    ncbIgnore: document.getElementById("SSFNCBIgnore"),
    nbbBlock: document.getElementById("SSFNBBBlock"),
    nbbWarning: document.getElementById("SSFNBBWarning"),
    nbbIgnore: document.getElementById("SSFNBBIgnore"),
    minCBAmount: document.getElementById("SSMinCBAmount"),
    minCBBlock: document.getElementById("SSMinCBBlock"),
    minCBWarning: document.getElementById("SSMinCBWarning"),
    minCBIgnore: document.getElementById("SSMinCBIgnore"),
    maxCBAmount: document.getElementById("SSMaxCBAmount"),
    maxCBBlock: document.getElementById("SSMaxCBBlock"),
    maxCBWarning: document.getElementById("SSMaxCBWarning"),
    maxCBIgnore: document.getElementById("SSMaxCBIgnore"),
    maxPBCAmount: document.getElementById("SSMaxPBCAmount"),
    maxPBCBlock: document.getElementById("SSMaxPBCBlock"),
    maxPBCWarning: document.getElementById("SSMaxPBCWarning"),
    maxPBCIgnore: document.getElementById("SSMaxPBCIgnore"),
  };
  const otherFields = {
    docClassCaption: document.getElementById("SSOtherDocClassCaption"),
    profitCaption: document.getElementById("SSOtherProfitCaption"),
    lossCaption: document.getElementById("SSOtherLossCaption"),
    reportFooter: document.getElementById("SSOtherReportFooter"),
    interestTaxRate: document.getElementById("SSOtherInterestTaxRate"),
    sourceofFundMaxLimit: document.getElementById("SSOtherSourceofFundMaxLimit"),
    sharePrice: document.getElementById("SSOtherSharePrice"),
    interestRound: document.getElementById("SSOtherInterestRound"),
    interestTaxDecimal: document.getElementById("SSOtherInterestTaxDecimal"),
    statementFormat: document.getElementById("SSOtherStatementFormat"),
    trialDifferenceLedger: document.getElementById("SSOtherTrialDifferenceLedger"),
    alertforDocument: document.getElementById("SSOtherAlertforDocument"),
  };
  const miscFields = {
    autoCalculateInterest: document.getElementById("SSMiscAutoCalculateInterest"),
    autoDistributeAmount: document.getElementById("SSMiscAutoDistributeAmount"),
    askInstallmentDate: document.getElementById("SSMiscAskInstallmentDate"),
    dayStart: document.getElementById("SSMiscDayStart"),
    dayStartAfter: document.getElementById("SSMiscDayStartAfter"),
    dayCloseByStartedUser: document.getElementById("SSMiscDayCloseByStartedUser"),
    ladderInterestonLoan: document.getElementById("SSMiscLadderInterestonLoan"),
    differentTaxationforPalika: document.getElementById("SSMiscDifferentTaxationforPalika"),
  };
  const billSetupFields = {
    billBody: document.getElementById("SSBillSetupTableBody"),
    acClosingBody: document.getElementById("SSAcClosingBillSetupTableBody"),
    addBillRow: document.getElementById("SSBillSetupAddRow"),
    addAcClosingRow: document.getElementById("SSAcClosingBillSetupAddRow"),
  };
  const voucherFields = {
    footer: document.getElementById("SSVoucherFooter"),
  };
  const closingMappingFields = {
    incomeTax: document.getElementById("SSClosingIncomeTax"),
    incomeTaxPercent: document.getElementById("SSClosingIncomeTaxPercent"),
    dividendTax: document.getElementById("SSClosingDividendTax"),
    dividendTaxRate: document.getElementById("SSClosingDividendTaxRate"),
    patronageRefundTax: document.getElementById("SSClosingPatronageRefundTax"),
    body: document.getElementById("SSClosingMappingTableBody"),
    addRow: document.getElementById("SSClosingMappingAddRow"),
  };
  const acMappingFields = {
    showTACode: document.getElementById("SSACShowTACode"),
    voucherOnlinePrint: document.getElementById("SSACVoucherOnlinePrint"),
    slWithMultipleGL: document.getElementById("SSACSLWithMultipleGL"),
    cashBook: document.getElementById("SSACCashBook"),
    profitLoss: document.getElementById("SSACProfitLoss"),
    interestIncomeAc: document.getElementById("SSACInterestIncomeAc"),
    interestExpenseAc: document.getElementById("SSACInterestExpenseAc"),
    rebateAc: document.getElementById("SSACRebateAc"),
    penaltyAc: document.getElementById("SSACPenaltyAc"),
    interestPayable: document.getElementById("SSACInterestPayable"),
    interestReceivable: document.getElementById("SSACInterestReceivable"),
  };

  function showMessage(message) {
    if (typeof window.showAlert === "function") {
      window.showAlert(message);
      return;
    }
    alert(message);
  }

  function getDateFormatForType(dateType) {
    return dateType === "LD" ? "DD/MM/YYYY" : "YYYY-MM-DD";
  }

  function syncDateFormatInput() {
    const dateType = fields.dateLD?.checked ? "LD" : "AD";
    const defaultFormat = getDateFormatForType(dateType);

    if (!fields.dateFormat) return;
    const currentValue = (fields.dateFormat.value || "").trim();

    if (!currentValue || currentValue === "yyyy/MM/dd" || currentValue === "dd/MM/yyyy" || currentValue === "YYYY-MM-DD" || currentValue === "DD/MM/YYYY") {
      fields.dateFormat.value = defaultFormat;
      return;
    }

    fields.dateFormat.value = currentValue;
  }

  function setChecked(element, checked) {
    if (element) element.checked = !!checked;
  }

  function setValue(element, value) {
    if (element) element.value = value ?? "";
  }

  function setActionRadio(group, value) {
    const action = ["B", "W"].includes(value) ? value : "I";
    setChecked(group.block, action === "B");
    setChecked(group.warning, action === "W");
    setChecked(group.ignore, action === "I");
  }

  function getActionRadio(group) {
    if (group.block?.checked) return "B";
    if (group.warning?.checked) return "W";
    return "I";
  }

  function activeSectionId() {
    const activeLink = form.querySelector(".ss-anchor .toggle-link.active");
    if (activeLink?.dataset.target) return activeLink.dataset.target;
    const visibleSection = Array.from(systemContents).find((content) => content.style.display !== "none");
    return visibleSection?.id || "system";
  }

  function toggleLockDates() {
    const enabled = fields.lockDateEnabled?.checked;
    if (fields.lockDateFrom) fields.lockDateFrom.disabled = !enabled;
    if (fields.lockDateTo) fields.lockDateTo.disabled = !enabled;
  }

  function toggleDayCloseMode() {
    const enabled = mapping2Fields.dayClosing?.checked;
    if (mapping2Fields.fastDayClose) mapping2Fields.fastDayClose.disabled = !enabled;
    if (mapping2Fields.slowDayClose) mapping2Fields.slowDayClose.disabled = !enabled;
  }

  function toggleDayStartAfter() {
    if (miscFields.dayStartAfter) miscFields.dayStartAfter.disabled = !miscFields.dayStart?.checked;
  }

  function createBillSetupInput(className, value = "") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = `ss-text ${className}`;
    input.value = value ?? "";
    return input;
  }

  function createBillSetupRow(row = {}) {
    const tr = document.createElement("tr");
    tr.dataset.glid = row.GLID || row.glid || "";
    tr.dataset.slid = row.SLID || row.slid || "";

    const snoCell = document.createElement("td");
    snoCell.className = "ss-bill-sno";

    const accountCell = document.createElement("td");
    accountCell.appendChild(createBillSetupInput("ss-bill-account-head", row.AccountHead || row.accountHead || ""));

    const subHeadCell = document.createElement("td");
    subHeadCell.appendChild(createBillSetupInput("ss-bill-sub-head", row.SubHead || row.subHead || ""));

    const amountCell = document.createElement("td");
    amountCell.appendChild(createBillSetupInput("ss-bill-amount", row.Amount ?? row.amount ?? ""));

    tr.append(snoCell, accountCell, subHeadCell, amountCell);
    return tr;
  }

  function renumberBillSetupRows(tbody) {
    Array.from(tbody?.querySelectorAll("tr") || []).forEach((row, index) => {
      const snoCell = row.querySelector(".ss-bill-sno");
      if (snoCell) snoCell.textContent = index + 1;
    });
  }

  function ensureBlankBillSetupRow(tbody) {
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr");
    if (rows.length === 0) tbody.appendChild(createBillSetupRow());
    renumberBillSetupRows(tbody);
  }

  function renderBillSetupRows(tbody, rows) {
    if (!tbody) return;
    tbody.innerHTML = "";
    (rows || []).forEach((row) => tbody.appendChild(createBillSetupRow(row)));
    ensureBlankBillSetupRow(tbody);
  }

  function readBillSetupRows(tbody) {
    return Array.from(tbody?.querySelectorAll("tr") || [])
      .map((row) => ({
        glid: row.dataset.glid || "",
        slid: row.dataset.slid || "",
        accountHead: row.querySelector(".ss-bill-account-head")?.value.trim() || "",
        subHead: row.querySelector(".ss-bill-sub-head")?.value.trim() || "",
        amount: row.querySelector(".ss-bill-amount")?.value.trim() || "",
      }))
      .filter((row) => row.accountHead || row.subHead || row.amount);
  }

  function showSystemTab(target = "system") {
    systemLinks.forEach((link) => {
      const isActive = link.dataset.target === target;
      link.classList.toggle("active", isActive);
    });

    systemContents.forEach((content) => {
      content.style.display = content.id === target ? "block" : "none";
    });
  }

  function applySystemSettings(settings) {
    const dateType = settings.DateType === "LD" ? "LD" : "AD";
    setChecked(fields.dateAD, dateType !== "LD");
    setChecked(fields.dateLD, dateType === "LD");
    const configuredFormat = String(settings.DateFormat || "").trim();
    setValue(fields.dateFormat, configuredFormat || getDateFormatForType(dateType));
    syncDateFormatInput();
    setChecked(fields.showLastDate, settings.ShowLastDate);
    setChecked(fields.defaultHold, settings.DefaultVoucherAction !== "P");
    setChecked(fields.defaultPost, settings.DefaultVoucherAction === "P");
    setChecked(fields.lockNew, settings.LockNew);
    setChecked(fields.lockEdit, settings.LockEdit);
    setChecked(fields.lockDelete, settings.LockDelete);
    setChecked(fields.lockDateEnabled, !!(settings.LockDateFrom || settings.LockDateTo));
    setValue(fields.lockDateFrom, settings.LockDateFrom);
    setValue(fields.lockDateTo, settings.LockDateTo);
    setChecked(fields.autoBackup, settings.AutoBackup);
    setValue(fields.autoBackupDayDiff, settings.AutoBackupDayDiff);
    setValue(fields.backupPath, settings.BackupPath);
    setChecked(fields.remindBackup, settings.RemindBackup);
    setValue(fields.remindBackupDayDiff, settings.RemindBackupDayDiff);
    setChecked(fields.autoFilterListings, settings.AutoPopUp);
    setChecked(fields.subGroupSystem, settings.SubGroupSystem);
    setChecked(fields.udf, settings.UDF);
    setChecked(fields.confirmSaving, settings.ConfirmSaving);
    toggleLockDates();
  }

  function applyMapping2Settings(settings) {
    setValue(mapping2Fields.taxOnInterest, settings.GLIDTaxOnInterest);
    setValue(mapping2Fields.contraReceivableInterest, settings.GLIDContraLedgerForReceivableInterest);
    setValue(mapping2Fields.shareAcMainLedger, settings.GLIDShareAc);
    setValue(mapping2Fields.interestPostingVoucher, settings.InterestPostingVoucher);
    setValue(mapping2Fields.shareTransactionVoucher, settings.ShareTransactionVoucher);
    setChecked(mapping2Fields.nicBlock, settings.NIC === "B");
    setChecked(mapping2Fields.nicWarning, settings.NIC === "W");
    setChecked(mapping2Fields.nicIgnore, !["B", "W"].includes(settings.NIC));
    setChecked(mapping2Fields.showShareAcInFrontPanel, settings.ShowShareAcInFrontPanel);
    setChecked(mapping2Fields.showMaturedLoanAlert, settings.ShowStartupAlertForMaturedAccounts);
    setChecked(mapping2Fields.dayClosing, settings.DayClosing);
    setChecked(mapping2Fields.fastDayClose, settings.FastDayClosing);
    setChecked(mapping2Fields.slowDayClose, !settings.FastDayClosing);
    setChecked(mapping2Fields.showFixedMaturedAlert, settings.ShowStartupAlertForFixedMatured);
    setChecked(mapping2Fields.showInstallmentAlert, settings.ShowStartupAlertForInstallment);
    toggleDayCloseMode();
  toggleDayStartAfter();
  }

  function applyFinancialControlSettings(settings) {
    setActionRadio({ block: financialFields.ncbBlock, warning: financialFields.ncbWarning, ignore: financialFields.ncbIgnore }, settings.NCB);
    setActionRadio({ block: financialFields.nbbBlock, warning: financialFields.nbbWarning, ignore: financialFields.nbbIgnore }, settings.NBB);
    setActionRadio({ block: financialFields.minCBBlock, warning: financialFields.minCBWarning, ignore: financialFields.minCBIgnore }, settings.MinCB);
    setValue(financialFields.minCBAmount, settings.MinCBAmount);
    setActionRadio({ block: financialFields.maxCBBlock, warning: financialFields.maxCBWarning, ignore: financialFields.maxCBIgnore }, settings.MaxCB);
    setValue(financialFields.maxCBAmount, settings.MaxCBAmount);
    setActionRadio({ block: financialFields.maxPBCBlock, warning: financialFields.maxPBCWarning, ignore: financialFields.maxPBCIgnore }, settings.MaxPBC);
    setValue(financialFields.maxPBCAmount, settings.MaxPBCAmount);
  }

  function applyOtherSettings(settings) {
    setValue(otherFields.docClassCaption, settings.DocClassCaption);
    setValue(otherFields.profitCaption, settings.ProfitCaption);
    setValue(otherFields.lossCaption, settings.LossCaption);
    setValue(otherFields.reportFooter, settings.ReportFooter);
    setValue(otherFields.interestTaxRate, settings.InterestTaxRate);
    setValue(otherFields.sourceofFundMaxLimit, settings.SourceofFundMaxLimit);
    setValue(otherFields.sharePrice, settings.SharePrice);
    setValue(otherFields.interestRound, settings.InterestRound || "None");
    setValue(otherFields.interestTaxDecimal, settings.InterestTaxDecimal || "None");
    setValue(otherFields.statementFormat, settings.StatementFormat || "Default");
    setValue(otherFields.trialDifferenceLedger, settings.GLIDTrialDifference);
    setChecked(otherFields.alertforDocument, settings.AlertforDocument);
  }

  function applyMiscSettings(settings) {
    setChecked(miscFields.autoCalculateInterest, settings.AutoCalculateInterestonTransactionPanel);
    setChecked(miscFields.autoDistributeAmount, settings.AutoDistributeAmountinTransactionPanel);
    setChecked(miscFields.askInstallmentDate, settings.AskforInstallmentMonth);
    setChecked(miscFields.dayStart, settings.DayStart);
    setValue(miscFields.dayStartAfter, settings.DayStartAfter);
    setChecked(miscFields.dayCloseByStartedUser, settings.DayCloseByStartedUser);
    setChecked(miscFields.ladderInterestonLoan, settings.LadderInterestonLoan);
    setChecked(miscFields.differentTaxationforPalika, settings.DifferentTaxationforPalika);
    toggleDayStartAfter();
  }

  function applyBillSetupSettings(data) {
    renderBillSetupRows(billSetupFields.billBody, data.billRows || []);
    renderBillSetupRows(billSetupFields.acClosingBody, data.acClosingRows || []);
  }

  function applyVoucherSettings(settings) {
    setValue(voucherFields.footer, settings.VoucherFooter);
  }

  function applyClosingMappingSettings(data) {
    const settings = data.settings || {};
    setValue(closingMappingFields.incomeTax, settings.GLIDIncomeTaxAc);
    setValue(closingMappingFields.incomeTaxPercent, settings.IncomeTaxPercent);
    setValue(closingMappingFields.dividendTax, settings.GLIDDividendTaxAc);
    setValue(closingMappingFields.dividendTaxRate, settings.DividendTaxRate);
    setValue(closingMappingFields.patronageRefundTax, settings.GLIDPatronageRefundTaxAc);
    renderBillSetupRows(closingMappingFields.body, data.mappingRows || []);
  }

  function applyAcMappingSettings(settings) {
    setChecked(acMappingFields.showTACode, settings.ShowTACode);
    setChecked(acMappingFields.voucherOnlinePrint, settings.VoucherOnlinePrint);
    setChecked(acMappingFields.slWithMultipleGL, settings.SLWithMultipleGL);
    setValue(acMappingFields.cashBook, settings.CashBook);
    setValue(acMappingFields.profitLoss, settings.ProfitLoss);
    setValue(acMappingFields.interestIncomeAc, settings.GLIDInterestIncomeAc);
    setValue(acMappingFields.interestExpenseAc, settings.GLIDInterestExpenseAc);
    setValue(acMappingFields.rebateAc, settings.GLIDRebateAc);
    setValue(acMappingFields.penaltyAc, settings.GLIDPenaltyAc);
    setValue(acMappingFields.interestPayable, settings.InterestPayable);
    setValue(acMappingFields.interestReceivable, settings.InterestReceivable);
  }

  async function loadJson(url, fallbackMessage) {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || fallbackMessage);
    }

    return data.settings || {};
  }

  async function loadSystemSettings() {
    applySystemSettings(await loadJson("/api/system-settings/system", "Unable to load system settings"));
  }

  async function loadMapping2Settings() {
    applyMapping2Settings(await loadJson("/api/system-settings/mapping2", "Unable to load Mapping 2 settings"));
  }

  async function loadFinancialControlSettings() {
    applyFinancialControlSettings(await loadJson("/api/system-settings/financial-control", "Unable to load Financial Control settings"));
  }

  async function loadOtherSettings() {
    applyOtherSettings(await loadJson("/api/system-settings/other", "Unable to load Other settings"));
  }

  async function loadMiscSettings() {
    applyMiscSettings(await loadJson("/api/system-settings/misc", "Unable to load Miscellaneous settings"));
  }

  async function loadBillSetupSettings() {
    const response = await fetch("/api/system-settings/bill-setup");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load Bill Setup");
    }

    applyBillSetupSettings(data);
  }

  async function loadVoucherSettings() {
    applyVoucherSettings(await loadJson("/api/system-settings/voucher", "Unable to load Voucher settings"));
  }

  async function loadClosingMappingSettings() {
    const response = await fetch("/api/system-settings/closing-mapping");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load Closing Mapping");
    }

    applyClosingMappingSettings(data);
  }

  async function loadAcMappingSettings() {
    applyAcMappingSettings(await loadJson("/api/system-settings/ac-mapping", "Unable to load A/c Mapping settings"));
  }

  function getSystemPayload() {
    const lockDatesEnabled = fields.lockDateEnabled?.checked;

    return {
      DateType: fields.dateLD?.checked ? "LD" : "AD",
      DateFormat: fields.dateFormat?.value || getDateFormatForType(fields.dateLD?.checked ? "LD" : "AD"),
      ShowLastDate: fields.showLastDate?.checked || false,
      DefaultVoucherAction: fields.defaultPost?.checked ? "P" : "H",
      LockNew: fields.lockNew?.checked || false,
      LockEdit: fields.lockEdit?.checked || false,
      LockDelete: fields.lockDelete?.checked || false,
      LockDateFrom: lockDatesEnabled ? fields.lockDateFrom?.value || "" : "",
      LockDateTo: lockDatesEnabled ? fields.lockDateTo?.value || "" : "",
      AutoBackup: fields.autoBackup?.checked || false,
      AutoBackupDayDiff: fields.autoBackupDayDiff?.value || 0,
      BackupPath: fields.backupPath?.value || "",
      RemindBackup: fields.remindBackup?.checked || false,
      RemindBackupDayDiff: fields.remindBackupDayDiff?.value || 0,
      AutoPopUp: fields.autoFilterListings?.checked || false,
      SubGroupSystem: fields.subGroupSystem?.checked || false,
      UDF: fields.udf?.checked || false,
      ConfirmSaving: fields.confirmSaving?.checked || false,
    };
  }

  function getMapping2Payload() {
    return {
      GLIDTaxOnInterest: mapping2Fields.taxOnInterest?.value || "",
      GLIDContraLedgerForReceivableInterest: mapping2Fields.contraReceivableInterest?.value || "",
      GLIDShareAc: mapping2Fields.shareAcMainLedger?.value || "",
      InterestPostingVoucher: mapping2Fields.interestPostingVoucher?.value || "",
      ShareTransactionVoucher: mapping2Fields.shareTransactionVoucher?.value || "",
      NIC: mapping2Fields.nicBlock?.checked ? "B" : mapping2Fields.nicWarning?.checked ? "W" : "I",
      ShowShareAcInFrontPanel: mapping2Fields.showShareAcInFrontPanel?.checked || false,
      ShowStartupAlertForMaturedAccounts: mapping2Fields.showMaturedLoanAlert?.checked || false,
      DayClosing: mapping2Fields.dayClosing?.checked || false,
      FastDayClosing: mapping2Fields.fastDayClose?.checked || false,
      ShowStartupAlertForFixedMatured: mapping2Fields.showFixedMaturedAlert?.checked || false,
      ShowStartupAlertForInstallment: mapping2Fields.showInstallmentAlert?.checked || false,
    };
  }

  function getFinancialControlPayload() {
    return {
      NCB: getActionRadio({ block: financialFields.ncbBlock, warning: financialFields.ncbWarning, ignore: financialFields.ncbIgnore }),
      NBB: getActionRadio({ block: financialFields.nbbBlock, warning: financialFields.nbbWarning, ignore: financialFields.nbbIgnore }),
      MinCB: getActionRadio({ block: financialFields.minCBBlock, warning: financialFields.minCBWarning, ignore: financialFields.minCBIgnore }),
      MinCBAmount: financialFields.minCBAmount?.value || "",
      MaxCB: getActionRadio({ block: financialFields.maxCBBlock, warning: financialFields.maxCBWarning, ignore: financialFields.maxCBIgnore }),
      MaxCBAmount: financialFields.maxCBAmount?.value || "",
      MaxPBC: getActionRadio({ block: financialFields.maxPBCBlock, warning: financialFields.maxPBCWarning, ignore: financialFields.maxPBCIgnore }),
      MaxPBCAmount: financialFields.maxPBCAmount?.value || "",
    };
  }

  function getOtherPayload() {
    return {
      DocClassCaption: otherFields.docClassCaption?.value || "",
      ProfitCaption: otherFields.profitCaption?.value || "",
      LossCaption: otherFields.lossCaption?.value || "",
      ReportFooter: otherFields.reportFooter?.value || "",
      InterestTaxRate: otherFields.interestTaxRate?.value || "",
      SourceofFundMaxLimit: otherFields.sourceofFundMaxLimit?.value || "",
      SharePrice: otherFields.sharePrice?.value || "",
      InterestRound: otherFields.interestRound?.value || "None",
      InterestTaxDecimal: otherFields.interestTaxDecimal?.value || "None",
      StatementFormat: otherFields.statementFormat?.value || "Default",
      GLIDTrialDifference: otherFields.trialDifferenceLedger?.value || "",
      AlertforDocument: otherFields.alertforDocument?.checked || false,
    };
  }

  function getMiscPayload() {
    return {
      AutoCalculateInterestonTransactionPanel: miscFields.autoCalculateInterest?.checked || false,
      AutoDistributeAmountinTransactionPanel: miscFields.autoDistributeAmount?.checked || false,
      AskforInstallmentMonth: miscFields.askInstallmentDate?.checked || false,
      DayStart: miscFields.dayStart?.checked || false,
      DayStartAfter: miscFields.dayStartAfter?.value || 0,
      DayCloseByStartedUser: miscFields.dayCloseByStartedUser?.checked || false,
      LadderInterestonLoan: miscFields.ladderInterestonLoan?.checked || false,
      DifferentTaxationforPalika: miscFields.differentTaxationforPalika?.checked || false,
    };
  }

  function getBillSetupPayload() {
    return {
      billRows: readBillSetupRows(billSetupFields.billBody),
      acClosingRows: readBillSetupRows(billSetupFields.acClosingBody),
    };
  }

  function getVoucherPayload() {
    return {
      VoucherFooter: voucherFields.footer?.value || "",
    };
  }

  function getClosingMappingPayload() {
    return {
      settings: {
        GLIDIncomeTaxAc: closingMappingFields.incomeTax?.value || "",
        IncomeTaxPercent: closingMappingFields.incomeTaxPercent?.value || "",
        GLIDDividendTaxAc: closingMappingFields.dividendTax?.value || "",
        DividendTaxRate: closingMappingFields.dividendTaxRate?.value || "",
        GLIDPatronageRefundTaxAc: closingMappingFields.patronageRefundTax?.value || "",
      },
      mappingRows: readBillSetupRows(closingMappingFields.body),
    };
  }

  function getAcMappingPayload() {
    return {
      ShowTACode: acMappingFields.showTACode?.checked || false,
      VoucherOnlinePrint: acMappingFields.voucherOnlinePrint?.checked || false,
      SLWithMultipleGL: acMappingFields.slWithMultipleGL?.checked || false,
      CashBook: acMappingFields.cashBook?.value || "",
      ProfitLoss: acMappingFields.profitLoss?.value || "",
      GLIDInterestIncomeAc: acMappingFields.interestIncomeAc?.value || "",
      GLIDInterestExpenseAc: acMappingFields.interestExpenseAc?.value || "",
      GLIDRebateAc: acMappingFields.rebateAc?.value || "",
      GLIDPenaltyAc: acMappingFields.penaltyAc?.value || "",
      InterestPayable: acMappingFields.interestPayable?.value || "",
      InterestReceivable: acMappingFields.interestReceivable?.value || "",
    };
  }

  async function postJson(url, payload, fallbackMessage) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || fallbackMessage);
    }

    showMessage(data.message || "Settings saved");
  }

  async function saveActiveSettings() {
    if (activeSectionId() === "mapping2") {
      await postJson("/api/system-settings/mapping2", getMapping2Payload(), "Unable to save Mapping 2 settings");
      return;
    }

    if (activeSectionId() === "finance-control") {
      await postJson("/api/system-settings/financial-control", getFinancialControlPayload(), "Unable to save Financial Control settings");
      return;
    }

    if (activeSectionId() === "other") {
      await postJson("/api/system-settings/other", getOtherPayload(), "Unable to save Other settings");
      return;
    }

    if (activeSectionId() === "misc") {
      await postJson("/api/system-settings/misc", getMiscPayload(), "Unable to save Miscellaneous settings");
      return;
    }

    if (activeSectionId() === "bill-setup") {
      await postJson("/api/system-settings/bill-setup", getBillSetupPayload(), "Unable to save Bill Setup");
      await loadBillSetupSettings();
      return;
    }

    if (activeSectionId() === "vouchers") {
      await postJson("/api/system-settings/voucher", getVoucherPayload(), "Unable to save Voucher settings");
      return;
    }

    if (activeSectionId() === "closing-mapping") {
      await postJson("/api/system-settings/closing-mapping", getClosingMappingPayload(), "Unable to save Closing Mapping");
      await loadClosingMappingSettings();
      return;
    }

    if (activeSectionId() === "ac-mapping") {
      await postJson("/api/system-settings/ac-mapping", getAcMappingPayload(), "Unable to save A/c Mapping settings");
      return;
    }

    await postJson("/api/system-settings/system", getSystemPayload(), "Unable to save system settings");
  }

  systemLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showSystemTab(link.dataset.target);
      if (link.dataset.target === "system") loadSystemSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "mapping2") loadMapping2Settings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "finance-control") loadFinancialControlSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "other") loadOtherSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "misc") loadMiscSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "bill-setup") loadBillSetupSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "vouchers") loadVoucherSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "closing-mapping") loadClosingMappingSettings().catch((error) => showMessage(error.message));
      if (link.dataset.target === "ac-mapping") loadAcMappingSettings().catch((error) => showMessage(error.message));
    });
  });

  openButton?.addEventListener("click", () => {
    showSystemTab("system");
    Promise.all([loadSystemSettings(), loadMapping2Settings(), loadFinancialControlSettings(), loadOtherSettings(), loadMiscSettings(), loadBillSetupSettings(), loadVoucherSettings(), loadClosingMappingSettings(), loadAcMappingSettings()]).catch((error) => showMessage(error.message));
  });

  closeButton?.addEventListener("click", () => {
    movableDiv.style.display = "none";
  });

  cancelButton?.addEventListener("click", () => {
    movableDiv.style.display = "none";
  });

  browseButton?.addEventListener("click", () => {
    showMessage("Please type or paste the backup folder path.");
  });

  fields.lockDateEnabled?.addEventListener("change", toggleLockDates);
  fields.dateAD?.addEventListener("change", syncDateFormatInput);
  fields.dateLD?.addEventListener("change", syncDateFormatInput);
  mapping2Fields.dayClosing?.addEventListener("change", toggleDayCloseMode);
  miscFields.dayStart?.addEventListener("change", toggleDayStartAfter);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveActiveSettings().catch((error) => showMessage(error.message));
  });

  showSystemTab("system");
  toggleLockDates();
  toggleDayCloseMode();
  toggleDayStartAfter();
});