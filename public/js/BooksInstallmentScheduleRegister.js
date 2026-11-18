
                        document.addEventListener('DOMContentLoaded', () => {
                            const mainForm = document.getElementById('myForm78');
                            const accountTypeCheckbox = document.getElementById('InsaccounttypeCB');
                            const accountCheckbox = document.getElementById('InsaccountnameCB');
                            const resultDiv = document.getElementById('installmentValuesMainDiv');
                            const resultBody = document.querySelector('#insValuesMainTab tbody');
                            const typeDiv = document.getElementById('installmentAccountTypeDiv');
                            const accountDiv = document.getElementById('installmentAccountDiv');
                            const dates = () => ({
                                installmentDateFrom: document.getElementById('installmentDateFrom').value,
                                installmentDateTo: document.getElementById('installmentDateTo').value
                            });
                            const lists = {
                                type: { rows: [], page: 1, size: 200, search: '', selected: new Set(), id: 'GLID', name: 'GLName', alias: 'GLAlias', body: document.querySelector('#installmentTypeListTable tbody'), pager: 'installmentTypePagination', searchInput: 'installmentTypeSearch' },
                                account: { rows: [], page: 1, size: 200, search: '', selected: new Set(), id: 'SLID', name: 'SLName', alias: 'SlAlias', body: document.querySelector('#installmentAccountListTable tbody'), pager: 'installmentAccountPagination', searchInput: 'installmentAccountSearch' }
                            };
                            const setTextCell = (row, value) => { const cell = document.createElement('td'); cell.textContent = value ?? ''; row.appendChild(cell); };

                            function renderList(name) {
                                const list = lists[name];
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
                                    setTextCell(row, String(offset + index + 1));
                                    setTextCell(row, item[list.name]);
                                    setTextCell(row, item[list.alias]);
                                    list.body.appendChild(row);
                                });
                                const pageCount = Math.ceil(filtered.length / list.size);
                                const pager = document.getElementById(list.pager);
                                pager.replaceChildren();
                                const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹'; prev.disabled = list.page <= 1;
                                prev.onclick = () => { list.page--; renderList(name); };
                                const pageLabel = document.createElement('span'); pageLabel.textContent = `Page ${pageCount ? list.page : 0} / ${pageCount}`;
                                const next = document.createElement('button'); next.type = 'button'; next.textContent = '›'; next.disabled = list.page >= pageCount;
                                next.onclick = () => { list.page++; renderList(name); };
                                const count = document.createElement('span'); count.textContent = filtered.length ? `${offset + 1}-${Math.min(list.page * list.size, filtered.length)} of ${filtered.length}` : 'No results';
                                const size = document.createElement('select');
                                [100, 200, 500].forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === list.size; size.appendChild(option); });
                                size.onchange = () => { list.size = Number(size.value); list.page = 1; renderList(name); };
                                pager.append(prev, pageLabel, next, count, size);
                            }

                            Object.entries(lists).forEach(([name, list]) => {
                                document.getElementById(list.searchInput).addEventListener('input', event => { list.search = event.target.value; list.page = 1; renderList(name); });
                                document.getElementById(name === 'type' ? 'installmentTypeSelectAll' : 'installmentAccountSelectAll').addEventListener('click', () => { list.rows.forEach(row => list.selected.add(String(row[list.id]))); renderList(name); });
                                document.getElementById(name === 'type' ? 'installmentTypeUnselectAll' : 'installmentAccountUnselectAll').addEventListener('click', () => { list.selected.clear(); renderList(name); });
                                document.getElementById(name === 'type' ? 'installmentTypeCancel' : 'installmentAccountCancel').addEventListener('click', () => (name === 'type' ? typeDiv : accountDiv).style.display = 'none');
                            });

                            async function showReport(filters = {}) {
                                console.group('[Installment Register] Fetch final report');
                                console.info('Dates and filters:', { ...dates(), ...filters });
                                const response = await fetch('/fetch-installmentScheduleAll-data', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...dates(), ...filters })
                                });
                                console.info('Report endpoint response status:', response.status);
                                if (!response.ok) {
                                    const errorBody = await response.text();
                                    console.error('Report endpoint error response:', errorBody);
                                    console.groupEnd();
                                    throw new Error(errorBody || 'Failed to fetch installment schedule.');
                                }
                                const payload = await response.json();
                                const data = payload.data || payload;
                                console.info('Report payload shape:', {
                                    isArray: Array.isArray(data),
                                    rowCount: Array.isArray(data) ? data.length : null,
                                    keys: data && !Array.isArray(data) && typeof data === 'object' ? Object.keys(data) : []
                                });
                                if (!Array.isArray(data)) {
                                    console.error('Expected report rows to be an array:', payload);
                                    console.groupEnd();
                                    throw new Error('The installment report response was not a row list.');
                                }
                                resultBody.replaceChildren();
                                let principalTotal = 0, interestTotal = 0, totalAmount = 0;
                                data.forEach((item, index) => {
                                    const principal = Number(item.Principal) || 0, interest = Number(item.Interest) || 0, total = Number(item.Total) || 0;
                                    principalTotal += principal; interestTotal += interest; totalAmount += total;
                                    const row = document.createElement('tr');
                                    [index + 1, item.EMIDate, item.GLName, item.SLName, item.SlAlias, item.Phone1, item.Mobile].forEach(value => setTextCell(row, String(value ?? '')));
                                    const mobileStatusCell = document.createElement('td');
                                    const mobileStatusCheckbox = document.createElement('input');
                                    mobileStatusCheckbox.type = 'checkbox';
                                    mobileStatusCheckbox.checked = Boolean(String(item.Mobile || '').trim());
                                    mobileStatusCheckbox.disabled = true;
                                    mobileStatusCell.appendChild(mobileStatusCheckbox);
                                    row.appendChild(mobileStatusCell);
                                    [principal, interest, total, item.LastTransactionDate, item.CollectorName].forEach(value => setTextCell(row, String(value ?? '')));
                                    resultBody.appendChild(row);
                                });
                                const totalRow = document.createElement('tr');
                                totalRow.style.fontWeight = 'bold';
                                totalRow.style.background = '#f0f0f0';
                                const label = document.createElement('td'); label.colSpan = 8; label.textContent = 'TOTAL :'; label.style.textAlign = 'right'; totalRow.appendChild(label);
                                [principalTotal, interestTotal, totalAmount].forEach(value => setTextCell(totalRow, value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })));
                                const trailing = document.createElement('td'); trailing.colSpan = 2; totalRow.appendChild(trailing);
                                resultBody.appendChild(totalRow);
                                typeDiv.style.display = 'none'; accountDiv.style.display = 'none'; resultDiv.style.display = 'block';
                                console.info('Rendered final table rows, including totals:', resultBody.rows.length);
                                console.groupEnd();
                            }

                            async function loadList(kind, endpoint, body) {
                                console.info('[Installment Register] Loading picker list:', { kind, endpoint, requestBody: body || null });
                                const response = await fetch(endpoint, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
                                console.info('[Installment Register] Picker response status:', response.status);
                                if (!response.ok) {
                                    const errorBody = await response.text();
                                    console.error('[Installment Register] Picker endpoint error:', errorBody);
                                    throw new Error(errorBody || 'Failed to load selection list.');
                                }
                                const payload = await response.json();
                                const list = lists[kind];
                                list.rows = kind === 'type' ? (payload.postingLedgers || []) : (payload.AccName || []);
                                console.info('[Installment Register] Picker rows received:', { kind, count: list.rows.length, sample: list.rows.slice(0, 3) });
                                list.page = 1; list.search = ''; list.selected.clear();
                                document.getElementById(list.searchInput).value = '';
                                renderList(kind);
                            }

                            async function loadAllLoanAccounts() {
                                console.info('[Installment Register] Loading all loan accounts for account picker.');
                                const response = await fetch('/fetchInstallmentLoanAccountTypes');
                                console.info('[Installment Register] Loan account type response status:', response.status);
                                if (!response.ok) {
                                    const errorBody = await response.text();
                                    console.error('[Installment Register] Loan account type endpoint error:', errorBody);
                                    throw new Error(errorBody || 'Failed to load loan account types.');
                                }
                                const payload = await response.json();
                                const glids = (payload.postingLedgers || []).map(row => row.GLID);
                                console.info('[Installment Register] Loan account type IDs:', glids);
                                await loadList('account', '/fetchmembers-by-ledger-types', { glids });
                            }

                            document.getElementById('installmentTypeListClose').onclick = () => typeDiv.style.display = 'none';
                            document.getElementById('installmentAccountListClose').onclick = () => accountDiv.style.display = 'none';
                            document.getElementById('installmentValuesMainClo').onclick = event => { event.preventDefault(); resultDiv.style.display = 'none'; };
                            document.getElementById('installmentValuesMainCan').onclick = event => { event.preventDefault(); resultDiv.style.display = 'none'; };

                            document.getElementById('installmentAccountForm').addEventListener('submit', async event => {
                                event.preventDefault();
                                const slids = Array.from(lists.account.selected);
                                console.info('[Installment Register] Account picker submitted:', { selectedCount: slids.length, selectedSLIDs: slids });
                                if (!slids.length) return showCustomAlert('Select at least one account.');
                                try { await showReport({ checkedSLIDs: slids }); } catch (error) { console.error('[Installment Register] Final report failed after account selection:', error); showCustomAlert(error.message); }
                            });
                            document.getElementById('installmentAccountTypeForm').addEventListener('submit', async event => {
                                event.preventDefault();
                                const glids = Array.from(lists.type.selected);
                                console.info('[Installment Register] Account type picker submitted:', { selectedCount: glids.length, selectedGLIDs: glids, selectAllAccounts: accountCheckbox.checked });
                                if (!glids.length) return showCustomAlert('Select at least one account type.');
                                if (accountCheckbox.checked) {
                                    try { await showReport({ checkedGLIDs: glids }); } catch (error) { console.error('[Installment Register] Final report failed after account type selection:', error); showCustomAlert(error.message); }
                                    return;
                                }
                                try {
                                    await loadList('account', '/fetchmembers-by-ledger-types', { glids });
                                    typeDiv.style.display = 'none'; accountDiv.style.display = 'block';
                                } catch (error) { console.error('[Installment Register] Failed loading accounts for selected types:', error); showCustomAlert(error.message); }
                            });

                            mainForm.addEventListener('submit', async event => {
                                event.preventDefault();
                                const { installmentDateFrom, installmentDateTo } = dates();
                                console.info('[Installment Register] Main form submitted:', {
                                    installmentDateFrom, installmentDateTo,
                                    selectAllAccountTypes: accountTypeCheckbox.checked,
                                    selectAllAccounts: accountCheckbox.checked
                                });
                                if (!installmentDateFrom || !installmentDateTo) return showCustomAlert('Select both installment dates.');
                                typeDiv.style.display = 'none'; accountDiv.style.display = 'none'; resultDiv.style.display = 'none';
                                try {
                                    if (accountTypeCheckbox.checked && accountCheckbox.checked) {
                                        await showReport();
                                    } else if (accountTypeCheckbox.checked) {
                                        await loadAllLoanAccounts();
                                        accountDiv.style.display = 'block';
                                    } else {
                                        await loadList('type', '/fetchInstallmentLoanAccountTypes');
                                        typeDiv.style.display = 'block';
                                    }
                                } catch (error) { console.error('[Installment Register] Main form flow failed:', error); showCustomAlert(error.message); }
                            });

                        });
