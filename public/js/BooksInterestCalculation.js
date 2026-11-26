
                        document.addEventListener('DOMContentLoaded', () => {
                            const mainIntCalculationRegister = document.getElementById('intCalculationRegister');

                            // Element references
                            const intCalRegisterSelectAllAT = document.getElementById('intCalRegisterSelectAllAT');
                            const intCalRegisterSelectAllAN = document.getElementById('intCalRegisterSelectAllAN');
                            const intCalRegisterATDiv = document.getElementById('intCalRegisterATDiv');
                            const intCalRegisterATForm = document.getElementById('intCalRegisterATForm');
                            const intCalRegisterATTable = document.getElementById('intCalRegisterATTable');
                            const intCalRegisterATDivUSAT = document.getElementById('intCalRegisterATDivUSAT');
                            const intCalRegisterATFormUSAT = document.getElementById('intCalRegisterATFormUSAT');
                            const intCalRegisterATTableUSAT = document.getElementById('intCalRegisterATTableUSAT');
                            const intCalRegisterANDiv = document.getElementById('intCalRegisterANDiv');
                            const intCalRegisterANForm = document.getElementById('intCalRegisterANForm');
                            const intCalRegisterANTable = document.getElementById('intCalRegisterANTable');
                            const intCalRegisterANDivUSAN = document.getElementById('intCalRegisterANDivUSAN');
                            const intCalRegisterANFormUSAN = document.getElementById('intCalRegisterANFormUSAN');
                            const intCalRegisterANTableUSAN = document.getElementById('intCalRegisterANTableUSAN');

                            const icrSummary = document.getElementById('intCalRegisterSummary');
                            const icrTypewiseSummary = document.getElementById('intCalRegisterAccTypewiseSummary');
                            const icrInterestSourceSummary = document.getElementById('intCalRegisterIntsrcwiseSummary');
                            const icrInterestThreshold = document.getElementById('intCalRegisterInterestinyear');
                            const icrSummaryOptions = [
                                document.getElementById('intCalRegisterForTDSuploadonIRD'),
                                document.getElementById('intCalRegisterShowZeroBalance'),
                                document.getElementById('intCalRegisterGroupbymember')
                            ];
                            const updateICRSummaryOptions = () => {
                                const summaryEnabled = icrSummary.checked;
                                icrSummaryOptions.forEach(option => { option.disabled = summaryEnabled; });
                                icrTypewiseSummary.disabled = !summaryEnabled;
                                icrInterestSourceSummary.disabled = !summaryEnabled || !icrTypewiseSummary.checked;
                                icrInterestThreshold.disabled = !summaryEnabled || icrTypewiseSummary.checked;
                                [
                                    ...icrSummaryOptions,
                                    icrTypewiseSummary,
                                    icrInterestSourceSummary,
                                    icrInterestThreshold
                                ].forEach(option => {
                                    if (option.disabled) option.checked = false;
                                });
                            };
                            icrSummary.addEventListener('change', updateICRSummaryOptions);
                            icrTypewiseSummary.addEventListener('change', updateICRSummaryOptions);
                            updateICRSummaryOptions();

                            const icrPageSizes = [100, 200, 500];
                            const icrTypeState = { rows: [], page: 1, size: 200, selected: new Set() };
                            const icrAccountState = { rows: [], page: 1, size: 200, selected: new Set() };
                            const icrAllAccountsState = { rows: [], page: 1, size: 200, selected: new Set() };
                            const renderICRPagination = (containerId, state, renderPage) => {
                                const container = document.getElementById(containerId);
                                if (!container) return;
                                const pageCount = Math.ceil(state.rows.length / state.size);
                                state.page = Math.min(state.page, Math.max(pageCount, 1));
                                const offset = (state.page - 1) * state.size;
                                container.innerHTML = `<button type="button" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>‹</button>
                                    <span>Page</span><select data-page-select ${pageCount ? '' : 'disabled'}>${Array.from({ length: pageCount }, (_, i) => `<option value="${i + 1}" ${i + 1 === state.page ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
                                    <span>/ ${pageCount}</span><button type="button" data-page="next" ${state.page >= pageCount ? 'disabled' : ''}>›</button>
                                    <span>${state.rows.length ? `${offset + 1}-${Math.min(state.page * state.size, state.rows.length)} of ${state.rows.length}` : 'No results'}</span>
                                    <label>Rows: <select data-page-size>${icrPageSizes.map(size => `<option value="${size}" ${size === state.size ? 'selected' : ''}>${size}</option>`).join('')}</select></label>`;
                                container.querySelector('[data-page="prev"]').onclick = () => { state.page--; renderPage(); };
                                container.querySelector('[data-page="next"]').onclick = () => { state.page++; renderPage(); };
                                container.querySelector('[data-page-select]').onchange = event => { state.page = Number(event.target.value); renderPage(); };
                                container.querySelector('[data-page-size]').onchange = event => { state.size = Number(event.target.value); state.page = 1; renderPage(); };
                            };
                            const renderICRRows = (state, table, typeRows) => {
                                const start = (state.page - 1) * state.size;
                                const rows = state.rows.slice(start, start + state.size);
                                table.innerHTML = rows.map((row, i) => {
                                    const id = String(typeRows ? row.GLID : row.SLID);
                                    return `<tr>
                                        <td><input type="checkbox" class="${typeRows ? 'interest-calculation-register-checkbox' : 'sub-interest-calculation-register-checkbox'}" data-lgrgrpid="${id}" ${state.selected.has(id) ? 'checked' : ''}></td>
                                        <td>${start + i + 1}</td><td>${typeRows ? row.GLName : row.SLName}</td><td>${typeRows ? row.GlAlias : row.SlAlias}</td>
                                    </tr>`;
                                }).join('');
                                renderICRPagination(typeRows ? 'intCalRegisterATPagination' : 'intCalRegisterANPagination', state, () => renderICRRows(state, table, typeRows));
                            };
                            const renderICRAllAccounts = () => {
                                const start = (icrAllAccountsState.page - 1) * icrAllAccountsState.size;
                                const rows = icrAllAccountsState.rows.slice(start, start + icrAllAccountsState.size);
                                intCalRegisterATTableUSAT.innerHTML = rows.map((row, i) => {
                                    const id = String(row.SLID);
                                    return `<tr><td><input type="checkbox" class="interest-calculation-register-USAT-checkbox" data-lgrgrpid="${id}" ${icrAllAccountsState.selected.has(id) ? 'checked' : ''}></td>
                                        <td>${start + i + 1}</td><td>${row.SLName || ''}</td><td>${row.SlAlias || ''}</td></tr>`;
                                }).join('');
                                renderICRPagination('intCalRegisterAllAccountsPagination', icrAllAccountsState, renderICRAllAccounts);
                            };



                            let highestZIndex = 3;

                            const bringToFront = el => {
                                highestZIndex = highestZIndex > 9999 ? 3 : highestZIndex + 1;
                                el.style.zIndex = highestZIndex;
                            };

                            const makeDivMovable = div => {
                                let isDragging = false;
                                let offsetX, offsetY;

                                div.addEventListener('mousedown', e => {
                                    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
                                    e.preventDefault();
                                    bringToFront(div);
                                    const { left, top } = div.getBoundingClientRect();
                                    offsetX = e.clientX - left;
                                    offsetY = e.clientY - top;
                                    div.style.position = 'absolute';
                                    isDragging = true;
                                });

                                document.addEventListener('mousemove', e => {
                                    if (!isDragging) return;
                                    div.style.left = `${e.pageX - offsetX}px`;
                                    div.style.top = `${e.pageY - offsetY}px`;
                                });

                                document.addEventListener('mouseup', () => { isDragging = false; });
                            };

                            const fetchAndRenderTable = async (url, tableElement, rowRenderer) => {
                                const res = await fetch(url);
                                if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
                                const data = await res.json();
                                tableElement.innerHTML = data.map(rowRenderer).join('');
                            };

                            const toggleAllICR = (selector, state) => {
                                document.querySelectorAll(selector).forEach(cb => {
                                    cb.checked = state;
                                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                                });
                            };

                            const bindToggleAll = (buttonId, selector, state) => {
                                const btn = document.getElementById(buttonId);
                                if (btn) {
                                    btn.addEventListener('click', e => {
                                        e.preventDefault();
                                        toggleAllICR(selector, state);
                                    });
                                }
                            };

                            // Safe close for Group Summary
                            const GScloseBtn = document.getElementById('GScloseButton');
                            const GrpSummaryDiv = window.GrpSummaryDiv;
                            if (GScloseBtn && GrpSummaryDiv) {
                                GScloseBtn.addEventListener('click', e => {
                                    e.preventDefault();
                                    GrpSummaryDiv.style.display = 'none';
                                });
                            }

                            // Make movable
                            [intCalRegisterATDiv, intCalRegisterANDiv, intCalRegisterANDivUSAN, intCalRegisterATDivUSAT]
                                .filter(Boolean)
                                .forEach(makeDivMovable);

                            // Main form submission
                            mainIntCalculationRegister?.addEventListener('submit', async e => {
                                e.preventDefault();


                                const bothSelected = intCalRegisterSelectAllAT.checked && intCalRegisterSelectAllAN.checked;
                                const onlyAT = intCalRegisterSelectAllAT.checked && !intCalRegisterSelectAllAN.checked;
                                const onlyAN = !intCalRegisterSelectAllAT.checked && intCalRegisterSelectAllAN.checked;

                                if (bothSelected) return;

                                try {
                                    if (!intCalRegisterSelectAllAT.checked && !intCalRegisterSelectAllAN.checked) {
                                        icrTypeState.rows = await (await fetch('/get-account-type-intCalReg')).json();
                                        icrTypeState.page = 1;
                                        icrTypeState.selected.clear();
                                        renderICRRows(icrTypeState, intCalRegisterATTable, true);
                                        intCalRegisterATDiv.style.display = 'block';
                                    }



                                    if (onlyAN) {
                                        await fetchAndRenderTable('/get-account-type-USAN-intCalReg', intCalRegisterANTableUSAN, (row, i) => `
                        <tr>
                            <td><input type="checkbox" class="interest-calculation-register-USAN-checkbox" data-lgrgrpid="${row.GLID}"></td>
                            <td>${i + 1}</td>
                            <td>${row.GLName}</td>
                            <td>${row.GlAlias}</td>
                        </tr>
                    `);
                                        intCalRegisterATDiv.style.display = 'none';
                                        intCalRegisterANDiv.style.display = 'none';
                                        intCalRegisterANDivUSAN.style.display = 'block';
                                        intCalRegisterATDivUSAT.style.display = 'none';
                                    }

                                    if (onlyAT) {
                                        const response = await fetch('/get-account-name-USAT-intCalReg');
                                        if (!response.ok) throw new Error(`Failed to fetch from /get-account-name-USAT-intCalReg`);
                                        icrAllAccountsState.rows = await response.json();
                                        icrAllAccountsState.page = 1;
                                        icrAllAccountsState.selected.clear();
                                        renderICRAllAccounts();
                                        intCalRegisterATDiv.style.display = 'none';
                                        intCalRegisterANDiv.style.display = 'none';
                                        intCalRegisterATDivUSAT.style.display = 'block';
                                        intCalRegisterANDivUSAN.style.display = 'none';
                                    }

                                } catch (err) {
                                    console.error('Error:', err);
                                }

                                const icrUSANSelected = new Set();

const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = v => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatICRAmount = value => {
  const amount = Number(value || 0);
  return `${money(Math.abs(amount))}${amount < 0 ? ' DR' : ''}`;
};

const ICR_COLS = {
  summary: [
    ['Account', 'Account'], ['Account number', 'AccountNo'],
    ['Interest', 'Interest', 'n'], ['Tax Deduction', 'TDS', 'n'], ['Total Interest', 'TotalInterest', 'n']
  ],
  typewise: [
    ['Account Type', 'AccountType'],
    ['Interest', 'Interest', 'n'], ['Tax Deduction', 'TDS', 'n'], ['Total Interest', 'TotalInterest', 'n']
  ],
  detail: [
    ['Voucher no', 'VoucherNo'], ['Calculated Date', 'CalculationDate'], ['Date to', 'TillDate'],
    ['Account type', 'AccountType'], ['Account', 'Account'], ['Account number', 'AccountNo'],
    ['Interest', 'Interest', 'n'], ['Tax Deduction', 'TDS', 'n'], ['Total Interest', 'TotalInterest', 'n'],
    ['Balance', 'Balance', 'n', 'balance']
  ]
};

const renderICRReport = (rows, opts) => {
  const out = document.getElementById('icrResult');
  if (!rows.length) {
    console.warn('[ICR] Report returned no rows. Check the date range and account filters.', { opts });
    out.innerHTML = '<p>No records found.</p>';
    return;
  }

  const mode = opts.summary ? (opts.typewise ? 'typewise' : 'summary') : 'detail';
  const cols = ICR_COLS[mode].filter(c => c[3] !== 'balance' || opts.showBalance);
  const span = cols.length + 1;

  if (mode === 'typewise') {
    const body = rows.map((row, i) => `<tr><td>${i + 1}</td>${cols.map(c =>
      c[2] === 'n' ? `<td class="num">${formatICRAmount(row[c[1]])}</td>` : `<td>${esc(row[c[1]])}</td>`).join('')}</tr>`).join('');
    out.innerHTML = `<table><thead><tr><th>S.no</th>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
    return;
  }

  if (mode === 'summary') {
    const groups = new Map();
    rows.forEach(row => {
      const type = row.AccountType || 'Other';
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type).push(row);
    });
    const body = [...groups.entries()].map(([type, list]) => {
      const totals = {};
      cols.forEach(c => { if (c[2] === 'n') totals[c[1]] = 0; });
      const accounts = list.map((row, i) => {
        Object.keys(totals).forEach(key => { totals[key] += Number(row[key] || 0); });
        return `<tr><td>${i + 1}</td>${cols.map(c =>
          c[2] === 'n' ? `<td class="num">${formatICRAmount(row[c[1]])}</td>` : `<td>${esc(row[c[1]])}</td>`).join('')}</tr>`;
      }).join('');
      const totalRow = `<tr><td></td>${cols.map((c, i) => c[1] in totals
        ? `<td class="num"><b>${formatICRAmount(totals[c[1]])}</b></td>`
        : `<td>${i === 0 ? '<b>Account Type Total</b>' : ''}</td>`).join('')}</tr>`;
      return `<tr class="icr-group"><th colspan="${span}">${esc(type)}</th></tr>${accounts}${totalRow}`;
    }).join('');
    out.innerHTML = `<table><thead><tr><th>S.no</th>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
    return;
  }

  const groups = {};
  rows.forEach(r => { const k = r.Nature || 'Other'; (groups[k] = groups[k] || []).push(r); });

  const bodyHtml = Object.entries(groups).map(([nature, list]) => {
    const totals = {};
    cols.forEach(c => { if (c[2] === 'n' && c[3] !== 'balance') totals[c[1]] = 0; });

    const body = list.map((r, i) => {
      Object.keys(totals).forEach(k => totals[k] += Number(r[k] || 0));
      return `<tr><td>${i + 1}</td>${cols.map(c =>
        c[2] === 'n' ? `<td class="num">${formatICRAmount(r[c[1]])}</td>` : `<td>${esc(r[c[1]])}</td>`).join('')}</tr>`;
    }).join('');

    const foot = `<tr><td></td>${cols.map((c, i) =>
      c[1] in totals ? `<td class="num"><b>${formatICRAmount(totals[c[1]])}</b></td>`
                     : `<td>${i === 0 ? `<b>Total (${esc(nature)})</b>` : ''}</td>`).join('')}</tr>`;

    return `<tr class="icr-group"><th colspan="${span}">${esc(nature)}</th></tr>${body}${foot}`;
  }).join('');

  out.innerHTML = `<table>
    <thead><tr><th>S.no</th>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead>
    <tbody>${bodyHtml}</tbody></table>`;
};

// USAN checkbox tracking + select/unselect
intCalRegisterANTableUSAN?.addEventListener('change', e => {
  if (!e.target.matches('.interest-calculation-register-USAN-checkbox')) return;
  const id = String(e.target.dataset.lgrgrpid);
  e.target.checked ? icrUSANSelected.add(id) : icrUSANSelected.delete(id);
});
bindToggleAll('intCalRegisterANUSANSelectAll', '.interest-calculation-register-USAN-checkbox', true);
bindToggleAll('intCalRegisterANUSANUnselectAll', '.interest-calculation-register-USAN-checkbox', false);

// USAT select/unselect across ALL pages
document.getElementById('intCalRegisterATUSATSelectAll')?.addEventListener('click', e => {
  e.preventDefault();
  icrAllAccountsState.rows.forEach(r => icrAllAccountsState.selected.add(String(r.SLID)));
  renderICRAllAccounts();
});
document.getElementById('intCalRegisterATUSATUnselectAll')?.addEventListener('click', e => {
  e.preventDefault();
  icrAllAccountsState.selected.clear();
  renderICRAllAccounts();
});

const runICRReport = async () => {
  const $ = id => document.getElementById(id);
  const allT = $('intCalRegisterSelectAllAT').checked;
  const allN = $('intCalRegisterSelectAllAN').checked;

  let typeIds = [], accountIds = [];
  if (allT && allN) { /* everything */ }
  else if (allT)    accountIds = [...icrAllAccountsState.selected];
  else if (allN)    typeIds = [...icrUSANSelected];
  else { typeIds = [...icrTypeState.selected]; accountIds = [...icrAccountState.selected]; }

  if (!(allT && allN) && !typeIds.length && !accountIds.length) {
    showCustomAlert('Select at least one account type or account');
    return;
  }

  const opts = {
    summary: $('intCalRegisterSummary').checked,
    typewise: $('intCalRegisterAccTypewiseSummary').checked,
    showBalance: $('intCalRegisterShowAcBalance').checked,
    filterByMinInterest: $('intCalRegisterInterestinyear').checked
  };

  const enteredTillDate = $('bookscalcinttilldate').value;
  const enteredLastDate = $('bookscalclastdate').value;
  const [lastDate, tillDate] = enteredLastDate <= enteredTillDate
    ? [enteredLastDate, enteredTillDate]
    : [enteredTillDate, enteredLastDate];
  if (enteredLastDate > enteredTillDate) {
    console.warn('[ICR] Date fields were reversed; sending them in chronological order.', {
      enteredTillDate,
      enteredLastDate,
      lastDate,
      tillDate
    });
  }

  const requestBody = {
    tillDate,
    lastDate,
    docClass: $('BooksintcalcDocclass').value,
    minInterest: $('intCalRegisterInterestinyearInput').value,
    ...opts, typeIds, accountIds
  };
  console.info('[ICR] Sending report request', {
    tillDate: requestBody.tillDate,
    lastDate: requestBody.lastDate,
    enteredTillDate,
    enteredLastDate,
    docClass: requestBody.docClass,
    minInterest: requestBody.minInterest,
    typeIds,
    accountIds,
    opts
  });

  try {
    const res = await fetch('/interest-calculation-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    console.info('[ICR] Report response status:', res.status);
    if (!res.ok) {
      const responseText = await res.text();
      console.error('[ICR] Report request failed:', responseText);
      let errorMessage = 'Failed to generate report';
      try { errorMessage = JSON.parse(responseText).error || errorMessage; } catch (_) { }
      showCustomAlert(errorMessage);
      return;
    }
    const rows = await res.json();
    console.info('[ICR] Report rows received:', { count: rows.length, sample: rows.slice(0, 3) });
    renderICRReport(rows, opts);
    [intCalRegisterATDiv, intCalRegisterANDiv, intCalRegisterANDivUSAN, intCalRegisterATDivUSAT]
      .forEach(d => d && (d.style.display = 'none'));
  } catch (err) {
    console.error('[ICR] Report request or response parsing failed:', err);
    showCustomAlert('Failed to generate report');
  }
};

intCalRegisterANForm?.addEventListener('submit', e => { e.preventDefault(); runICRReport(); });
intCalRegisterATFormUSAT?.addEventListener('submit', e => { e.preventDefault(); runICRReport(); });
intCalRegisterANFormUSAN?.addEventListener('submit', e => { e.preventDefault(); runICRReport(); });
                            });

                            // On AT checkbox change, fetch corresponding AN
                            intCalRegisterATTable?.addEventListener('change', async e => {
                                if (!e.target.matches('.interest-calculation-register-checkbox')) return;

                                const id = String(e.target.dataset.lgrgrpid);
                                e.target.checked ? icrTypeState.selected.add(id) : icrTypeState.selected.delete(id);
                                const selectedIDs = [...icrTypeState.selected].map(id => `id=${encodeURIComponent(id)}`).join('&');

                                if (!selectedIDs) return;

                                try {
                                    const res = await fetch(`/get-account-name-intCalReg?${selectedIDs}`);
                                    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                                    const subGroups = await res.json();
                                    icrAccountState.rows = subGroups;
                                    icrAccountState.page = 1;
                                    icrAccountState.selected.clear();
                                    renderICRRows(icrAccountState, intCalRegisterANTable, false);
                                } catch (err) {
                                    console.error('Error fetching subgroups:', err);
                                }
                            });

                            intCalRegisterATForm?.addEventListener('submit', e => {
                                e.preventDefault();
                                if (!icrTypeState.selected.size) {
                                    showCustomAlert('Select atleast one Alc Type');
                                    return;
                                }
                                intCalRegisterATDiv.style.display = 'none';
                                intCalRegisterANDiv.style.display = 'block';
                            });

                            intCalRegisterANTable?.addEventListener('change', e => {
                                if (!e.target.matches('.sub-interest-calculation-register-checkbox')) return;
                                const id = String(e.target.dataset.lgrgrpid);
                                e.target.checked ? icrAccountState.selected.add(id) : icrAccountState.selected.delete(id);
                            });

                            intCalRegisterATTableUSAT?.addEventListener('change', e => {
                                if (!e.target.matches('.interest-calculation-register-USAT-checkbox')) return;
                                const id = String(e.target.dataset.lgrgrpid);
                                e.target.checked ? icrAllAccountsState.selected.add(id) : icrAllAccountsState.selected.delete(id);
                            });

                            // Toggle helpers
                            const bindICRSelectAll = (buttonId, state, table, typeRows, selected) => {
                                document.getElementById(buttonId)?.addEventListener('click', async e => {
                                    e.preventDefault();
                                    state.rows.forEach(row => {
                                        const id = String(typeRows ? row.GLID : row.SLID);
                                        selected ? state.selected.add(id) : state.selected.delete(id);
                                    });
                                    renderICRRows(state, table, typeRows);
                                    if (typeRows && state.selected.size) {
                                        const ids = [...state.selected].map(id => `id=${encodeURIComponent(id)}`).join('&');
                                        const response = await fetch(`/get-account-name-intCalReg?${ids}`);
                                        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
                                        icrAccountState.rows = await response.json();
                                        icrAccountState.page = 1;
                                        icrAccountState.selected.clear();
                                        renderICRRows(icrAccountState, intCalRegisterANTable, false);
                                    }
                                });
                            };
                            bindICRSelectAll('intCalRegisterATSelectAll', icrTypeState, intCalRegisterATTable, true, true);
                            bindICRSelectAll('intCalRegisterATUnselectAll', icrTypeState, intCalRegisterATTable, true, false);
                            bindICRSelectAll('intCalRegisterANSelectAll', icrAccountState, intCalRegisterANTable, false, true);
                            bindICRSelectAll('intCalRegisterANUnselectAll', icrAccountState, intCalRegisterANTable, false, false);
                        });
