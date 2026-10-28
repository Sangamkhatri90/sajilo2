document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const excel = { ledgers: null };   // optional

  const num = (v) => Number(v) || 0;
  const fmt = (n) => num(n).toFixed(2);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const tPanel = $("Tformat_subgroup");
  const nPanel = $("Normalformat_subgroup");
  const tBody = document.querySelector("#RPTfromatTable tbody");
  const nBody = document.querySelector("#RPNormalfromatTable tbody");

  // ---------- draggable dialogs ----------
  let z = 3;
  function makeDivMovable(div) {
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
  }
  makeDivMovable(tPanel);
  makeDivMovable(nPanel);

  [[tPanel, ["TfromatSubGroupcrossbtn", "TfotmatSubGrpOKbtn"]],
   [nPanel, ["NormalformatSubGroupcrossbtn", "NormalformatSubGrpOKbtn"]]]
    .forEach(([panel, ids]) => ids.forEach((id) =>
      $(id)?.addEventListener("click", () => { if (panel) panel.style.display = "none"; })));

  // ---------- optional Excel (ledger sheet only) ----------
  $("selectFileBtninFRRandP").addEventListener("click", () => $("excelFileInputinFRRandP").click());

  $("excelFileInputinFRRandP").addEventListener("change", (e) => {
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

  // ---------- generic section renderer ----------
  // rows: [{ particular, alias, cells: [{ text, add }] }], one cell per amount column
  function addSection(tbody, heading, rows, nCols) {
    const totals = Array(nCols).fill(0);
    let html = `<tr><td colspan="${3 + nCols}" class="rp-head">${esc(heading)}</td></tr>`;

    rows.forEach((r, i) => {
      html += `<tr><td>${i + 1}</td><td>${esc(r.particular)}</td><td>${esc(r.alias)}</td>` +
        r.cells.map((c, k) => { totals[k] += c.add; return `<td>${c.text}</td>`; }).join("") + `</tr>`;
    });

    html += `<tr class="rp-total"><td colspan="3" style="text-align:right;">Total</td>` +
      totals.map((t) => `<td>${fmt(t)}</td>`).join("") + `</tr>`;

    tbody.insertAdjacentHTML("beforeend", html);
    return totals;
  }

  const addGrand = (tbody, totals) =>
    tbody.insertAdjacentHTML("beforeend",
      `<tr class="rp-grand"><td colspan="3" style="text-align:right;">Grand Total</td>` +
      totals.map((t) => `<td>${fmt(t)}</td>`).join("") + `</tr>`);

  const blank = { text: "", add: 0 };
  const amt = (v) => ({ text: fmt(v), add: v });

  // ---------- T-format: receipt | payment ----------
  function renderT(data) {
    tBody.innerHTML = "";

    const opening = data.openingBalance.map((r) => {
      const rec = num(r.openingCredit), pay = num(r.openingDebit), bal = Math.abs(rec - pay);
      return {
        ...r,
        cells: [
          rec >= pay && bal > 0 ? amt(bal) : blank,
          pay > rec ? amt(bal) : blank,
        ],
      };
    });

    const transaction = data.transaction.map((r) => ({
      ...r, cells: [amt(num(r.periodCredit)), amt(num(r.periodDebit))],
    }));

    // Closing balance: debit balance sits on the payment side, credit on the receipt side
    const balance = data.balance.map((r) => ({
      ...r, cells: r.side === "Dr" ? [blank, amt(r.amount)] : [amt(r.amount), blank],
    }));

    const t = [
      addSection(tBody, "Opening Balance", opening, 2),
      addSection(tBody, "Transaction", transaction, 2),
      addSection(tBody, "Balance", balance, 2),
    ];
    addGrand(tBody, [0, 1].map((k) => t.reduce((s, x) => s + x[k], 0)));
  }

  // ---------- Normal format: single amount column ----------
  function renderN(data) {
    nBody.innerHTML = "";

    const opening = data.openingBalance.map((r) => {
      const rec = num(r.openingCredit), pay = num(r.openingDebit), bal = Math.abs(rec - pay);
      let cell;
      if (rec >= pay && bal > 0) cell = amt(bal);
      else if (pay > rec) cell = { text: `(${fmt(bal)})`, add: bal };
      else cell = { text: "0.00", add: 0 };
      return { ...r, cells: [cell] };
    });

    const receipts = data.transaction
      .filter((r) => num(r.periodCredit) !== 0)
      .map((r) => ({ ...r, cells: [amt(num(r.periodCredit))] }));

    const payments = data.transaction
      .filter((r) => num(r.periodDebit) !== 0)
      .map((r) => ({ ...r, cells: [amt(num(r.periodDebit))] }));

    const balance = data.balance.map((r) => ({ ...r, cells: [amt(r.amount)] }));

    const t = [
      addSection(nBody, "Opening Balance", opening, 1),
      addSection(nBody, "Receipt", receipts, 1),
      addSection(nBody, "Payment", payments, 1),
      addSection(nBody, "Balance", balance, 1),
    ];
    addGrand(nBody, [t.reduce((s, x) => s + x[0], 0)]);
  }

  // ---------- OK ----------
  $("ReceiptandpaymentOkButton").addEventListener("click", async (e) => {
    e.preventDefault();
    tPanel.style.display = "none";
    nPanel.style.display = "none";

    const isT = $("RP-t-format").checked;
    const isN = $("RP-normal-format").checked;
    if (!isT && !isN) return showCustomAlert("Please select a display format.");

    const from = $("RAndP_dateFrom").value;
    const to = $("RAndP_dateTo").value;
    if (!from || !to) return showCustomAlert("Please provide both From and To dates.");

    (isT ? tPanel : nPanel).style.display = "block";

    let res;
    try {
      res = await fetch("/api/receiptPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate: from, toDate: to, excelLedgers: excel.ledgers }),
      });
    } catch {
      return showCustomAlert("Network error while loading data.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load Receipt & Payment.");
    }

    const data = await res.json();
    if (data.meta?.noData) {
      (isT ? renderT : renderN)({ openingBalance: [], transaction: [], balance: [] });
      return showCustomAlert("No data available for the selected period.");
    }
    (isT ? renderT : renderN)(data);
  });
});