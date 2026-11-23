document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const money = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cellMoney = (v) => (v === null || v === undefined ? "" : money(v));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const form = $("myForm48");
  const asOnInput = $("pearls-as-on-date");
  const docInput = $("doc-class-fin-rep-pearls");
  const panel = $("pearlsreportDiv");
  const body = document.querySelector("#pearls-data-table tbody");
  const title = $("pearlsReportTitle");
  const qBox = $("pearlsQualityBox");
  const qList = $("pearlsQualityList");

  const required = { form, asOnInput, docInput, panel, body, title, qBox, qList };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return console.error("PEARLS: missing element(s):", missing.join(", "));

  form.addEventListener("submit", (e) => e.preventDefault());   // never refresh the page

  let lastData = null;
  const closePanel = () => { panel.style.display = "none"; };
  $("pearlsCloseBtn")?.addEventListener("click", closePanel);
  $("pearlsOkBtn")?.addEventListener("click", closePanel);

  function render(data) {
    lastData = data;
    title.textContent = `PEARLS Report as on ${data.asOnDate}`;

    const right = 'style="text-align:right"';
    body.innerHTML = data.rows.map((r) => {
      if (r.sector) {                                    // section header row
        return `<tr style="background:#e0f7fa;font-weight:bold;">` +
               `<td colspan="5">${esc(r.sector)} - ${esc(r.title)}</td></tr>`;
      }
      return `<tr><td>${esc(r.title)}</td><td>${esc(r.standard)}</td>` +
             `<td ${right}>${cellMoney(r.numerator)}</td>` +
             `<td ${right}>${cellMoney(r.denominator)}</td>` +
             `<td ${right}>${r.ratio === null ? "--" : money(r.ratio)}</td></tr>`;
    }).join("");

    // data-quality notes
    const q = data.quality || {};
    const notes = [];
    if (q.ClosedLoansWithBalance?.count)
      notes.push(`${q.ClosedLoansWithBalance.count} closed loan(s) still carry ${money(q.ClosedLoansWithBalance.amount)}: included in total loans, excluded from delinquency.`);
    if (q.LoansNoDueDate?.count)
      notes.push(`${q.LoansNoDueDate.count} loan(s) (${money(q.LoansNoDueDate.amount)}) have no due date and are treated as not delinquent.`);
    if (q.UnpostedVouchers?.count)
      notes.push(`${q.UnpostedVouchers.count} voucher(s) up to this date are not posted and are excluded.`);
    if (q.VouchersNoADDate?.count)
      notes.push(`${q.VouchersNoADDate.count} posted voucher(s) have no English date (JV_Date) and are excluded.`);
    if (q.ClosedFlagNoClosedDate?.count)
      notes.push(`${q.ClosedFlagNoClosedDate.count} share account(s) are flagged closed without a closed date and are still counted as members.`);
    if (q.SharesNoMemberId?.count)
      notes.push(`${q.SharesNoMemberId.count} share account(s) have no member ID.`);
    qList.innerHTML = notes.map((n) => `<li>${esc(n)}</li>`).join("");
    qBox.style.display = notes.length ? "block" : "none";

    panel.style.display = "block";
  }

  // ---------- submit ----------
  form.addEventListener("submit", async () => {
    const asOnDate = asOnInput.value;
    closePanel();
    if (!asOnDate) return showCustomAlert("Please provide the As on date.");

    let res;
    try {
      res = await fetch("/api/pearls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asOnDate, docClassName: docInput.value.trim() }),
      });
    } catch { return showCustomAlert("Network error while loading data."); }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load PEARLS report.");
    }
    render(await res.json());
  });

  // ---------- print / export ----------
  $("pearlsPrintBtn")?.addEventListener("click", () => {
    if (!lastData) return;
    const w = window.open("", "_blank");
    w.document.write(
      "<html><head><title>PEARLS</title><style>table{border-collapse:collapse;width:100%}" +
      "td,th{border:1px solid #000;padding:4px}</style></head><body>" +
      `<h3>${esc(title.textContent)}</h3>` +
      document.getElementById("pearls-data-table").outerHTML +
      "</body></html>");
    w.document.close();
    w.print();
  });

  $("pearlsExportBtn")?.addEventListener("click", () => {
    if (!lastData) return;
    const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const lines = [["Sector", "Indicator", "Standard", "Numerator", "Denominator", "Result (%)"].map(q).join(",")];
    lastData.rows.forEach((r) =>
      lines.push([r.sector, r.title, r.standard, r.numerator, r.denominator, r.ratio].map(q).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `PEARLS_${String(lastData.asOnDate).replace(/[\/]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
});