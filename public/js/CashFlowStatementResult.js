
document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const fmt = (n) => (Number(n) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
        (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c])
    );

    const num = (n) => Number(n) || 0;

    const isZero = (r) =>
        num(r.InFlow) === 0 && num(r.OutFlow) === 0;

    const groupBy = (list, fn) => list.reduce((map, item) => {
        const key = fn(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
        return map;
    }, new Map());

    // -------------------------------------------------
    // Draggable popup
    // -------------------------------------------------

    let z = 3;

    function makeDivMovable(div) {
        if (!div) return;

        let drag = false;
        let dx, dy;

        div.addEventListener("mousedown", (e) => {
            if (["INPUT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) {
                return;
            }

            e.preventDefault();

            div.style.zIndex = ++z;

            const rect = div.getBoundingClientRect();

            dx = e.clientX - rect.left;
            dy = e.clientY - rect.top;

            drag = true;
        });

        document.addEventListener("mousemove", (e) => {
            if (!drag) return;

            div.style.left = `${e.pageX - dx}px`;
            div.style.top = `${e.pageY - dy}px`;
            div.style.position = "absolute";
        });

        document.addEventListener("mouseup", () => {
            drag = false;
        });
    }

    makeDivMovable($("popupTableDivCFS"));

    // -------------------------------------------------
    // Popup controls
    // -------------------------------------------------

    function closePopup() {
        const popup = $("popupTableDivCFS");
        if (popup) popup.style.display = "none";
    }

    $("closeButton12")?.addEventListener("click", () => {
        $("movableDiv12").style.display = "none";
    });

    $("cancelButton12")?.addEventListener("click", () => {
        $("movableDiv12").style.display = "none";
    });

    $("closeTableButtonCFS")?.addEventListener("click", closePopup);

    $("cfs-tb-okbutton")?.addEventListener("click", closePopup);

    // -------------------------------------------------
    // Prepare backend rows
    // -------------------------------------------------

    function prepareRows(rows, options) {
        /*
         * The backend returns one row per GLID + SLID.
         *
         * We combine those rows into one ledger object.
         * Subledger details are retained separately.
         */

        const ledgerMap = new Map();

        rows.forEach((r) => {
            const glid = String(r.GLID);

            if (!ledgerMap.has(glid)) {
                ledgerMap.set(glid, {
                    GLID: r.GLID,
                    GLName: r.GLName,
                    GlAlias: r.GlAlias,

                    GrpName: r.GrpName || "Unclassified",
                    GrpAlias: r.GrpAlias || "",

                    SubGrpName: r.SubGrpName || "Unclassified",
                    SubGrpAlias: r.SubGrpAlias || "",

                    InFlow: 0,
                    OutFlow: 0,

                    subledgers: []
                });
            }

            const ledger = ledgerMap.get(glid);

            const inFlow = num(r.InFlow);
            const outFlow = num(r.OutFlow);

            ledger.InFlow += inFlow;
            ledger.OutFlow += outFlow;

            if (r.SLID !== null && r.SLID !== undefined) {
                ledger.subledgers.push({
                    SLID: r.SLID,
                    SLName: r.SLName || "Unnamed Sub Ledger",
                    MemberID: r.MemberID,
                    InFlow: inFlow,
                    OutFlow: outFlow
                });
            }
        });

        let ledgers = Array.from(ledgerMap.values());

        // Remove zero-balance subledgers when requested.
        ledgers.forEach((ledger) => {
            if (!options.showZeroBalance) {
                ledger.subledgers =
                    ledger.subledgers.filter((s) => !isZero(s));
            }
        });

        // Remove zero-balance ledgers when requested.
        if (!options.showZeroBalance) {
            ledgers = ledgers.filter((ledger) => {
                if (!isZero(ledger)) return true;

                // Retain a zero-net ledger if it has visible
                // subledger movements in opposite directions.
                return options.subLedger &&
                    ledger.subledgers.length > 0;
            });
        }

        return ledgers;
    }

    // -------------------------------------------------
    // Build hierarchical report layout
    // -------------------------------------------------

    function buildLayout(rows, options) {
        const items = [];

        // Summary without detail options shows one total per main group.
        if (options.summary && !options.groupWise && !options.subLedger) {
            const groups = groupBy(rows, (ledger) => ledger.GrpName);

            let index = 0;
            for (const [name, ledgers] of groups) {
                items.push({
                    kind: "ledger",
                    depth: 0,
                    sno: String(++index),
                    GLName: name,
                    GlAlias: ledgers[0].GrpAlias,
                    InFlow: ledgers.reduce((total, ledger) => total + ledger.InFlow, 0),
                    OutFlow: ledgers.reduce((total, ledger) => total + ledger.OutFlow, 0)
                });
            }

            return items;
        }

        const levels = options.groupWise
            ? [
                { key: "GrpName", alias: "GrpAlias" },
                { key: "SubGrpName", alias: "SubGrpAlias" }
            ]
            : options.summary
                ? [
                    { key: "SubGrpName", alias: "SubGrpAlias" }
                ]
                : [];

        const makeSno = (prefix, index) =>
            prefix ? `${prefix}.${index}` : `${index}`;

        function emit(list, level, prefix) {
            // No more heading levels: display ledgers.
            if (level >= levels.length) {
                list.forEach((ledger, index) => {
                    const sno = makeSno(prefix, index + 1);

                    items.push({
                        ...ledger,
                        kind: "ledger",
                        depth: level,
                        sno
                    });

                    // Add subledger details if selected.
                    if (options.subLedger) {
                        ledger.subledgers.forEach((sub, subIndex) => {
                            items.push({
                                ...sub,
                                kind: "subledger",
                                depth: level + 1,
                                sno: `${sno}.${subIndex + 1}`
                            });
                        });
                    }
                });

                return;
            }

            const { key, alias } = levels[level];

            let index = 0;

            for (const [name, group] of groupBy(
                list,
                (r) => r[key]
            )) {
                const sno = makeSno(prefix, ++index);

                items.push({
                    kind: "heading",
                    depth: level,
                    sno,
                    particular: name,
                    alias: group[0][alias]
                });

                emit(group, level + 1, sno);
            }
        }

        emit(rows, 0, "");

        return items;
    }

    // -------------------------------------------------
    // Render table
    // -------------------------------------------------

    function render(items, ledgers) {
        const tbody = $("popupTableDivCFS")?.querySelector("tbody");

        if (!tbody) {
            console.error("Cash Flow Statement table body not found.");
            return;
        }

        const pad = (item) =>
            `padding-left:${10 + item.depth * 20}px`;

        const html = items.map((item) => {
            if (item.kind === "heading") {
                return `
                    <tr class="cfs-head cfs-d${item.depth}">
                        <td>${esc(item.sno)}</td>
                        <td style="${pad(item)}">
                            <strong>${esc(item.particular)}</strong>
                        </td>
                        <td>${esc(item.alias)}</td>
                        <td></td>
                        <td></td>
                    </tr>
                `;
            }

            if (item.kind === "subledger") {
                return `
                    <tr class="cfs-subledger">
                        <td>${esc(item.sno)}</td>
                        <td style="${pad(item)}">
                            ${esc(item.SLName)}
                        </td>
                        <td>${esc(item.MemberID || "")}</td>
                        <td>${fmt(item.InFlow)}</td>
                        <td>${fmt(item.OutFlow)}</td>
                    </tr>
                `;
            }

            return `
                <tr class="cfs-ledger">
                    <td>${esc(item.sno)}</td>
                    <td style="${pad(item)}">
                        ${esc(item.GLName)}
                    </td>
                    <td>${esc(item.GlAlias)}</td>
                    <td>${fmt(item.InFlow)}</td>
                    <td>${fmt(item.OutFlow)}</td>
                </tr>
            `;
        }).join("");

        /*
         * Grand Total:
         * Calculate using ledger rows only.
         * Subledger rows are not added again.
         */

        const grandInFlow = ledgers.reduce(
            (sum, ledger) => sum + num(ledger.InFlow), 0
        );

        const grandOutFlow = ledgers.reduce(
            (sum, ledger) => sum + num(ledger.OutFlow), 0
        );

        tbody.innerHTML = html + `
            <tr class="cfs-grand-total">
                <td></td>
                <td colspan="2"><strong>Grand Total</strong></td>
                <td><strong>${fmt(grandInFlow)}</strong></td>
                <td><strong>${fmt(grandOutFlow)}</strong></td>
            </tr>
        `;

        $("popupTableDivCFS").style.display = "block";
    }

    // -------------------------------------------------
    // Print
    // -------------------------------------------------

    $("cfs-tb-printbutton")?.addEventListener("click", () => {
        const table = $("popupTableDivCFS")?.querySelector("table");

        if (!table) {
            return showCustomAlert("No report available to print.");
        }

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            return showCustomAlert("Please allow popups to print this report.");
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cash Flow Statement</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }

                    h2 {
                        text-align: center;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th, td {
                        border: 1px solid #777;
                        padding: 7px;
                        text-align: left;
                    }

                    th {
                        background: #eee;
                    }

                    td:nth-child(4),
                    td:nth-child(5) {
                        text-align: right;
                    }

                    .cfs-head {
                        font-weight: bold;
                    }

                    .cfs-grand-total {
                        font-weight: bold;
                    }

                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h2>Cash Flow Statement</h2>
                ${table.outerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    });

    // -------------------------------------------------
    // Export
    // -------------------------------------------------

    $("cfs-tb-exportbutton")?.addEventListener("click", () => {
        const table = $("popupTableDivCFS")?.querySelector("table");

        if (!table) {
            return showCustomAlert("No report available to export.");
        }

        // Export the displayed report as CSV.
        const csv = Array.from(table.rows).map((row) => {
            return Array.from(row.cells).map((cell) => {
                const value = cell.innerText.replace(/"/g, '""');
                return `"${value}"`;
            }).join(",");
        }).join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "Cash_Flow_Statement.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    });

    // -------------------------------------------------
    // Form submission
    // -------------------------------------------------

    $("myForm12")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cashbook = $("cashbook-bank-input")?.value.trim();

        const from = $("cashflowstatement-datefrom")?.value;
        const to = $("cashflowstatement-dateto")?.value;

        if (!cashbook) {
            return showCustomAlert("Please select a Cash/Bank Book.");
        }

        if (!from || !to) {
            return showCustomAlert(
                "Please provide both From Date and To Date."
            );
        }

        const options = {
            summary: $("cashflow-summary")?.checked || false,
            subLedger: $("cashflow-sub-ledger")?.checked || false,
            groupWise: $("cashflow-group-wise")?.checked || false,
            showZeroBalance:
                $("cashflow-show-zero-balance")?.checked || false
        };

        const popup = $("popupTableDivCFS");

        if (popup) popup.style.display = "none";

        let response;

        try {
            response = await fetch("/api/cashFlowStatement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cashbook,
                    fromDate: from,
                    toDate: to
                })
            });
        } catch (error) {
            console.error("Cash Flow Statement network error:", error);

            return showCustomAlert(
                "Network error while loading Cash Flow Statement."
            );
        }

        let result;

        try {
            result = await response.json();
        } catch {
            return showCustomAlert(
                "Invalid response received from the server."
            );
        }

        if (!response.ok || !result.success) {
            return showCustomAlert(
                result.message ||
                result.error ||
                "Failed to load Cash Flow Statement."
            );
        }

        const rows = result.rows || [];

        if (!rows.length) {
            const tbody = $("popupTableDivCFS")?.querySelector("tbody");

            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;">
                            No data available for the selected period.
                        </td>
                    </tr>
                `;
            }

            if (popup) popup.style.display = "block";

            return;
        }

        // Prepare ledger and subledger hierarchy.
        const ledgers = prepareRows(rows, options);

        // Build report headings and S.No.
        const items = buildLayout(ledgers, options);

        // Render report.
        render(items, ledgers);
    });

});
