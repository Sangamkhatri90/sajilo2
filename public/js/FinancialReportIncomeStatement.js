document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

  const container = $("incomeStatementTableContainer");
  const tbody = $("incomeStatementTableBody");
  const summary = $("incomestatement-summary");
  const subledger = $("incomestatement-sub-ledger");
  const groupTotal = $("incomestatement-show-group-total");

  // ---------- Summary only disables the other two options ----------
  function syncCheckboxes() {
    const so = summary.checked;
    subledger.disabled = so;
    groupTotal.disabled = so;
    if (so) { subledger.checked = false; groupTotal.checked = false; }
  }
  syncCheckboxes();
  summary.addEventListener("change", syncCheckboxes);

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
      div.style.position = "absolute";
      div.style.left = `${e.pageX - dx}px`;
      div.style.top = `${e.pageY - dy}px`;
    });
    document.addEventListener("mouseup", () => (drag = false));
  })(container);

  ["incomeStatementTableContainerXbtn", "incomeStatementTableContainerOKbtn"].forEach((id) =>
    $(id)?.addEventListener("click", (e) => { e.preventDefault(); container.style.display = "none"; }));

  // ---------- layout: server data -> display items ----------
  function buildItems(sections, balance, o) {
    const items = [];

    for (const s of sections) {
      items.push({ kind: "header", particular: s.name });
      items.push({ kind: "group", sno: "1", particular: s.grpName, alias: s.grpAlias });

      s.subGroups.forEach((sub, si) => {
        const subSno = `1.${si + 1}`;

        if (o.summaryOnly) {
          items.push({ kind: "sub", sno: subSno, particular: sub.name, alias: sub.alias, amount: sub.amount });
          return;
        }

        items.push({ kind: "sub", sno: subSno, particular: sub.name, alias: sub.alias });

        sub.ledgers.forEach((l, li) => {
          const lno = `${subSno}.${li + 1}`;
          items.push({ kind: "ledger", sno: lno, particular: l.name, alias: l.alias, amount: l.amount });

          if (o.subledger) {
            l.subLedgers.forEach((x, xi) =>
              items.push({ kind: "subledger", sno: `${lno}.${xi + 1}`, particular: x.name, alias: x.alias, amount: x.amount }));
          }
        });

        if (o.showGroupTotal) {
          items.push({ kind: "subtotal", particular: `Total of ${sub.name}`, amount: sub.amount });
        }
      });

      items.push({ kind: "total", particular: `total ${s.name}`, amount: s.total });
    }

    items.push({ kind: "balance", particular: "Total Balance", amount: balance });
    return items;
  }

  const CLASS = {
    header: "is-header", subtotal: "is-subtotal", total: "is-total",
    balance: "is-total", subledger: "is-subledger",
  };

  const rowHtml = (it) =>
    `<tr class="${CLASS[it.kind] ?? ""}">` +
    `<td>${esc(it.sno)}</td><td>${esc(it.particular)}</td><td>${esc(it.alias)}</td>` +
    `<td>${it.amount === undefined ? "" : fmt(it.amount)}</td></tr>`;

  // ---------- submit ----------
  $("myForm180").addEventListener("submit", async (e) => {
    e.preventDefault();

    const from = $("FR-IncomeStatement-datefrom").value;
    const to = $("FR_IncomeStatement-dateto").value;
    if (!from || !to) return showCustomAlert("Please select both From and To dates.");

    const o = {
      summaryOnly: summary.checked,
      subledger: subledger.checked,
      showGroupTotal: groupTotal.checked,
    };

    let res;
    try {
      res = await fetch("/api/incomeStatement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDate: from, toDate: to, subledger: o.subledger }),   // server normalizes AD/LD
      });
    } catch {
      return showCustomAlert("Error connecting to server.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || `Server returned error: ${res.status}`);
    }

    const { sections, balance, meta } = await res.json();
    container.style.display = "block";

    if (meta?.noData) {
      tbody.innerHTML = "";
      return showCustomAlert("No data available for the selected period.");
    }

    tbody.innerHTML = buildItems(sections, balance, o).map(rowHtml).join("");
  });
});