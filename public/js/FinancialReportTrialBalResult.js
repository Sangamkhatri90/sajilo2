document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const excel = { ledgers: null, subledgers: null };   // both optional

  const FIELDS = ["openingDebit", "openingCredit", "periodDebit", "periodCredit", "balanceDebit", "balanceCredit"];
  const fmt = (n) => (Number(n) || 0).toFixed(2);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sumRows = (rows) => Object.fromEntries(FIELDS.map((f) => [f, rows.reduce((s, r) => s + r[f], 0)]));
  const isZero = (r) => FIELDS.every((f) => !r[f]);
  const groupBy = (list, fn) => list.reduce((m, x) => {
    const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); return m;
  }, new Map());

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
  makeDivMovable($("general_ledger_subgroup"));
  makeDivMovable($("trial_balance_subgroup"));

  // ---------- dialog close buttons ----------
  [["general_ledger_subgroup", ["general_ledger_cancelbtn", "general_ledger_closebtn", "general_ledger_okbutton"]],
   ["trial_balance_subgroup",  ["trial_balance_cancelbtn",  "trial_balance_closebtn",  "trial_balance_okbutton"]]]
    .forEach(([panel, btns]) => btns.forEach((b) =>
      $(b)?.addEventListener("click", () => { if ($(panel)) $(panel).style.display = "none"; })));

  // ---------- optional Excel ----------
  $("selectFileBtn").addEventListener("click", () => $("excelFileInput").click());

  $("excelFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "array" });
      const read = (sheet, nameCol, aliasCol) => {
        const ws = wb.Sheets[sheet];
        if (!ws) return null;
        return XLSX.utils.sheet_to_json(ws).map((r) => ({
          particular: r[nameCol] || "",
          alias: r[aliasCol] || "",
          openingDebit: parseFloat(r.OpeningBalanceDr || 0) || 0,
          openingCredit: parseFloat(r.OpeningBalanceCr || 0) || 0,
        }));
      };
      excel.ledgers = read("TbLedgderMaster", "GLName", "GlAlias");
      excel.subledgers = read("TbSubledgerMaster", "SLName", "SlAlias");
      if (!excel.ledgers && !excel.subledgers) return showCustomAlert("Neither expected sheet was found.");
      showCustomAlert("Excel loaded. It is used only for opening balances the database can't provide.");
    };
    reader.readAsArrayBuffer(file);
  });

  // ---------- layout: rows -> display items ----------
  function buildLayout(rows, o) {
    const levels = o.groupwise
      ? [{ k: "groupName", a: "groupAlias" }, { k: "subGroup", a: "subGroupAlias" }]
      : o.summaryonly
        ? [{ k: "subGroup", a: "subGroupAlias" }]
        : [];
    const items = [];
    const sn = (p, i) => (p ? `${p}.${i}` : `${i}`);

    const emit = (list, li, prefix) => {
      if (li >= levels.length) {
        list.forEach((r, i) => {
          const sno = sn(prefix, i + 1);
          items.push({ ...r, kind: "row", depth: li, sno });
          if (o.subledger) {
            (r.subledgers || []).forEach((s, j) =>
              items.push({ ...s, kind: "sub", depth: li + 1, sno: `${sno}.${j + 1}` }));
          }
        });
        return;
      }
      const { k, a } = levels[li];
      let i = 0;
      for (const [name, grp] of groupBy(list, (r) => r[k])) {
        const sno = sn(prefix, ++i);
        items.push({ kind: "head", depth: li, sno, particular: name, alias: grp[0][a] });
        emit(grp, li + 1, sno);
        if (o.showgrptotal) items.push({ ...sumRows(grp), kind: "total", depth: li, particular: `${name} Total` });
      }
    };

    emit(rows, 0, "");
    return items;
  }

  // ---------- render both tables from the same items ----------
  const pad = (it) => `padding-left:${10 + it.depth * 20}px`;
  const vals = (it) => FIELDS.map((f) => `<td>${fmt(it[f])}</td>`).join("");

  const mainRow = (it) => {
    if (it.kind === "head")
      return `<tr class="tb-head tb-d${it.depth}"><td style="${pad(it)}">${esc(it.particular)}</td><td>${esc(it.alias)}</td><td colspan="6"></td></tr>`;
    if (it.kind === "total")
      return `<tr class="tb-total"><td colspan="2" style="${pad(it)}">${esc(it.particular)}</td>${vals(it)}</tr>`;
    return `<tr><td style="${pad(it)}">${esc(it.particular)}</td><td>${esc(it.alias)}</td>${vals(it)}</tr>`;
  };

  const trialRow = (it) => {
    if (it.kind === "head")
      return `<tr class="tb-head tb-d${it.depth}"><td>${it.sno}</td><td style="${pad(it)}">${esc(it.particular)}</td><td>${esc(it.alias)}</td><td colspan="2"></td></tr>`;
    if (it.kind === "total")
      return `<tr class="tb-total"><td></td><td colspan="2" style="${pad(it)}">${esc(it.particular)}</td><td>${fmt(it.balanceDebit)}</td><td>${fmt(it.balanceCredit)}</td></tr>`;
    return `<tr><td>${it.sno}</td><td style="${pad(it)}">${esc(it.particular)}</td><td>${esc(it.alias)}</td><td>${fmt(it.balanceDebit)}</td><td>${fmt(it.balanceCredit)}</td></tr>`;
  };

  function render(items, rows) {
    const g = sumRows(rows);   // ledger-level only, so subledgers never double count
    $("GeneralLedgerTrialTable").querySelector("tbody").innerHTML =
      items.map(mainRow).join("") +
      `<tr class="tb-grand"><td colspan="2">Grand Total</td>${vals(g)}</tr>`;
    $("TrialBalanceTable").querySelector("tbody").innerHTML =
      items.map(trialRow).join("") +
      `<tr class="tb-grand"><td colspan="3">Grand Total</td><td>${fmt(g.balanceDebit)}</td><td>${fmt(g.balanceCredit)}</td></tr>`;
  }

  // ---------- OK ----------
  $("Financialreport_trailbal_okbutton").addEventListener("click", async (e) => {
    e.preventDefault();
    $("general_ledger_subgroup").style.display = "none";
    $("trial_balance_subgroup").style.display = "none";

    if ($("general_ledger").checked) $("general_ledger_subgroup").style.display = "block";
    else if ($("trial_balance").checked) $("trial_balance_subgroup").style.display = "block";
    else return showCustomAlert("Please select a trial type.");

    const from = $("TrialBalance_dateFrom").value;
    const to = $("TrialBalance_dateTo").value;
    if (!from || !to) return showCustomAlert("Please provide both From and To dates.");

    const opts = {
      groupwise: $("TrialBalance_groupwise")?.checked,
      subledger: $("TrialBalance_subledger")?.checked,
      showgrptotal: $("TrialBalance_showgrptotal")?.checked,
      summaryonly: $("TrialBalance_summaryonly")?.checked,
      showzerobal: $("TrialBalance_showzerobal")?.checked,
    };

    let res;
    try {
      res = await fetch("/api/trialBalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: from,   // server normalizes AD/BS format
          toDate: to,
          excelLedgers: excel.ledgers,
          excelSubledgers: opts.subledger ? excel.subledgers : null,
        }),
      });
    } catch {
      return showCustomAlert("Network error while loading trial balance.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load trial balance.");
    }

    const { rows, meta } = await res.json();
    if (meta?.noData) {
      render([], []);
      return showCustomAlert("No data available for the selected period.");
    }
    if (meta?.skippedSubledgers) showCustomAlert("Some Excel subledgers didn't match the database and were skipped.");

    const keep = (r) => opts.showzerobal || !isZero(r);
    const visible = rows.filter(keep).map((r) => ({ ...r, subledgers: r.subledgers.filter(keep) }));
    render(buildLayout(visible, opts), visible);
  });
});