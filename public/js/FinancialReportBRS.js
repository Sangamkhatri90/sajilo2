document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const excel = { ledgers: null };   // optional

  const num = (v) => Number(v) || 0;
  const fmt = (n) => num(n).toFixed(2);
  const drCr = (n) => (n < 0 ? `${Math.abs(n).toFixed(2)} Dr` : `${n.toFixed(2)} Cr`);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const popup = $("popupTableDiv");
  const tbody = document.querySelector("#FR_BRS_TABLE tbody");

  // ---------- draggable result panel ----------
  let z = 3;
  (function makeDivMovable(div) {
    if (!div) return;
    let drag = false, dx, dy;
    div.addEventListener("mousedown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      e.preventDefault();
      div.style.zIndex = ++z;
      const r = div.getBoundingClientRect();
      dx = e.clientX - r.left; dy = e.clientY - r.top; drag = true;
    });
    document.addEventListener("mousemove", (e) => {
      if (!drag) return;
      div.style.left = `${e.pageX - dx}px`;
      div.style.top = `${e.pageY - dy}px`;
      div.style.position = "absolute";
    });
    document.addEventListener("mouseup", () => (drag = false));
  })(popup);

  ["brs-tb-okbutton", "closeTableButton"].forEach((id) =>
    $(id)?.addEventListener("click", (e) => { e.preventDefault(); popup.style.display = "none"; }));

  // ---------- export (this table only) ----------
  $("brs-tb-exportbutton")?.addEventListener("click", (e) => {
    e.preventDefault();
    const csv = [...document.querySelectorAll("#FR_BRS_TABLE tr")]
      .map((tr) => [...tr.querySelectorAll("th, td")]
        .map((c) => `"${c.innerText.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "table_data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // ---------- optional Excel (ledger sheet only) ----------
  $("selectFileBtninFRBRS").addEventListener("click", () => $("excelFileInputinFRBRS").click());

  $("excelFileInputinFRBRS").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "array" });
      const ws = wb.Sheets["TbLedgderMaster"];
      if (!ws) return showCustomAlert("Sheet 'TbLedgderMaster' not found.");
      excel.ledgers = XLSX.utils.sheet_to_json(ws).map((r) => ({
        particular: r.GLName || "",
        alias: r.GlAlias || "",
        openingDebit: num(r.OpeningBalanceDr),
        openingCredit: num(r.OpeningBalanceCr),
      }));
      showCustomAlert("Excel loaded. It is used only for opening balances the database can't provide.");
    };
    reader.readAsArrayBuffer(file);
  });

  // ---------- render ----------
  const detailRow = (r) =>
    `<tr><td>${esc(r.label)}</td><td>${esc(r.alias)}</td><td>${esc(r.chequeNo)}</td>` +
    `<td>${esc(r.chequeDate)}</td><td>${esc(r.voucherNo)}</td><td>${esc(r.voucherDate)}</td>` +
    `<td>${fmt(r.amount)}</td></tr>`;

  function render(bank, data) {
    const sum = (rows) => rows.reduce((s, r) => s + num(r.amount), 0);

    const bookBalance = num(data.totalCr) - num(data.totalDr);   // Cr positive, Dr negative
    const addTotal = sum(data.addRows);
    const lessTotal = sum(data.lessRows);
    const actual = bookBalance + addTotal - lessTotal;

    tbody.innerHTML =
      `<tr><td class="no-border"><strong>${esc(bank)}</strong></td>${'<td class="no-border"></td>'.repeat(6)}</tr>` +
      `<tr><td class="hide-column"><strong>BankCash/BankBook</strong></td>${'<td class="hide-column"></td>'.repeat(5)}` +
      `<td><strong>${drCr(bookBalance)}</strong></td></tr>` +

      `<tr><td colspan="6"><strong>ADD(+): CHEQUE ISSUED BUT NOT PRESENTED</strong></td><td></td></tr>` +
      data.addRows.map(detailRow).join("") +
      `<tr><td colspan="6"><strong>Total of Cheques Issued</strong></td><td><strong>${fmt(addTotal)}</strong></td></tr>` +

      `<tr><td colspan="6"><strong>LESS(-): CHEQUE DEPOSITED BUT NOT CLEARED</strong></td><td></td></tr>` +
      data.lessRows.map(detailRow).join("") +
      `<tr><td colspan="6"><strong>Total of Deposits Not Cleared</strong></td><td><strong>${fmt(lessTotal)}</strong></td></tr>` +

      `<tr><td colspan="6"><strong>ACTUAL BALANCE</strong></td><td><strong>${drCr(actual)}</strong></td></tr>`;

    popup.style.display = "block";
  }

  // ---------- OK ----------
  $("BankRS-ok-button").addEventListener("click", async (e) => {
    e.preventDefault();

    const bank = $("bank-name-input").value.trim();
    const from = $("BRSdateFrom").value;
    const to = $("BRSdateTo").value;

    if (!bank) return showCustomAlert("Please select a Bank Book.");
    if (!from || !to) return showCustomAlert("Please provide both From and To dates.");

    let res;
    try {
      res = await fetch("/api/bankReconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankBookName: bank,
          fromDate: from,   // server normalizes AD/LD format
          toDate: to,
          showSubLedger: $("show-sub-ledger").checked,
          excelLedgers: excel.ledgers,
        }),
      });
    } catch {
      return showCustomAlert("Network error while loading data.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load bank reconciliation.");
    }

    const data = await res.json();
    if (data.meta?.noData) {
      tbody.innerHTML = "";
      popup.style.display = "block";
      return showCustomAlert("No data available for the selected period.");
    }
    render(bank, data);
  });
});