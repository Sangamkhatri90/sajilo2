
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('myForm42');
    const resultDiv = document.getElementById('narrationSummaryResult');

    if (!form || !resultDiv) return;

    // ================= FORM SUBMIT =================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fromDate = document.getElementById('issue-date-from').value;
        const toDate = document.getElementById('NLDateTo').value;

        const summaryOnly = form.querySelector(
            '[name="NLSummaryOnly"]'
        ).checked;

        const selectAll = form.querySelector(
            '[name="NLSelectAll"]'
        ).checked;

        const postedOnly = form.querySelector(
            '[name="NLPostedOnly"]'
        ).checked;

        const filterOnly = form.querySelector(
            '[name="NLFilterOnly"]'
        ).value.trim();

        if (!fromDate || !toDate) {
            alert('Please select both From Date and To Date.');
            return;
        }

        if (fromDate > toDate) {
            alert('From Date cannot be greater than To Date.');
            return;
        }

        resultDiv.innerHTML = `
            <div class="nl-loading">
                Loading Narration Summary...
            </div>
        `;

        try {

            const response = await fetch('/api/narrationSummary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromDate,
                    toDate,
                    summaryOnly,
                    selectAll,
                    postedOnly,
                    filterOnly
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || 'Failed to generate report'
                );
            }

            displayNarrationSummary(result);

        } catch (error) {

            console.error('Narration Summary Error:', error);

            resultDiv.innerHTML = `
                <div class="nl-error">
                    ${escapeHTML(error.message)}
                </div>
            `;
        }
    });


    // ================= DISPLAY REPORT =================
    function displayNarrationSummary(result) {

        const rows = result.data || [];
        const total = result.total || {};

        if (rows.length === 0) {
            resultDiv.innerHTML = `
                <div class="nl-empty">
                    No records found for the selected date range.
                </div>
            `;
            return;
        }

        let html = `
            <div class="nl-report-wrapper">

                <h3 class="nl-report-title">
                    Narration Summary
                </h3>

                <div class="nl-report-table-wrapper">

                    <table class="nl-report-table">

                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Particular</th>
                                <th>Number</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Balance</th>
                            </tr>
                        </thead>

                        <tbody>
        `;

        rows.forEach(row => {

            html += `
                <tr>
                    <td>${row.SNO}</td>

                    <td class="nl-particular">
                        ${escapeHTML(row.Particular)}
                    </td>

                    <td class="text-right">
                        ${formatNumber(row.Number)}
                    </td>

                    <td class="text-right">
                        ${formatAmount(row.Debit)}
                    </td>

                    <td class="text-right">
                        ${formatAmount(row.Credit)}
                    </td>

                    <td></td>
                </tr>
            `;
        });

        html += `
                        </tbody>

                        <tfoot>
                            <tr>
                                <th colspan="2">Total</th>

                                <th class="text-right">
                                    ${formatNumber(total.Number)}
                                </th>

                                <th class="text-right">
                                    ${formatAmount(total.Debit)}
                                </th>

                                <th class="text-right">
                                    ${formatAmount(total.Credit)}
                                </th>

                                <th></th>
                            </tr>
                        </tfoot>

                    </table>

                </div>

                <div class="nl-report-count">
                    Total Particulars: ${rows.length}
                </div>

            </div>
        `;

        resultDiv.innerHTML = html;
    }


    // ================= FORMAT NUMBERS =================
    function formatAmount(value) {
        return Number(value || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString('en-IN');
    }


    // ================= HTML ESCAPE =================
    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    }


    // ================= CANCEL BUTTON =================
    const cancelButton = document.getElementById('cancelButton42');

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            form.reset();
            resultDiv.innerHTML = '';
        });
    }

});
