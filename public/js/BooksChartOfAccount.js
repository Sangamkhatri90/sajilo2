
// ==========================================
// Chart of Account Frontend
// ==========================================

(() => {

    const chartOfAccountButton = document.getElementById('toggleButton196');
    const chartOfAccountWindow = document.getElementById('movableDiv196');

    chartOfAccountButton?.addEventListener('click', event => {
        event.preventDefault();
        if (chartOfAccountWindow) chartOfAccountWindow.style.display = 'block';
    });

    const fromInput = document.getElementById('coaFromDate');
    const toInput = document.getElementById('coaToDate');
    const form = document.getElementById('myForm196');
    const loadBtn = document.getElementById('coaLoadBtn');
    const status = document.getElementById('coaStatus');
    const results = document.getElementById('coaResults');
    const reportWindow = document.getElementById('coaReportWindow');

    if (!fromInput || !toInput || !form || !loadBtn || !results || !reportWindow) {
        console.error('Chart of Account HTML elements not found');
        return;
    }

    // ======================================
    // Format amounts
    // ======================================

    const formatAmount = value => {
        return Number(value || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ======================================
    // Create DOM element safely
    // ======================================

    const createElement = (tag, className, text) => {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = text;
        }

        return element;
    };

    // ======================================
    // Create balance summary
    // ======================================

    const createBalanceSummary = node => {

        const container = createElement('span', 'coa-node-balance');

        container.textContent =
            'Closing: ' + formatAmount(node.closingBalance);

        return container;
    };

    // ======================================
    // Create ledger table
    // ======================================

    const createLedgerTable = ledgers => {

        const table = createElement('table', 'coa-ledger-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = [
            'Ledger Name',
            'Opening Balance',
            'Period Movement',
            'Closing Balance'
        ];

        headers.forEach((header, index) => {

            const th = createElement('th', '', header);

            if (index > 0) {
                th.classList.add('coa-number');
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        ledgers.forEach(ledger => {

            const tr = document.createElement('tr');

            const name = createElement(
                'td',
                '',
                ledger.name
            );

            const opening = createElement(
                'td',
                'coa-number',
                formatAmount(ledger.openingBalance)
            );

            const movement = createElement(
                'td',
                'coa-number',
                formatAmount(ledger.periodMovement)
            );

            const closing = createElement(
                'td',
                'coa-number',
                formatAmount(ledger.closingBalance)
            );

            [opening, movement, closing].forEach(cell => {

                const value = Number(
                    cell.textContent.replace(/,/g, '')
                );

                if (value < 0) {
                    cell.classList.add('coa-negative');
                } else if (value > 0) {
                    cell.classList.add('coa-positive');
                }

            });

            tr.append(name, opening, movement, closing);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        return table;
    };

    // ======================================
    // Create subgroup
    // ======================================

    const renderSubgroup = subgroup => {

        const wrapper = createElement(
            'div',
            'coa-node coa-subgroup'
        );

        const details = document.createElement('details');

        const summary = document.createElement('summary');

        const title = createElement(
            'span',
            'coa-node-title',
            subgroup.name
        );

        const count = createElement(
            'span',
            'coa-node-count',
            `Ledgers: ${subgroup.ledgerCount}`
        );

        title.appendChild(count);

        summary.appendChild(title);
        summary.appendChild(createBalanceSummary(subgroup));

        details.appendChild(summary);

        const content = createElement(
            'div',
            'coa-node-content'
        );

        if (subgroup.ledgers.length) {

            content.appendChild(
                createLedgerTable(subgroup.ledgers)
            );

        } else {

            content.appendChild(
                createElement(
                    'div',
                    'coa-empty',
                    'No ledgers in this subgroup.'
                )
            );

        }

        details.appendChild(content);
        wrapper.appendChild(details);

        return wrapper;
    };

    // ======================================
    // Create group
    // ======================================

    const renderGroup = (group, isRoot = false) => {

        const wrapper = createElement(
            'div',
            isRoot
                ? 'coa-node coa-group'
                : 'coa-node coa-group coa-child-group'
        );

        const details = document.createElement('details');

        // Root groups are expanded initially
        if (isRoot) {
            details.open = true;
        }

        const summary = document.createElement('summary');

        const title = createElement(
            'span',
            'coa-node-title',
            group.name
        );

        const count = createElement(
            'span',
            'coa-node-count',
            `Ledgers: ${group.ledgerCount}`
        );

        title.appendChild(count);

        summary.appendChild(title);
        summary.appendChild(createBalanceSummary(group));

        details.appendChild(summary);

        const content = createElement(
            'div',
            'coa-node-content'
        );

        group.children.forEach(child => {

            if (child.type === 'group') {

                content.appendChild(
                    renderGroup(child, false)
                );

            } else if (child.type === 'subgroup') {

                content.appendChild(
                    renderSubgroup(child)
                );

            }

        });

        if (!group.children.length) {

            content.appendChild(
                createElement(
                    'div',
                    'coa-empty',
                    'No subgroups or child groups.'
                )
            );

        }

        details.appendChild(content);
        wrapper.appendChild(details);

        return wrapper;
    };

    // ======================================
    // Render complete report
    // ======================================

    const renderReport = data => {

        results.innerHTML = '';

        if (!data || !data.length) {

            results.appendChild(
                createElement(
                    'div',
                    'coa-empty',
                    'No Chart of Account data found.'
                )
            );

            return;
        }

        data.forEach(group => {

            results.appendChild(
                renderGroup(group, true)
            );

        });
    };

    // ======================================
    // Generate report
    // ======================================

    const loadReport = async () => {

        const fromDate = fromInput.value.trim();
        const toDate = toInput.value.trim();

        if (!fromDate || !toDate) {

            alert('Please select From Date and To Date.');
            return;
        }

        loadBtn.disabled = true;
        loadBtn.textContent = 'Loading...';

        reportWindow.style.display = 'block';
        status.textContent = 'Fetching Chart of Account...';

        try {

            const response = await fetch('/api/chartOfAccount', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'same-origin',

                body: JSON.stringify({
                    fromDate,
                    toDate
                })

            });

            const result = await response.json();

            if (!response.ok || !result.success) {

                throw new Error(
                    result.error || 'Unable to load report'
                );

            }

            renderReport(result.data);

            const dateFormat = result.dateType === 'LD'
                ? 'BS'
                : 'AD';

            status.textContent =
                `Report loaded successfully | ${dateFormat} Date`;
            reportWindow.style.display = 'block';

        } catch (err) {

            console.error('Chart of Account Error:', err);

            status.textContent = err.message;

            results.innerHTML = '';

            results.appendChild(
                createElement(
                    'div',
                    'coa-empty',
                    err.message
                )
            );

        } finally {

            loadBtn.disabled = false;
            loadBtn.textContent = 'Generate Report';

        }

    };

    // ======================================
    // Events
    // ======================================

    form.addEventListener('submit', event => {
        event.preventDefault();
        loadReport();
    });

    document.getElementById('closeButton196')?.addEventListener('click', () => {
        document.getElementById('movableDiv196').style.display = 'none';
    });
    document.getElementById('closeCoaReport')?.addEventListener('click', () => {
        reportWindow.style.display = 'none';
    });

})();
