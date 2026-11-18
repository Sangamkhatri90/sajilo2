document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('movableDiv1301');
    const typeDiv = document.getElementById('lastTransAccountTypeDiv');
    const accountDiv = document.getElementById('lastTransAccountDiv');
    const resultDiv = document.getElementById('lastTransResultDiv');
    const resultBody = document.querySelector('#lastTransResultTable tbody');
    const selectAllTypes = document.getElementById('LastTransAccountTypeCB');
    const selectAllAccounts = document.getElementById('LastTransAccountCB');
    const lists = {
        type: { rows: [], page: 1, size: 200, search: '', selected: new Set(), id: 'GLID', name: 'GLName', alias: 'GLAlias', body: document.querySelector('#lastTransTypeTable tbody'), pager: 'lastTransTypePagination', searchInput: 'lastTransTypeSearch' },
        account: { rows: [], page: 1, size: 200, search: '', selected: new Set(), id: 'SLID', name: 'SLName', alias: 'SlAlias', body: document.querySelector('#lastTransAccountTable tbody'), pager: 'lastTransAccountPagination', searchInput: 'lastTransAccountSearch' }
    };

    function renderList(kind) {
        const list = lists[kind];
        const filtered = list.rows.filter(row => `${row[list.name] || ''} ${row[list.alias] || ''}`.toLocaleLowerCase().includes(list.search.toLocaleLowerCase()));
        const offset = (list.page - 1) * list.size;
        list.body.replaceChildren();
        filtered.slice(offset, offset + list.size).forEach((item, index) => {
            const row = document.createElement('tr');
            const checkCell = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = list.selected.has(String(item[list.id]));
            checkbox.addEventListener('change', () => checkbox.checked ? list.selected.add(String(item[list.id])) : list.selected.delete(String(item[list.id])));
            checkCell.appendChild(checkbox);
            row.appendChild(checkCell);
            [offset + index + 1, item[list.name], item[list.alias]].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value ?? '';
                row.appendChild(cell);
            });
            list.body.appendChild(row);
        });
        const pageCount = Math.ceil(filtered.length / list.size);
        const pager = document.getElementById(list.pager);
        pager.replaceChildren();
        const prev = document.createElement('button');
        prev.type = 'button'; prev.textContent = '‹'; prev.disabled = list.page <= 1;
        prev.onclick = () => { list.page--; renderList(kind); };
        const label = document.createElement('span'); label.textContent = `Page ${pageCount ? list.page : 0} / ${pageCount}`;
        const next = document.createElement('button');
        next.type = 'button'; next.textContent = '›'; next.disabled = list.page >= pageCount;
        next.onclick = () => { list.page++; renderList(kind); };
        const count = document.createElement('span'); count.textContent = filtered.length ? `${offset + 1}-${Math.min(list.page * list.size, filtered.length)} of ${filtered.length}` : 'No results';
        const size = document.createElement('select');
        [100, 200, 500].forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === list.size; size.appendChild(option); });
        size.onchange = () => { list.size = Number(size.value); list.page = 1; renderList(kind); };
        pager.append(prev, label, next, count, size);
    }

    async function loadList(kind, endpoint, body) {
        console.info('[Last Transaction Register] Loading picker:', { kind, endpoint, request: body || null });
        const response = await fetch(endpoint, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
        console.info('[Last Transaction Register] Picker response:', { kind, status: response.status, ok: response.ok });
        if (!response.ok) throw new Error(await response.text() || 'Unable to load the selection list.');
        const payload = await response.json();
        lists[kind].rows = kind === 'type' ? (payload.postingLedgers || []) : (payload.AccName || []);
        console.info('[Last Transaction Register] Picker rows received:', { kind, count: lists[kind].rows.length, sample: lists[kind].rows.slice(0, 3) });
        lists[kind].page = 1; lists[kind].search = ''; lists[kind].selected.clear();
        document.getElementById(lists[kind].searchInput).value = '';
        renderList(kind);
    }

    async function loadAllAccounts() {
        const response = await fetch('/fetchLastTransactionAccountTypes');
        if (!response.ok) throw new Error(await response.text() || 'Unable to load account types.');
        const payload = await response.json();
        const glids = (payload.postingLedgers || []).map(row => row.GLID);
        await loadList('account', '/fetchmembers-by-ledger-types', { glids });
    }

    async function showReport(filters = {}) {
        const requestBody = {
            dateFrom: document.getElementById('lastTransactionDateFrom').value,
            dateTo: document.getElementById('lastTransactionDateTo').value,
            ...filters
        };
        console.group('[Last Transaction Register] Generate final report');
        console.info('Request body:', requestBody);
        const response = await fetch('/fetch-last-transaction-register-data', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        console.info('Report response:', { status: response.status, ok: response.ok });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Report endpoint returned an error:', errorBody);
            console.groupEnd();
            throw new Error(errorBody || 'Unable to load the register.');
        }
        const payload = await response.json();
        console.info('Report payload:', {
            payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : [],
            rowCount: Array.isArray(payload.data) ? payload.data.length : null,
            firstRow: Array.isArray(payload.data) ? payload.data[0] : null
        });
        if (!Array.isArray(payload.data)) {
            console.error('Expected payload.data to be an array:', payload);
            console.groupEnd();
            throw new Error('The Last Transaction Register response did not contain a data array.');
        }
        resultBody.replaceChildren();
        (payload.data || []).forEach((item, index) => {
            const row = document.createElement('tr');
            [index + 1, item.MemberID, item.AccountType, item.AccountNumber, item.AccountName, item.ContactNo,
                item.LastTransactionDate, item.PrincipalBalance, item.InterestBalance,
                item.PrincipalReceivedTillDate, item.InterestReceivedTillDate].forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value == null ? '' : value;
                row.appendChild(cell);
            });
            resultBody.appendChild(row);
        });
        console.info('Rendered result row count:', resultBody.rows.length);
        typeDiv.style.display = 'none';
        accountDiv.style.display = 'none';
        dialog.style.display = 'none';
        resultDiv.style.display = 'block';
        console.groupEnd();
    }

    async function showReportSafely(filters) {
        try { await showReport(filters); }
        catch (error) {
            console.error('[Last Transaction Register] Report generation failed:', error);
            (typeof showCustomAlert === 'function' ? showCustomAlert : alert)(error.message);
        }
    }

    Object.entries(lists).forEach(([kind, list]) => {
        document.getElementById(list.searchInput).addEventListener('input', event => { list.search = event.target.value; list.page = 1; renderList(kind); });
        const prefix = kind === 'type' ? 'lastTransType' : 'lastTransAccount';
        document.getElementById(`${prefix}SelectAll`).addEventListener('click', () => { list.rows.forEach(row => list.selected.add(String(row[list.id]))); renderList(kind); });
        document.getElementById(`${prefix}UnselectAll`).addEventListener('click', () => { list.selected.clear(); renderList(kind); });
        document.getElementById(`${prefix}Cancel`).addEventListener('click', () => (kind === 'type' ? typeDiv : accountDiv).style.display = 'none');
    });

    document.getElementById('lastTransTypeClose').addEventListener('click', () => { typeDiv.style.display = 'none'; });
    document.getElementById('lastTransAccountClose').addEventListener('click', () => { accountDiv.style.display = 'none'; });
    document.getElementById('lastTransResultClose').addEventListener('click', () => { resultDiv.style.display = 'none'; });

    document.getElementById('myFormLastTransaction').addEventListener('submit', async event => {
        event.preventDefault();
        const fromDate = document.getElementById('lastTransactionDateFrom').value;
        const toDate = document.getElementById('lastTransactionDateTo').value;
        if (!fromDate || !toDate) return (typeof showCustomAlert === 'function' ? showCustomAlert : alert)('Select both dates.');
        if (fromDate > toDate) return (typeof showCustomAlert === 'function' ? showCustomAlert : alert)('Date From must be before or equal to Date To.');
        console.info('[Last Transaction Register] Main form submitted:', { fromDate, toDate, selectAllTypes: selectAllTypes.checked, selectAllAccounts: selectAllAccounts.checked });
        try {
            if (selectAllTypes.checked && selectAllAccounts.checked) {
                await showReportSafely({});
            } else if (selectAllTypes.checked) {
                await loadAllAccounts();
                accountDiv.style.display = 'block';
            } else {
                await loadList('type', '/fetchLastTransactionAccountTypes');
                typeDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('[Last Transaction Register] Selection loading failed:', error);
            (typeof showCustomAlert === 'function' ? showCustomAlert : alert)(error.message);
        }
    });

    document.getElementById('lastTransAccountTypeForm').addEventListener('submit', async event => {
        event.preventDefault();
        const glids = Array.from(lists.type.selected);
        console.info('[Last Transaction Register] Account type selection submitted:', { count: glids.length, glids, selectAllAccounts: selectAllAccounts.checked });
        if (!glids.length) return (typeof showCustomAlert === 'function' ? showCustomAlert : alert)('Select at least one account type.');
        if (selectAllAccounts.checked) return showReportSafely({ checkedGLIDs: glids });
        try {
            await loadList('account', '/fetchmembers-by-ledger-types', { glids });
            typeDiv.style.display = 'none';
            accountDiv.style.display = 'block';
        } catch (error) {
            console.error('[Last Transaction Register] Account loading failed:', error);
            (typeof showCustomAlert === 'function' ? showCustomAlert : alert)(error.message);
        }
    });

    document.getElementById('lastTransAccountForm').addEventListener('submit', event => {
        event.preventDefault();
        if (!lists.account.selected.size && !selectAllAccounts.checked) return (typeof showCustomAlert === 'function' ? showCustomAlert : alert)('Select at least one account.');
        const selectedIds = Array.from(lists.account.selected);
        const filters = selectAllAccounts.checked && lists.type.selected.size
            ? { checkedGLIDs: Array.from(lists.type.selected) }
            : { checkedSLIDs: selectedIds };
        console.info('[Last Transaction Register] Account selection submitted:', { count: selectedIds.length, selectedSLIDs: selectedIds, filters });
        showReportSafely(filters);
    });
});
