document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('myForm66');
    const viewer = document.getElementById('thresholdReportViewer');
    const tableBody = document.querySelector('#thresholdReportTable tbody');
    const period = document.getElementById('thresholdReportPeriod');
    const closeButton = document.getElementById('closeThresholdReport');

    if (!form || !viewer || !tableBody) return;

    function addCell(row, value) {
        const cell = document.createElement('td');
        cell.textContent = value == null ? '' : value;
        row.appendChild(cell);
    }

    function formatAmount(value) {
        const amount = Number(value);
        return Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value || '';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const dateFrom = document.getElementById('Threshold-nepali-from-date').value;
        const dateTo = document.getElementById('Threshold-nepali-to-date').value;
        const docClass = document.getElementById('doc-class-acc-als-ttr').value.trim();

        if (!dateFrom || !dateTo) {
            alert('Please select Date From and Date To.');
            return;
        }

        tableBody.replaceChildren();
        viewer.style.display = 'block';
        period.textContent = `From ${dateFrom} to ${dateTo}`;

        const loadingRow = document.createElement('tr');
        const loadingCell = document.createElement('td');
        loadingCell.colSpan = 9;
        loadingCell.textContent = 'Loading transactions...';
        loadingRow.appendChild(loadingCell);
        tableBody.appendChild(loadingRow);

        try {
            const response = await fetch('/api/threshold-transaction-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dateFrom, dateTo, docClass })
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to load threshold transactions.');
            }

            period.textContent = `From ${dateFrom} to ${dateTo} | Threshold: ${formatAmount(data.threshold)}`;
            tableBody.replaceChildren();
            if (!data.transactions.length) {
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = 9;
                emptyCell.textContent = 'No transactions found for the selected date range.';
                emptyRow.appendChild(emptyCell);
                tableBody.appendChild(emptyRow);
                return;
            }

            data.transactions.forEach(function (transaction, index) {
                const row = document.createElement('tr');
                addCell(row, index + 1);
                addCell(row, transaction.AccountName);
                addCell(row, transaction.Branch);
                addCell(row, transaction.TransactionDate);
                addCell(row, transaction.TransactionMiti);
                addCell(row, transaction.AccountTypeAndNo);
                addCell(row, formatAmount(transaction.AmountInvolved));
                addCell(row, transaction.SourceOfFund);
                addCell(row, transaction.Remarks);
                tableBody.appendChild(row);
            });
        } catch (error) {
            tableBody.replaceChildren();
            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');
            errorCell.colSpan = 9;
            errorCell.textContent = error.message;
            errorRow.appendChild(errorCell);
            tableBody.appendChild(errorRow);
        }
    });

    closeButton.addEventListener('click', function () {
        viewer.style.display = 'none';
    });
});
