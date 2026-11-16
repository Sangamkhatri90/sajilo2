document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("myForm14");
  const resultDiv = document.getElementById("mainCashNNonCashDiv");
  const memberDiv = document.getElementById("CRmemSelectTypeDiv");
  const ledgerDiv = document.getElementById("CRaccountSelectTypeDiv");
  const resultBody = document.querySelector("#closeallCashNNonCashTab tbody");
  const pageSizes = [100, 200, 500];
  let resultRows = [];
  let resultPage = 1;
  let resultPageSize = 200;
  let pendingRequest = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const formatDate = value => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
  };

  function renderPagination(containerId, total, page, pageSize, setPage, setPageSize) {
    const container = document.getElementById(containerId);
    const pageCount = Math.ceil(total / pageSize);
    const start = total ? ((page - 1) * pageSize) + 1 : 0;
    const end = Math.min(page * pageSize, total);
    container.innerHTML = `
      <button type="button" data-page="previous" aria-label="Previous page" ${page <= 1 ? "disabled" : ""}>‹</button>
      <span>Page</span>
      <select data-page-select aria-label="Page" ${pageCount ? "" : "disabled"}>
        ${Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}" ${index + 1 === page ? "selected" : ""}>${index + 1}</option>`).join("")}
      </select>
      <span>/ ${pageCount}</span>
      <button type="button" data-page="next" aria-label="Next page" ${page >= pageCount ? "disabled" : ""}>›</button>
      <span>${total ? `${start}-${end} of ${total}` : "No results"}</span>
      <label>Rows:
        <select data-page-size aria-label="Rows per page">
          ${pageSizes.map(size => `<option value="${size}" ${size === pageSize ? "selected" : ""}>${size}</option>`).join("")}
        </select>
      </label>`;
    container.querySelector('[data-page="previous"]').onclick = () => setPage(page - 1);
    container.querySelector('[data-page="next"]').onclick = () => setPage(page + 1);
    container.querySelector('[data-page-select]').onchange = event => setPage(Number(event.target.value));
    container.querySelector('[data-page-size]').onchange = event => setPageSize(Number(event.target.value));
  }

  const lists = {
    member: {
      rows: [], page: 1, pageSize: 200, search: "", selected: new Set(),
      body: document.querySelector("#CRmemlistTable tbody"),
      pagerId: "crMemberListPagination", searchId: "CRmemListFormSearch",
      idKey: "SLID", nameKey: "SLName", aliasKey: "SlAlias", checkboxClass: "CRmemlistDiv-CR",
      form: document.getElementById("CRmemListForm"), div: memberDiv,
      selectAllId: "CRmemlistselectallButton", unselectId: "CRmemlistunselectButton", filterKey: "checkedCRmemValuesCR"
    },
    ledger: {
      rows: [], page: 1, pageSize: 200, search: "", selected: new Set(),
      body: document.querySelector("#CRlgrlistTable tbody"),
      pagerId: "crLedgerListPagination", searchId: "CRlgrListFormsearch",
      idKey: "GLID", nameKey: "GLName", aliasKey: "GLAlias", checkboxClass: "CRlgrlistDiv-CR",
      form: document.getElementById("CRlgrListForm"), div: ledgerDiv,
      selectAllId: "CRlgrlistselectallbtn", unselectId: "CRlgrlistunselectallbtn", filterKey: "checkedCRlgrValuesCR"
    }
  };

  function renderList(list) {
    const search = list.search.toLocaleLowerCase();
    const filtered = list.rows.filter(row => `${row[list.nameKey] || ""} ${row[list.aliasKey] || ""}`.toLocaleLowerCase().includes(search));
    const offset = (list.page - 1) * list.pageSize;
    list.body.innerHTML = filtered.slice(offset, offset + list.pageSize).map((row, index) => {
      const id = String(row[list.idKey]);
      return `<tr>
        <td><input type="checkbox" class="${list.checkboxClass}" value="${escapeHtml(id)}" ${list.selected.has(id) ? "checked" : ""}></td>
        <td>${offset + index + 1}</td>
        <td>${escapeHtml(row[list.nameKey])}</td>
        <td>${escapeHtml(row[list.aliasKey])}</td>
      </tr>`;
    }).join("");
    renderPagination(list.pagerId, filtered.length, list.page, list.pageSize,
      page => { list.page = page; renderList(list); },
      size => { list.pageSize = size; list.page = 1; renderList(list); });
  }

  async function loadList(name) {
    const list = lists[name];
    const endpoint = name === "member" ? "/fetchmemberListforPandR" : "/fetchLedgerListforPandR";
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    list.rows = result[name === "member" ? "AccName" : "postingLedgers"] || [];
    list.page = 1;
    list.search = "";
    list.selected.clear();
    document.getElementById(list.searchId).value = "";
    renderList(list);
    list.div.style.display = "block";
  }

  async function fetchChequeRows({ dates, status, filterName, ids, excludeSystemLedger = false }) {
    const endpoints = {
      all: { none: "/fetch-chequeCashNNonCash-data", member: "/fetch-chequeAll-filterdata", ledger: "/fetch-chequeAll-filterdata2" },
      cashed: { none: "/fetch-chequeCashNNonCashUC-data", member: "/fetch-chequeCashNNonCashUC-filterdata", ledger: "/fetch-chequeCashNNonCashUC-filterdata2" },
      uncashed: { none: "/fetch-chequeCashUCNNonCash-data", member: "/fetch-chequeCashUCNNonCash-filterdata", ledger: "/fetch-chequeCashUCNNonCash-filterdata2" }
    };
    const body = { dateFromChequeR: dates.from, dateToChequeR: dates.to };
    if (excludeSystemLedger) body.excludeSystemLedger = true;
    if (filterName) body[lists[filterName].filterKey] = ids.map(id => ({ [lists[filterName].idKey]: id }));
    const response = await fetch(endpoints[status][filterName || "none"], {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to fetch cheque register data");
    resultRows = result.data || result;
    resultPage = 1;
    renderResults();
    resultDiv.style.display = "block";
  }

  function renderResults() {
    const offset = (resultPage - 1) * resultPageSize;
    const pageRows = resultRows.slice(offset, offset + resultPageSize);
    const totalAmount = resultRows.reduce((total, row) => total + (Number(row.DrAmount) || 0), 0);
    resultBody.innerHTML = pageRows.map((row, index) => `
      <tr>
        <td>${offset + index + 1}</td>
        <td>${escapeHtml(row.ChequeNo)}</td>
        <td>${escapeHtml(row.SlAlias)}</td>
        <td>${escapeHtml(row.SLName)}</td>
        <td>${escapeHtml(formatDate(row.IssueDate))}</td>
        <td>${escapeHtml(formatDate(row.JournalDate || row.JVMiti))}</td>
        <td>${escapeHtml(row.VoucherNo)}</td>
        <td>${row.DrAmount ? Number(row.DrAmount).toLocaleString() : ""}</td>
      </tr>`).join("") + `
      <tr style="font-weight: bold;">
        <td colspan="7" style="text-align: right;">Total:</td>
        <td>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>`;
    renderPagination("crResultPagination", resultRows.length, resultPage, resultPageSize,
      page => { resultPage = page; renderResults(); },
      size => { resultPageSize = size; resultPage = 1; renderResults(); });
  }

  function makeDivMovable(div) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    div.addEventListener("mousedown", event => {
      if (event.target.closest("input, textarea, button, select, label, a")) return;
      event.preventDefault();
      const rect = div.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      dragging = true;
    });
    document.addEventListener("mousemove", event => {
      if (!dragging) return;
      div.style.position = "absolute";
      div.style.left = `${event.pageX - offsetX}px`;
      div.style.top = `${event.pageY - offsetY}px`;
    });
    document.addEventListener("mouseup", () => { dragging = false; });
  }

  Object.values(lists).forEach(list => {
    document.getElementById(list.searchId).addEventListener("input", event => {
      event.stopPropagation();
      list.search = event.target.value;
      list.page = 1;
      renderList(list);
    });
    list.body.addEventListener("change", event => {
      const checkbox = event.target.closest(`.${list.checkboxClass}`);
      if (!checkbox) return;
      if (checkbox.checked) list.selected.add(checkbox.value);
      else list.selected.delete(checkbox.value);
    });
    document.getElementById(list.selectAllId).addEventListener("click", event => {
      event.preventDefault();
      list.rows.forEach(row => list.selected.add(String(row[list.idKey])));
      renderList(list);
    });
    document.getElementById(list.unselectId).addEventListener("click", event => {
      event.preventDefault();
      list.selected.clear();
      renderList(list);
    });
    list.form.addEventListener("submit", async event => {
      event.preventDefault();
      const ids = Array.from(list.selected);
      if (!ids.length) return showCustomAlert("No values selected");
      const dates = pendingRequest;
      list.div.style.display = "none";
      try {
        const allSelected = ids.length === list.rows.length;
        await fetchChequeRows({
          dates,
          status: dates.status,
          filterName: allSelected ? null : list === lists.member ? "member" : "ledger",
          ids: allSelected ? [] : ids,
          excludeSystemLedger: allSelected && list === lists.ledger
        });
      } catch (error) {
        console.error("[Cheque Register]", error);
        showCustomAlert(error.message || "Unable to load cheque register");
      }
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const from = document.getElementById("CRIssueDateFrom").value;
    const to = document.getElementById("CRIssueDateTo").value;
    const selectType = document.getElementById("CRSelectAllType").checked;
    const selectAccount = document.getElementById("CRSelectAllAccount").checked;
    const cashed = document.getElementById("CRCashed").checked;
    const uncashed = document.getElementById("CRNonCashed").checked;
    if (!from || !to) return showCustomAlert("Select an issue date range");
    if (!cashed && !uncashed) return showCustomAlert("Select either Cashed or Not cashed");
    if (!selectType && !selectAccount) return showCustomAlert("Select an account or account type");
    const status = cashed && uncashed ? "all" : cashed ? "cashed" : "uncashed";
    const dates = { from, to, status };
    try {
      if (selectType !== selectAccount) {
        pendingRequest = dates;
        await loadList(selectType ? "member" : "ledger");
        return;
      }
      await fetchChequeRows({ dates, status, filterName: null, ids: [] });
    } catch (error) {
      console.error("[Cheque Register]", error);
      showCustomAlert(error.message || "Unable to load cheque register");
    }
  });

  [
    ["closeallCashNNonCashDiv", resultDiv], ["cancelallCashNNonCashDiv", resultDiv], ["okCashNNonCashDiv", resultDiv],
    ["CRmemlistCancelButton", memberDiv], ["CRmemlistcloseButton", memberDiv],
    ["CRlgrlistCancelButton", ledgerDiv], ["CRlgrlistcloseButton", ledgerDiv], ["cancelButton14", form.closest("#movableDiv14")]
  ].forEach(([id, element]) => document.getElementById(id).addEventListener("click", event => {
    event.preventDefault();
    if (element) element.style.display = "none";
  }));
  [resultDiv, memberDiv, ledgerDiv, document.getElementById("movableDiv14")].forEach(makeDivMovable);

  document.getElementById("crPrintButton").addEventListener("click", () => window.print());
  document.getElementById("crExportButton").addEventListener("click", () => {
    const headers = ["SN", "Cheque No", "Account No", "A/c", "Cheque Date", "Voucher Date", "Voucher No", "Amount"];
    const rows = resultRows.map((row, index) => [index + 1, row.ChequeNo, row.SlAlias, row.SLName, formatDate(row.IssueDate), formatDate(row.JournalDate || row.JVMiti), row.VoucherNo, row.DrAmount]);
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    link.download = "cheque-register.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });
});
