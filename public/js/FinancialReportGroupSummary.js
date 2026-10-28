document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const excel = { ledgers: null, subledgers: null };   // both optional

  const num = (v) => Number(v) || 0;
  const fmt = (n) => (n < 0 ? `(${Math.abs(n).toFixed(2)})` : num(n).toFixed(2));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getOrAdd = (m, k, make) => { if (!m.has(k)) m.set(k, make()); return m.get(k); };

  const panels = {
    group: $("GrpSummaryDiv"),
    sub: $("GrpSummarySubDiv"),
    ledger: $("GrpSummaryLedgerMDiv"),
    result: $("fr-gsMaindt"),
  };
  const hide = (...els) => els.forEach((el) => el && (el.style.display = "none"));
  const show = (el) => el && (el.style.display = "block");

  const groupTable = $("grpSummaryTable");
  const subTable = $("grpSummarySubTable");
  const ledgerTable = $("grpSummaryLedgerTable");
  const resultBody = document.querySelector("#GroupSummaryMainTable tbody");

  const opts = () => ({
    selectAll: $("FR-GS-selectAllGrpSummary").checked,
    summaryOnly: $("FR-GS-summary-only").checked,
    showZero: $("FR-GS-show-zero-balance").checked,
    subledger: $("FR-GS-sub-ledger").checked,
    includeOpening: $("FR-GS-include-opening").checked,
  });

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
      div.style.position = "absolute";
      div.style.left = `${e.pageX - dx}px`;
      div.style.top = `${e.pageY - dy}px`;
    });
    document.addEventListener("mouseup", () => (drag = false));
  }
  Object.values(panels).forEach(makeDivMovable);

  [["GScloseButton", panels.group], ["GSScloseButton", panels.sub],
   ["fr-gsMaindtXbtn", panels.result], ["fr-gsMaindtOkbtn", panels.result]]
    .forEach(([id, el]) => $(id)?.addEventListener("click", (e) => { e.preventDefault(); hide(el); }));

  // ---------- optional Excel (both sheets optional) ----------
  $("selectFileBtninGS").addEventListener("click", () => $("excelFileInputinGS").click());

  $("excelFileInputinGS").addEventListener("change", (e) => {
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
          openingDebit: num(r.OpeningBalanceDr),
          openingCredit: num(r.OpeningBalanceCr),
        }));
      };
      excel.ledgers = read("TbLedgderMaster", "GLName", "GlAlias");
      excel.subledgers = read("TbSubledgerMaster", "SLName", "SlAlias");
      if (!excel.ledgers && !excel.subledgers) return showCustomAlert("Neither expected sheet was found.");
      showCustomAlert("Excel loaded. It is used only for opening balances the database can't provide.");
    };
    reader.readAsArrayBuffer(file);
  });

  // ---------- render ----------
  function render(rows, o) {
    const keep = (a) => o.showZero || Math.abs(a) >= 0.005;

    // group -> subgroup -> ledgers
    const groups = new Map();
    for (const r of rows) {
      const g = getOrAdd(groups, r.grpId, () => ({ name: r.grpName, alias: r.grpAlias, subs: new Map() }));
      const s = getOrAdd(g.subs, r.subGrpId, () => ({ name: r.subGrpName, alias: r.subGrpAlias, ledgers: [], amount: 0 }));
      s.ledgers.push(r);
      s.amount += r.amount;
    }

    let html = "", total = 0, gi = 0;

    for (const g of groups.values()) {
      const subs = [...g.subs.values()]
        .map((s) => ({ ...s, ledgers: o.summaryOnly ? [] : s.ledgers.filter((l) => keep(l.amount)) }))
        .filter((s) => (o.summaryOnly ? keep(s.amount) : s.ledgers.length > 0));
      if (!subs.length) continue;

      gi++;
      html += `<tr class="gs-group"><td>${gi}</td><td>${esc(g.name)}</td><td>${esc(g.alias)}</td><td></td></tr>`;

      subs.forEach((s, si) => {
        const sno = `${gi}.${si + 1}`;
        html += `<tr class="gs-sub"><td>${sno}</td><td>${esc(s.name)}</td><td>${esc(s.alias)}</td><td>${o.summaryOnly ? fmt(s.amount) : ""}</td></tr>`;

        if (o.summaryOnly) { total += s.amount; return; }

        s.ledgers.forEach((l, li) => {
          total += l.amount;   // ledger level only, so subledgers never double count
          const lno = `${sno}.${li + 1}`;
          html += `<tr><td>${lno}</td><td>${esc(l.ledgerName)}</td><td>${esc(l.ledgerAlias)}</td><td>${fmt(l.amount)}</td></tr>`;

          if (o.subledger) {
            l.subLedgers.filter((x) => keep(x.amount)).forEach((x, xi) => {
              html += `<tr class="gs-subledger"><td>${lno}.${xi + 1}</td><td style="padding-left:30px">${esc(x.name)}</td><td>${esc(x.alias)}</td><td>${fmt(x.amount)}</td></tr>`;
            });
          }
        });
      });
    }

    html += `<tr class="gs-total"><td></td><td>Total</td><td></td><td>${fmt(total)}</td></tr>`;
    resultBody.innerHTML = html;
    show(panels.result);
  }

  // ---------- load data (the only data call) ----------
  async function load(scope = {}) {
    const from = $("FR-GS-datefrom").value;
    const to = $("FR-GS-dateto").value;
    if (!from || !to) return showCustomAlert("Please provide both From and To dates.");

    const o = opts();
    let res;
    try {
      res = await fetch("/api/groupSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: from,   // server normalizes AD/LD format
          toDate: to,
          includeOpening: o.includeOpening,
          subledger: o.subledger && !o.summaryOnly,
          ...scope,         // { subGroupIds } or { ledgerIds }, empty = everything
          excelLedgers: excel.ledgers,
          excelSubledgers: o.subledger ? excel.subledgers : null,
        }),
      });
    } catch {
      return showCustomAlert("Network error while loading group summary.");
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return showCustomAlert(error || "Failed to load group summary.");
    }

    const { rows, meta } = await res.json();
    if (meta?.noData) {
      resultBody.innerHTML = "";
      show(panels.result);
      return showCustomAlert("No data available for the selected period.");
    }
    render(rows, o);
  }

  // ---------- selection lists ----------
  const getJson = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Server responded with ${r.status}`);
    return r.json();
  };
  const checked = (cls) => [...document.querySelectorAll(`.${cls}:checked`)];
  const idQuery = (cls, attr) => checked(cls).map((c) => `id=${encodeURIComponent(c.dataset[attr])}`).join("&");
  const checkRow = (cls, attr, id, i, name, alias) =>
    `<tr><td><input type="checkbox" class="${cls}" data-${attr}="${esc(id)}"></td><td>${i + 1}</td><td>${esc(name)}</td><td>${esc(alias)}</td></tr>`;

  // main form: select all -> load directly, otherwise start the group > subgroup > ledger flow
  $("movableDiv34").addEventListener("submit", async (e) => {
    e.preventDefault();
    hide(panels.group, panels.sub, panels.ledger);

    if (opts().selectAll) return load();

    try {
      const groups = await getJson("/get-first-grp-id");
      groupTable.innerHTML = groups.map((r, i) =>
        checkRow("group-summary-checkbox", "grpid", r.LgrGrpID, i, r.GrpName, r.GrpAlias)).join("");
      subTable.innerHTML = "";
      ledgerTable.innerHTML = "";
      show(panels.group);
    } catch (err) {
      console.error(err);
      showCustomAlert("Failed to load groups.");
    }
  });

  groupTable.addEventListener("change", async (e) => {
    if (!e.target.matches(".group-summary-checkbox")) return;
    const q = idQuery("group-summary-checkbox", "grpid");
    subTable.innerHTML = "";
    ledgerTable.innerHTML = "";
    if (!q) return;
    try {
      const subs = await getJson(`/get-ledger-sub-groups?${q}`);
      subTable.innerHTML = subs.map((r, i) =>
        checkRow("sub-group-summary-checkbox", "subgrpid", r.LgrSubGrpID, i, r.SubGrpName, r.SubGrpAlias)).join("");
    } catch (err) {
      console.error(err);
      showCustomAlert("Failed to load sub groups.");
    }
  });

  subTable.addEventListener("change", async (e) => {
    if (!e.target.matches(".sub-group-summary-checkbox")) return;
    const q = idQuery("sub-group-summary-checkbox", "subgrpid");
    ledgerTable.innerHTML = "";
    if (!q) return;
    try {
      const ledgers = await getJson(`/get-ledger-sub-master-groups?${q}`);
      ledgerTable.innerHTML = ledgers.map((r, i) =>
        checkRow("ledger-sub-group-summary-checkbox", "glid", r.GLID, i, r.GLName, r.GlAlias)).join("");
    } catch (err) {
      console.error(err);
      showCustomAlert("Failed to load ledgers.");
    }
  });

  // select / unselect all buttons
  const toggleAll = (selector, state) =>
    document.querySelectorAll(selector).forEach((cb) => {
      cb.checked = state;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });

  [["lgrGrpSelectAll", ".group-summary-checkbox", true],
   ["lgrGrpUnselectAll", ".group-summary-checkbox", false],
   ["lgrSubGrpSelectAll", ".sub-group-summary-checkbox", true],
   ["lgrSubGrpUnselectAll", ".sub-group-summary-checkbox", false],
   ["lgrMasterGrpSelectAll", ".ledger-sub-group-summary-checkbox", true],
   ["lgrMasterGrpUnselectAll", ".ledger-sub-group-summary-checkbox", false]]
    .forEach(([id, sel, state]) => $(id)?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAll(sel, state);
    }));

  // ---------- chained form submits ----------
  $("GrpSummaryDivForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checked("group-summary-checkbox").length) return showCustomAlert("Select at least one group.");
    hide(panels.group);
    show(panels.sub);
  });

  $("GrpSummarySubDivForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ids = checked("sub-group-summary-checkbox").map((c) => c.dataset.subgrpid);
    if (!ids.length) return showCustomAlert("Select at least one sub group.");
    hide(panels.sub);

    if (opts().summaryOnly) return load({ subGroupIds: ids });
    show(panels.ledger);
  });

  $("GrpSummaryLedgerDivForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ids = checked("ledger-sub-group-summary-checkbox").map((c) => c.dataset.glid);
    if (!ids.length) return showCustomAlert("Select at least one ledger.");
    hide(panels.ledger);
    load({ ledgerIds: ids });
  });
});