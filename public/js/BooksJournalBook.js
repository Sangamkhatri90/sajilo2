// function to select all checkboxes in a group
function selectAll(source, groupClass) {
    document.getElementsByName(groupClass).forEach(checkbox => { checkbox.checked = source.checked; });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('myForm73');
    const voucherList = document.getElementById('journalBookVoucherList');
    const entryList = document.getElementById('journalBookEntryList');
    const entryBody = document.querySelector('#journalBookEntryTable tbody');
    const pagination = document.getElementById('journalBookEntryPagination');
    if (!form || !voucherList || !entryList || !entryBody || !pagination) return;

    const selectedEntries = new Set();
    let selectedUdvNos = [];
    let currentPage = 1;
    let pageSize = 200;
    let totalRows = 0;

    fetch('/fetchMenuNames')
        .then(response => response.json())
        .then(data => {
            const vouchers = (data.menuNames || []).filter(voucher =>
                String(voucher.MenuName || '').trim().toLowerCase() !== 'opening balance'
            );
            vouchers.forEach(voucher => {
                const item = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `journal-book-voucher-${voucher.UDVNo}`;
                checkbox.name = 'group2';
                checkbox.value = voucher.UDVNo;
                checkbox.className = 'jb-checkbox';
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = voucher.MenuName;
                item.append(checkbox, label);
                voucherList.appendChild(item);
            });
        })
        .catch(error => console.error('Error loading Journal Book vouchers:', error));

    function renderPagination() {
        const pageCount = Math.ceil(totalRows / pageSize);
        const start = totalRows ? (currentPage - 1) * pageSize + 1 : 0;
        const end = Math.min(currentPage * pageSize, totalRows);
        pagination.innerHTML = `<button type="button" data-page="previous" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            <span>Page</span><select data-page-select ${pageCount ? '' : 'disabled'}>${Array.from({ length: pageCount }, (_, i) => `<option value="${i + 1}" ${i + 1 === currentPage ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
            <span>/ ${pageCount}</span><button type="button" data-page="next" ${currentPage >= pageCount ? 'disabled' : ''}>›</button>
            <span>${totalRows ? `${start}-${end} of ${totalRows}` : 'No results'}</span>
            <label>Rows: <select data-page-size>${[100, 200, 500].map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`).join('')}</select></label>`;
        pagination.querySelector('[data-page="previous"]').onclick = () => { currentPage--; loadEntries(); };
        pagination.querySelector('[data-page="next"]').onclick = () => { currentPage++; loadEntries(); };
        pagination.querySelector('[data-page-select]').onchange = event => { currentPage = Number(event.target.value); loadEntries(); };
        pagination.querySelector('[data-page-size]').onchange = event => { pageSize = Number(event.target.value); currentPage = 1; loadEntries(); };
    }

    async function loadEntries() {
        const response = await fetch('/api/books/journal-book/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                udvNos: selectedUdvNos,
                startDate: document.getElementById('booksJBDateFrom').value,
                endDate: document.getElementById('booksJBDateTo').value,
                page: currentPage,
                pageSize
            })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load vouchers.');
        totalRows = data.totalRows;
        const offset = (currentPage - 1) * pageSize;
        entryBody.innerHTML = '';
        data.rows.map((row, index) => {
            const id = String(row.JournalID);
            const cell = value => {
                const td = document.createElement('td');
                td.textContent = value ?? '';
                return td;
            };
            const tr = document.createElement('tr');
            const checkCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'journal-book-entry-checkbox';
            checkbox.value = id;
            checkbox.checked = selectedEntries.has(id);
            checkbox.addEventListener('change', () => checkbox.checked ? selectedEntries.add(id) : selectedEntries.delete(id));
            checkCell.appendChild(checkbox);
            tr.append(checkCell, cell(offset + index + 1), cell(row.VoucherNo), cell(row.JV_Date), cell(row.JV_Miti));
            return tr;
        }).forEach(row => entryBody.appendChild(row));
        renderPagination();
        entryList.style.display = 'block';
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        selectedUdvNos = [...voucherList.querySelectorAll('input[name="group2"]:checked')].map(input => input.value);
        if (!selectedUdvNos.length) {
            alert('Please select one voucher');
            return;
        }
        currentPage = 1;
        selectedEntries.clear();
        loadEntries().catch(error => alert(error.message));
    });

    document.getElementById('journalBookEntrySelectAll').addEventListener('click', () => {
        entryBody.querySelectorAll('.journal-book-entry-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            selectedEntries.add(checkbox.value);
        });
    });
    document.getElementById('journalBookEntryUnselectAll').addEventListener('click', () => {
        entryBody.querySelectorAll('.journal-book-entry-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            selectedEntries.delete(checkbox.value);
        });
    });
    const report = document.getElementById('journalBookReport');
    const reportBody = document.querySelector('#journalBookReportTable tbody');
    const closeEntryList = () => { entryList.style.display = 'none'; };
    const closeReport = () => { report.style.display = 'none'; };
    document.getElementById('journalBookEntryOk').addEventListener('click', async () => {
        const journalIDs = [...selectedEntries];
        if (!journalIDs.length) {
            alert('Please select at least one voucher entry');
            return;
        }
        try {
            const response = await fetch('/api/books/journal-book/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalIDs })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load Journal Book report.');

            reportBody.replaceChildren();
            let currentJournalID = null;
            let voucherDebit = 0;
            let voucherCredit = 0;
            let grandDebit = 0;
            let grandCredit = 0;
            const formatAmount = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const addRow = (values, className = '') => {
                const row = document.createElement('tr');
                if (className) row.className = className;
                values.forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                reportBody.appendChild(row);
            };
            const addVoucherTotal = () => {
                addRow(['', '', '', 'Total', formatAmount(voucherDebit), formatAmount(voucherCredit)], 'jb-total-row');
                grandDebit += voucherDebit;
                grandCredit += voucherCredit;
                voucherDebit = 0;
                voucherCredit = 0;
            };

            data.rows.forEach((row, index) => {
                if (currentJournalID !== null && currentJournalID !== row.JournalID) addVoucherTotal();
                currentJournalID = row.JournalID;
                const debit = Number(row.Debit || 0);
                const credit = Number(row.Credit || 0);
                voucherDebit += debit;
                voucherCredit += credit;
                addRow([String(index + 1), row.ReportDate || '', row.VoucherNo || '', row.Particular || '', formatAmount(debit), formatAmount(credit)]);
            });
            if (currentJournalID !== null) addVoucherTotal();
            addRow(['', '', '', 'Grand Total', formatAmount(grandDebit), formatAmount(grandCredit)], 'jb-grand-total-row');
            closeEntryList();
            report.style.display = 'block';
        } catch (error) {
            alert(error.message);
        }
    });
    document.getElementById('journalBookEntryCancel').addEventListener('click', closeEntryList);
    document.getElementById('journalBookEntryCloseButton').addEventListener('click', closeEntryList);
    document.getElementById('journalBookReportOk').addEventListener('click', closeReport);
    document.getElementById('journalBookReportClose').addEventListener('click', closeReport);
    document.getElementById('journalBookReportPrint').addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Allow pop-ups to print the Journal Book.');
        printWindow.document.write(`<html><head><title>Journal Book</title><style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}th,td{border:1px solid #777;padding:6px;text-align:left}.jb-total-row,.jb-grand-total-row{font-weight:bold}</style></head><body><h2>Journal Book</h2>${document.getElementById('journalBookReportTable').outerHTML}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    });
    document.getElementById('journalBookReportExport').addEventListener('click', () => {
        const csv = [...document.querySelectorAll('#journalBookReportTable tr')].map(row =>
            [...row.cells].map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',')
        ).join('\r\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = 'journal-book.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    });
});
  
