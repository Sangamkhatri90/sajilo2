(function () {
    function getCellValue(row, columnIndex) {
        const cell = row.cells[columnIndex];
        if (!cell) return "";
        const input = cell.querySelector("input, select, textarea");
        return (input ? input.value : cell.textContent).trim();
    }

    function compareValues(left, right) {
        const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;
        const leftNumber = Number(left.replace(/,/g, ""));
        const rightNumber = Number(right.replace(/,/g, ""));

        if (numberPattern.test(left.replace(/,/g, "")) && numberPattern.test(right.replace(/,/g, ""))) {
            return leftNumber - rightNumber;
        }
        return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
    }

    document.addEventListener("click", function (event) {
        const header = event.target.closest("th");
        if (!header) return;

        const table = header.closest("table");
        const headerRow = header.parentElement;
        const body = table && table.tBodies[0];
        if (!table || !body || !headerRow || headerRow.parentElement !== table.tHead) return;

        const columnIndex = Array.prototype.indexOf.call(headerRow.cells, header);
        const ascending = header.dataset.sortDirection !== "asc";
        const rows = Array.from(body.rows);

        rows.sort(function (rowA, rowB) {
            const comparison = compareValues(getCellValue(rowA, columnIndex), getCellValue(rowB, columnIndex));
            return (ascending ? 1 : -1) * comparison;
        });

        rows.forEach(function (row) { body.appendChild(row); });
        headerRow.querySelectorAll("th").forEach(function (cell) {
            delete cell.dataset.sortDirection;
            cell.removeAttribute("aria-sort");
        });
        header.dataset.sortDirection = ascending ? "asc" : "desc";
        header.setAttribute("aria-sort", ascending ? "ascending" : "descending");
    });

    document.addEventListener("DOMContentLoaded", function () {
        const style = document.createElement("style");
        style.textContent = "table thead th { cursor: pointer; } table thead th[aria-sort=asc]::after { content: ' ▲'; } table thead th[aria-sort=desc]::after { content: ' ▼'; }";
        document.head.appendChild(style);
    });
})();
