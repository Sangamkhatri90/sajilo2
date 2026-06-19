function searchAndSortTable(searchInputId, tableId, skipColumns = [0]) {
    const input = document.getElementById(searchInputId).value.toLowerCase();
    const table = document.getElementById(tableId);

    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.forEach(row => {
        row.dataset.originalHtml = row.innerHTML;
    });

    const sortedRows = rows.sort((a, b) => {
        let matchA = countMatches(a, input, skipColumns);
        let matchB = countMatches(b, input, skipColumns);

        return matchB - matchA;
    });

    sortedRows.forEach(row => {
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
            if (!skipColumns.includes(index)) {
                const text = cell.textContent;
                cell.innerHTML = highlightText(text, input);
            }
        });

        tbody.appendChild(row);
    });
}

function countMatches(row, searchText, skipColumns) {
    let count = 0;

    row.querySelectorAll("td").forEach((cell, index) => {
        if (!skipColumns.includes(index)) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                count++;
            }
        }
    });

    return count;
}

function highlightText(text, searchText) {
    if (!searchText) return text;

    const regex = new RegExp(`(${escapeRegExp(searchText)})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}