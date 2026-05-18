class TableHighlighter {
    constructor(tableClass) {
        this.tables = document.querySelectorAll(`.${tableClass}`);
        this.currentTable = null;
        this.selectedRowIndex = 1;

        this.init();
    }

    init() {
        this.tables.forEach(table => {
            table.addEventListener("click", (event) => this.handleRowClick(event, table));
        });

        document.addEventListener("keydown", (event) => this.handleKeyPress(event));
    }

    setActiveTable(table) {
        if (this.currentTable) {
            this.currentTable.classList.remove("active-table");
            this.clearHighlight();
        }

        this.currentTable = table;
        this.currentTable.classList.add("active-table");
        this.selectedRowIndex = 1;
        this.highlightRow();
    }

    highlightRow() {
        if (!this.currentTable) return;
        let rows = this.currentTable.getElementsByTagName("tr");
        this.clearHighlight();

        if (rows[this.selectedRowIndex]) {
            rows[this.selectedRowIndex].classList.add("highlight");
            this.scrollToRow(rows[this.selectedRowIndex]);
        }
    }

    clearHighlight() {
        if (!this.currentTable) return;
        let rows = this.currentTable.getElementsByTagName("tr");
        for (let i = 1; i < rows.length; i++) {
            rows[i].classList.remove("highlight");
        }
    }

    handleRowClick(event, table) {
        let row = event.target.closest("tr");
        if (!row || row.rowIndex === 0) return; // Ignore header row

        this.setActiveTable(table);
        this.selectedRowIndex = row.rowIndex;
        this.highlightRow();
    }

    handleKeyPress(event) {
        if (!this.currentTable) return;

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); // Prevent form submission when pressing arrow keys

            let rows = this.currentTable.getElementsByTagName("tr");

            if (event.key === "ArrowDown") {
                this.selectedRowIndex++;
                if (this.selectedRowIndex >= rows.length) {
                    this.selectedRowIndex = 1; // Loop to top
                }
            } else if (event.key === "ArrowUp") {
                this.selectedRowIndex--;
                if (this.selectedRowIndex < 1) {
                    this.selectedRowIndex = rows.length - 1; // Loop to bottom
                }
            }

            this.highlightRow();
        }
    }

    scrollToRow(row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

new TableHighlighter("highlight-table");
