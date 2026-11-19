(function () {
    const NUM = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;
    const sortState = new WeakMap(); // table -> { col, asc }
    let observer;

    function getCellValue(row, i) {
        const cell = row.cells[i];
        if (!cell) return "";
        const el = cell.querySelector("input, select, textarea");
        if (!el) return cell.textContent.trim();
        if (el.type === "checkbox") return el.checked ? "1" : "0";
        if (el.tagName === "SELECT") return (el.selectedOptions[0]?.text || "").trim();
        return el.value.trim();
    }

    function toNumber(s) {
        let t = s.trim();
        const negative = /^\(.*\)$/.test(t);          // (500) => -500
        if (negative) t = t.slice(1, -1);
        t = t.replace(/^\s*(?:rs\.?|npr|रु\.?)|[,\s%]/gi, "");
        if (!NUM.test(t)) return null;
        return negative ? -Number(t) : Number(t);
    }

    function compare(a, b) {
        const na = toNumber(a), nb = toNumber(b);
        if (na !== null && nb !== null) return na - nb;
        if (na !== null) return -1;                   // numbers before text
        if (nb !== null) return 1;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    }

    function isTotal(row) {
        return row.classList.contains("total-row") ||
            /^\s*total\s*:/i.test(row.cells[0]?.textContent || "");
    }

    function prepare(table) {
        table.querySelectorAll("thead th").forEach(th => {
            if (!th.hasAttribute("tabindex")) th.tabIndex = 0;
        });
    }

    function applySort(table) {
        const s = sortState.get(table);
        const body = table.tBodies[0];
        const headerRow = table.tHead && table.tHead.rows[0];
        if (!s || !body || !headerRow) return;

        const rows = Array.from(body.rows);
        const totals = rows.filter(isTotal);
        const data = rows.filter(r => !isTotal(r));

        data.sort((a, b) => (s.asc ? 1 : -1) * compare(getCellValue(a, s.col), getCellValue(b, s.col)));

        const frag = document.createDocumentFragment();
        data.concat(totals).forEach(r => frag.appendChild(r));
        body.appendChild(frag);

        const sn = Array.from(headerRow.cells).findIndex(c => /^s\.?\s*n\.?\s*o?\.?$/i.test(c.textContent.trim()));
        if (sn !== -1) {
            data.forEach((r, i) => {
                const cell = r.cells[sn];
                if (cell && !cell.children.length) cell.textContent = i + 1;
            });
        }

        Array.from(headerRow.cells).forEach((c, i) => {
            if (i === s.col) c.setAttribute("aria-sort", s.asc ? "ascending" : "descending");
            else c.removeAttribute("aria-sort");
        });

        // our own changes must not trigger the observer again
        if (observer) observer.takeRecords();
    }

    function toggleSort(th) {
        const table = th.closest("table.sortable");
        if (!table) return;
        const col = th.cellIndex;
        const prev = sortState.get(table);
        sortState.set(table, { col, asc: prev && prev.col === col ? !prev.asc : true });
        applySort(table);
    }

    document.addEventListener("click", e => {
        if (e.target.closest("input, select, textarea, button, a")) return;
        const th = e.target.closest("table.sortable thead th");
        if (th) toggleSort(th);
    });

    document.addEventListener("keydown", e => {
        if ((e.key === "Enter" || e.key === " ") && e.target.matches("table.sortable thead th")) {
            e.preventDefault();
            toggleSort(e.target);
        }
    });

    // Handles dynamic tables: new tables get focusable headers,
    // re-rendered rows/headers get the last sort re-applied.
    observer = new MutationObserver(records => {
        const tables = new Set();
        records.forEach(r => {
            const el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
            const t = el && el.closest("table.sortable");
            if (t) tables.add(t);
            r.addedNodes.forEach(n => {
                if (n.nodeType !== 1) return;
                if (n.matches("table.sortable")) tables.add(n);
                n.querySelectorAll("table.sortable").forEach(x => tables.add(x));
            });
        });
        tables.forEach(t => { prepare(t); applySort(t); });
    });

    function init() {
        document.querySelectorAll("table.sortable").forEach(prepare);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        const style = document.createElement("style");
        style.textContent = "table.sortable thead th{cursor:pointer}table.sortable thead th[aria-sort=ascending]::after{content:' ▲'}table.sortable thead th[aria-sort=descending]::after{content:' ▼'}";
        document.head.appendChild(style);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();