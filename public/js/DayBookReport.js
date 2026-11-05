document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const num = (v) => Number(v) || 0;
  const fmt = (n) => num(n).toFixed(2);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const form = $("myForm22");
  // Never let the browser do a native submit (page refresh)
  form?.addEventListener("submit", (e) => e.preventDefault());

  const tPanel = $("DB_Tpanel"), nPanel = $("DB_Npanel");
  const tBody = document.querySelector("#DBTTable tbody");
  const nBody = document.querySelector("#DBNTable tbody");
  const cbSummary = $("summary-only"), cbDetail = $("merge-cash-bank"),
        cbZero = $("show-zero-balance"), cbUser = $("filter-for-user"),
        docInput = $("doc-class-books-day-b");
  const userPanel = $("DB_UserPanel"), userSel = $("DBUserSel");
  const userBody = document.querySelector("#DBUserTable tbody");

  const required = { form, tPanel, nPanel, tBody, nBody, cbSummary, cbDetail,
                     cbZero, cbUser, docInput, userPanel, userSel, userBody };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.error("Day Book: missing element(s):", missing.join(", "));
    return;
  }

  ["DBTclose", "DBNclose"].forEach((id, i) =>
    $(id)?.addEventListener("click", () => ((i ? nPanel : tPanel).style.display = "none")));

  // ---------- Summary Only disables Merge Cash/Bank ----------
  cbSummary.addEventListener("change", () => {
    if (cbSummary.checked) cbDetail.checked = false;
    cbDetail.disabled = cbSummary.checked;
  });

  // ---------- Filter For User ----------
  let selectedUser = "";

  async function openUserList() {
    let res;
    try { res = await fetch("/api/dayBook/users"); }
    catch { cbUser.checked = false; return showCustomAlert("Network error while loading users."); }
    if (!res.ok) { cbUser.checked = false; return showCustomAlert("Failed to load users."); }

    const users = await res.json();
    userBody.innerHTML = users.map((u) =>
      `<tr data-user="${esc(u.UserName)}" style="cursor:pointer;">` +
      `<td>${esc(u.UserName)}</td><td>${esc(u.FullName)}</td></tr>`).join("");
    userPanel.style.display = "block";
  }

  userBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-user]");
    if (!tr) return;
    selectedUser = tr.dataset.user;
    userSel.textContent = selectedUser;
    userPanel.style.display = "none";
  });

  $("DBUserClose")?.addEventListener("click", () => {
    userPanel.style.display = "none";
    if (!selectedUser) cbUser.checked = false;
  });

  cbUser.addEventListener("change", () => {
    if (cbUser.checked) openUserList();
    else { selectedUser = ""; userSel.textContent = ""; userPanel.style.display = "none"; }
  });

  // ---------- renderer (same as Receipt & Payment) ----------
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

  function renderT(data) {
    tBody.innerHTML = "";
    const opening = data.openingBalance.map((r) => {
      const net = num(r.openingDebit) - num(r.openingCredit);
      return { ...r, cells: [net > 0 ? amt(net) : blank, net < 0 ? amt(-net) : blank] };
    });
    const transaction = data.transaction.map((r) => ({
      ...r, cells: [amt(num(r.periodCredit)), amt(num(r.periodDebit))],
    }));
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
    const receipts = data.transaction.map((r) => ({ ...r, cells: [amt(num(r.periodCredit))] }));
    const payments = data.transaction.map((r) => ({ ...r, cells: [amt(num(r.periodDebit))] }));
    const keep = cbZero.checked ? (x) => x : (x) => x.filter((r) => r.cells[0].add !== 0);
    const balance = data.balance.map((r) => ({ ...r, cells: [amt(r.amount)] }));
    const t = [
      addSection(nBody, "Opening Balance", opening, 1),
      addSection(nBody, "Receipt", keep(receipts), 1),
      addSection(nBody, "Payment", keep(payments), 1),
      addSection(nBody, "Balance", balance, 1),
    ];
    addGrand(nBody, [t.reduce((s, x) => s + x[0], 0)]);
  }

  // ---------- submit ----------
  form.addEventListener("submit", async () => {
    tPanel.style.display = "none";
    nPanel.style.display = "none";

    const isT = $("t-format").checked, isN = $("normal-format").checked;
    if (!isT && !isN) return showCustomAlert("Please select a display format.");

    const from = $("nepali-date").value, to = $("nepali-date1").value;
    if (!from || !to) return showCustomAlert("Please provide both From and To dates.");
    if (cbUser.checked && !selectedUser) return showCustomAlert("Please select a user.");

    let res;
    try {
      res = await fetch("/api/dayBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: from,
          toDate: to,
          detail: cbDetail.checked,
          showZero: cbZero.checked,
          userName: cbUser.checked ? selectedUser : "",
          docClassName: docInput.value.trim(),
        }),
      });
    } catch {
      return showCustomAlert("Network error while loading data.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load Day Book.");
    }

    const data = await res.json();
    (isT ? tPanel : nPanel).style.display = "block";
    (isT ? renderT : renderN)(data);
  });
});