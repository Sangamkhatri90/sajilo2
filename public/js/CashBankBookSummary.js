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
  const from = $("books-cbb-datefrom"), to = $("books-cbb-dateto");
  const cbSummary = $("books-cbb-SOCB"), cbUser = $("books-cbb-FFU");
  const userPanel = $("CBB_UserPanel"), userSel = $("CBB_UserSel");
  const userBody = document.querySelector("#CBB_UserTable tbody");
    const nPanel = $("cbb-data-normal1div");
  const nBody = document.querySelector("#cbb-data-normaltable tbody");
  const nTitle = nPanel?.querySelector("h2");
  const cbNarrT = $("books-cbb-SNT"), cbNarrM = $("books-cbb-SNM");
  const cbSubL = $("books-cbb-SSL"), cbAlias = $("books-cbb-SA");
  const cbTB = $("books-cbb-STB"), cbDB = $("books-cbb-SDB");
  const cbChq = $("books-cbb-SCD");

  const required = { form, panel, body, title, ledgerInput, docInput, from, to,
                     cbSummary, cbUser, userPanel, userSel, userBody, nPanel, 
                     nBody, nTitle, cbNarrT, cbNarrM, cbSubL, cbAlias, cbChq };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return console.error("Cash/Bank Book: missing element(s):", missing.join(", "));

  const closePanel = () => { panel.style.display = "none"; nPanel.style.display = "none"; };
  [panel, nPanel].forEach((resultPanel) => {
    const header = resultPanel.querySelector(".cbb-summary-only-header");
    let dragState = null;

    header.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      const rect = resultPanel.getBoundingClientRect();
      resultPanel.style.transform = "none";
      resultPanel.style.left = `${rect.left}px`;
      resultPanel.style.top = `${rect.top}px`;
      dragState = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      header.classList.add("is-dragging");
      header.setPointerCapture(event.pointerId);
    });

    header.addEventListener("pointermove", (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const rect = resultPanel.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
      resultPanel.style.left = `${Math.min(Math.max(event.clientX - dragState.offsetX, margin), maxLeft)}px`;
      resultPanel.style.top = `${Math.min(Math.max(event.clientY - dragState.offsetY, margin), maxTop)}px`;
    });

    const stopDragging = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      header.classList.remove("is-dragging");
      header.releasePointerCapture(event.pointerId);
      dragState = null;
    };
    header.addEventListener("pointerup", stopDragging);
    header.addEventListener("pointercancel", stopDragging);
  });
  $("books-cbbdata-OKbtn")?.addEventListener("click", closePanel);
  $("closeCbbNormal")?.addEventListener("click", closePanel);
  $("closeCbbSummaryOnly")?.addEventListener("click", closePanel);
  $("books-cbbdata-OKbtnSO")?.addEventListener("click", closePanel);

  // ---------- Summary Only disables every other checkbox except Filter For User ----------
  const otherBoxes = [...form.querySelectorAll('input[type="checkbox"]')]
    .filter((cb) => cb !== cbSummary && cb !== cbUser);

  cbSummary.addEventListener("change", () => {
    otherBoxes.forEach((cb) => {
      if (cbSummary.checked) cb.checked = false;
      cb.disabled = cbSummary.checked;
    });
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

  $("CBB_UserClose")?.addEventListener("click", () => {
    userPanel.style.display = "none";
    if (!selectedUser) cbUser.checked = false;
  });

  cbUser.addEventListener("change", () => {
    if (cbUser.checked) openUserList();
    else { selectedUser = ""; userSel.textContent = ""; userPanel.style.display = "none"; }
  });
    async function loadDetail() {
    let res;
    try {
      res = await fetch("/api/cashBankBookDetail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: from.value,
          toDate: to.value,
          ledgerName: ledgerInput.value.trim(),
          docClassName: docInput.value.trim(),
          userName: cbUser.checked ? selectedUser : "",
          showNarrationT: cbNarrT.checked,
          showNarrationM: cbNarrM.checked,
          showSubLedger: cbSubL.checked,
          showAlias: cbAlias.checked,
          showCheque: cbChq.checked,
        }),
      });
    } catch { return showCustomAlert("Network error while loading data."); }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load Cash/Bank Book.");
    }

    const data = await res.json();
    nTitle.textContent = data.ledger;

    const right = 'style="text-align:right"';
    const row = (sn, date, vno, part, rec, pay, balTxt, cls = "") =>
      `<tr class="${cls}"><td>${sn}</td><td>${esc(date)}</td><td>${esc(vno)}</td><td>${esc(part)}</td>` +
      `<td ${right}>${rec}</td><td ${right}>${pay}</td><td ${right}>${balTxt}</td></tr>`;
    const m = (v) => (v ? money(v) : "");

    let html = row("", "", "", "Opening Balance", "", "", bal(data.opening));

      const showTB = cbTB.checked, showDB = cbDB.checked;
    let dayRec = 0, dayPay = 0, lastBal = data.opening, curDate = null;

    const flushDay = () => {
      if (showDB && curDate !== null) {
        html += row("", "", "", "Daily Total", money(dayRec), money(dayPay), bal(lastBal), "rp-total");
      }
      dayRec = 0; dayPay = 0;
    };

    data.vouchers.forEach((v, i) => {
      if (v.date !== curDate) { flushDay(); curDate = v.date; }
      dayRec += v.receipt; dayPay += v.payment; lastBal = v.balance;

      v.lines.forEach((l, k) => {
        html += k === 0
          ? row(i + 1, v.date, v.voucherNo, l.particular, m(l.receipt), m(l.payment), showTB ? bal(v.balance) : "")
          : row("", "", "", l.particular, m(l.receipt), m(l.payment), "");
      });
      if (v.subLedger) html += row("", "", "", `SubLedger : ${v.subLedger}`, "", "", "");
      if (v.chequeNo) html += row("", "", "", `Cheque No : ${v.chequeNo}`, "", "", "");
      v.narrations.forEach((n) => { html += row("", "", "", `(Narration: ${n} )`, "", "", ""); });
      if (v.remarks) html += row("", "", "", `(Remarks:${v.remarks} )`, "", "", "");
    });
    flushDay();                                       // last day

    // The period Daily Total is replaced by the per-day rows when Day Wise Balance is on
    if (!showDB) {
      const net = data.daily.receipt - data.daily.payment;
      html += row("", "", "", "Daily Total", money(data.daily.receipt), money(data.daily.payment), bal(net), "rp-total");
    }
    const tnet = data.total.receipt - data.total.payment;
    html += row("", "", "", "Total Transaction", money(data.total.receipt), money(data.total.payment), bal(tnet), "rp-total");

    nBody.innerHTML = html;
    nPanel.style.display = "block";
  }

  // ---------- submit ----------
  form.addEventListener("submit", async () => {
    closePanel();
    if (!ledgerInput.value.trim()) return showCustomAlert("Please select a Cash/Bank ledger.");
    if (!from.value || !to.value) return showCustomAlert("Please provide both From and To dates.");
    if (cbUser.checked && !selectedUser) return showCustomAlert("Please select a user.");

    if (cbNarrT.checked || cbNarrM.checked) {
      return loadDetail();
    }
    

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
          userName: cbUser.checked ? selectedUser : "",
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
