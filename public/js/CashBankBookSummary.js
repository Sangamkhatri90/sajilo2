document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const num = (v) => Number(v) || 0;
  const money = (n) => num(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const bal = (n) => `${money(Math.abs(n))} ${n < 0 ? "Cr" : "Dr"}`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const form = $("myForm11");
  form?.addEventListener("submit", (e) => e.preventDefault());   // never refresh the page

  const panel = $("cbb-data-summaryonlydiv1");
  const body = document.querySelector("#cbb-data-summaryonlytable tbody");
  const title = panel?.querySelector("h2");
  const ledgerInput = $("bookscashbank-bank-input"), docInput = $("doc-class-books-cbb");
  const from = $("books-cbb-datefrom"), to = $("books-cbb-dateto"), cbSummary = $("books-cbb-SOCB");

  const required = { form, panel, body, title, ledgerInput, docInput, from, to, cbSummary };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return console.error("Cash/Bank Book: missing element(s):", missing.join(", "));

  const closePanel = () => (panel.style.display = "none");
  $("closeCbbSummaryOnly")?.addEventListener("click", closePanel);
  $("books-cbbdata-OKbtnSO")?.addEventListener("click", closePanel);

  form.addEventListener("submit", async () => {
    closePanel();
    if (!ledgerInput.value.trim()) return showCustomAlert("Please select a Cash/Bank ledger.");
    if (!from.value || !to.value) return showCustomAlert("Please provide both From and To dates.");
    if (!cbSummary.checked) return showCustomAlert("Only the Summary Only view is available for now.");

    let res;
    try {
      res = await fetch("/api/cashBankBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: from.value,
          toDate: to.value,
          ledgerName: ledgerInput.value.trim(),
          docClassName: docInput.value.trim(),
        }),
      });
    } catch { return showCustomAlert("Network error while loading data."); }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load Cash/Bank Book Summary.");
    }

    const { ledger, rows } = await res.json();
    title.textContent = ledger;

    let tr = 0, tp = 0;
    const right = 'style="text-align:right"';
    body.innerHTML = rows.map((r, i) => {
      tr += r.receipt; tp += r.payment;
      return `<tr><td>${i + 1}</td><td>${esc(r.date)}</td>` +
        `<td ${right}>${bal(r.opening)}</td>` +
        `<td ${right}>${r.receipt ? money(r.receipt) : ""}</td>` +
        `<td ${right}>${r.payment ? money(r.payment) : ""}</td>` +
        `<td ${right}>${bal(r.balance)}</td></tr>`;
    }).join("") +
      `<tr class="rp-grand"><td colspan="3" ${right}>Total</td>` +
      `<td ${right}>${money(tr)}</td><td ${right}>${money(tp)}</td><td></td></tr>`;

    panel.style.display = "block";
  });
});