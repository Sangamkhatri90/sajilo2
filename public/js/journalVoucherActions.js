document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('JVTablevalues');
  if (!table) return;

  let selectedRow = null;
  const notify = (message) => typeof showCustomAlert === 'function' ? showCustomAlert(message) : alert(message);
  const selected = () => {
    if (selectedRow) return selectedRow;
    notify('Please select the row you want to edit, copy, delete, print, export, trash, or reverse.');
    return null;
  };
  const selectedId = async () => {
    const row = selected();
    if (!row) return null;
    if (row.dataset.journalId) return row.dataset.journalId;
    const voucherNo = row.cells[1]?.textContent.trim();
    if (!voucherNo) { notify('The selected row has no voucher number. Search again and select a data row.'); return null; }
    const response = await fetch(`/api/journal-vouchers/lookup?voucherNo=${encodeURIComponent(voucherNo)}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Unable to identify the selected journal voucher.');
    row.dataset.journalId = data.journalID;
    return row.dataset.journalId;
  };
  const searchForm = document.getElementById('jvSearchForm');
  let trashMode = false;
  let loading = false;
  const loadingOverlay = document.createElement('div');
  loadingOverlay.style.cssText = 'display:none;position:absolute;inset:0;z-index:9999;background:rgba(255,255,255,.82);align-items:center;justify-content:center;color:#075caf;';
  loadingOverlay.innerHTML = '<div style="width:280px;padding:20px 22px;border-radius:10px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.18);text-align:center;font-weight:600"><div style="margin-bottom:12px"><i class="fas fa-spinner fa-spin"></i> Loading vouchers</div><div style="height:12px;border-radius:8px;background:#d7e6f5;overflow:hidden"><div class="jv-loading-bar" style="height:100%;width:8%;background:#218838"></div></div><div class="jv-loading-percent" style="margin-top:9px">8%</div></div>';
  const master = document.getElementById('movableDiv38');
  master?.appendChild(loadingOverlay);
  const loadingBar = loadingOverlay.querySelector('.jv-loading-bar'), loadingPercent = loadingOverlay.querySelector('.jv-loading-percent');
  const setLoading = value => { loading = value; clearInterval(setLoading.timer); if (value) { let progress = 8; loadingOverlay.style.display = 'flex'; loadingPercent.textContent = '8%'; loadingBar.style.width = '8%'; setLoading.timer = setInterval(() => { progress = Math.min(88, progress + 4); loadingPercent.textContent = `${progress}%`; loadingBar.style.width = `${progress}%`; }, 160); } else { loadingPercent.textContent = '100%'; loadingBar.style.width = '100%'; setTimeout(() => { loadingOverlay.style.display = 'none'; }, 120); } };
  const jvBody = table.tBodies[0];
  jvBody && new MutationObserver(() => { if (loading && Array.from(jvBody.rows).some(row => row.cells.length > 1 && !row.cells[0]?.colSpan)) setLoading(false); }).observe(jvBody, { childList: true, subtree: true });
  window.addEventListener('journal-voucher-search-finished', () => setLoading(false));
  searchForm?.addEventListener('submit', () => { setLoading(true); setTimeout(() => { if (loading) setLoading(false); }, 30000); }, true);
  const refresh = () => searchForm?.requestSubmit();
  const setTrashMode = (value) => {
    trashMode = value;
    if (!searchForm) return;
    let field = searchForm.querySelector('[name="JVTrash"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = 'JVTrash';
      searchForm.appendChild(field);
    }
    field.value = value ? '1' : '0';
    const button = master?.querySelector('#trash-button');
    if (button) button.innerHTML = value ? '<i class="fas fa-list"></i> Active' : '<i class="fas fa-recycle"></i> Trash';
    selectedRow?.classList.remove('selected-row');
    selectedRow = null;
    refresh();
  };
  const cellValue = (cell) => (cell?.querySelector('input, select, textarea')?.value ?? cell?.textContent ?? '').trim();
  const columnValue = (row, heading) => {
    const headings = Array.from(table.tHead?.rows || []).flatMap((headerRow) => Array.from(headerRow.cells));
    const column = headings.findIndex((cell) => cell.textContent.trim().toLowerCase() === heading.toLowerCase());
    return column >= 0 ? cellValue(row.cells[column]) : '';
  };

  const bindMemberLookup = (form) => {
    const memberID = form.querySelector('[name="JVMemberID"], #paymentVoucherMemberID');
    const memberName = form.querySelector('[name="JVMemberName"], #paymentVoucherMemberName');
    if (!memberID || !memberName || memberID.dataset.lookupBound) return;
    memberID.dataset.lookupBound = 'true';
    memberID.addEventListener('blur', async () => {
      const alias = memberID.value.trim();
      if (!alias) { memberName.value = ''; return; }
      try {
        const response = await fetch('/get-member-name-2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alias }) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Member not found.');
        memberName.value = data.memberName || '';
      } catch (error) { memberName.value = ''; notify(error.message); }
    });
  };

  ['myForm97', 'myForm107', 'myForm182', 'myForm183'].forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) bindMemberLookup(form);
  });

  table.addEventListener('click', (event) => {
    const row = event.target.closest('tbody tr');
    if (!row || row.cells.length < 2 || row.cells[0].colSpan > 1) return;
    selectedRow?.classList.remove('selected-row');
    selectedRow = row;
    selectedRow.classList.add('selected-row');
  }, true);

  const actionButtons = ['toggleButton182', 'toggleButton183', 'delete-button', 'print-button', 'export-button', 'reverse-button'];
  actionButtons.forEach((id) => master?.querySelector(`#${id}`)?.addEventListener('click', (event) => {
    if (!selectedRow) {
      event.preventDefault();
      event.stopImmediatePropagation();
      selected();
    }
  }, true));

  document.getElementById('toggleButton182')?.addEventListener('click', async (event) => {
    event.preventDefault();
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; } if (!id) return;
    try {
      const response = await fetch(`/api/journal-vouchers/${id}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load journal voucher.');
      const form = document.getElementById('myForm182');
      form.dataset.journalId = id;
      form.querySelector('[name="voucherNumberJVM"]').value = data.voucher.VoucherNo || '';
      form.querySelector('[name="JVVoucherDate"]').value = data.voucher.JV_Date || '';
      form.querySelector('[name="docClassJVM"]').value = data.voucher.DocClassName || '';
      form.querySelector('[name="JVMemberID"]').value = data.voucher.MemberID || '';
      form.querySelector('[name="JVMemberName"]').value = data.voucher.MemberName || '';
      form.querySelector('[name="JVCollector"]').value = data.voucher.CollectorName || '';
      form.querySelector('[name="JVRemarks"]').value = data.voucher.Remarks || '';
      const body = form.querySelector('#jv-new-table2 tbody');
      body.innerHTML = data.details.map((detail, index) => `<tr><td>${index + 1}</td><td>${Number(detail.DrAmount || 0) > 0 ? 'Dr' : 'Cr'}</td><td>${detail.accountHead || ''}</td><td>${detail.subHead || ''}</td><td>${detail.DrAmount || ''}</td><td>${detail.CrAmount || ''}</td></tr>`).join('') || '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
      // The same table controller used by New supports these edit rows too.
      bindMemberLookup(form);
      document.getElementById('movableDiv182').style.display = 'block';
    } catch (error) { notify(error.message); }
  });

  document.getElementById('myForm182')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.dataset.journalId) return notify('Please select the row you want to edit.');
    const value = (name) => form.querySelector(`[name="${name}"]`)?.value.trim() || '';
    const details = Array.from(form.querySelectorAll('#jv-new-table2 tbody tr')).map((row) => ({
      accountHead: cellValue(row.cells[2]), subHead: cellValue(row.cells[3]), drAmount: cellValue(row.cells[4]), crAmount: cellValue(row.cells[5])
    })).filter((row) => row.accountHead || row.subHead || row.drAmount || row.crAmount);
    try {
      const response = await fetch(`/api/journal-vouchers/${form.dataset.journalId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voucherNo: value('voucherNumberJVM'), voucherDate: value('JVVoucherDate'), docClass: value('docClassJVM'), memberID: value('JVMemberID'), collector: value('JVCollector'), remarks: value('JVRemarks'), details }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to update journal voucher.');
      notify(data.message); document.getElementById('movableDiv182').style.display = 'none'; refresh();
    } catch (error) { notify(error.message); }
  });

  master?.querySelector('#delete-button')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (trashMode) return notify('Open Active vouchers before moving a voucher to Trash.');
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; }
    if (!id) return;
    const confirmed = await window.showVoucherDeleteConfirm('Move the selected journal voucher to Trash?');
    if (!confirmed) return;
    try { const response = await fetch(`/api/vouchers/${id}/trash`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuName: 'Journal Voucher' }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || 'Unable to move journal voucher to Trash.'); notify(data.message); selectedRow = null; refresh(); } catch (error) { notify(error.message); }
  });

  document.getElementById('toggleButton183')?.addEventListener('click', async (event) => {
    event.preventDefault();
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; } if (!id) return;
    try {
      const response = await fetch('/api/nextJournalVoucher');
      const data = await response.json();
      if (!response.ok || !data.voucherNumber) throw new Error(data.message || 'Unable to get the next journal voucher number.');
      const form = document.getElementById('myForm183');
      form.dataset.sourceJournalId = id;
      form.querySelector('[name="voucherNumberJVM"]').value = data.voucherNumber;
      form.querySelector('#DEJVMcopyDocclass').value = columnValue(selectedRow, 'Doc Class');
      document.getElementById('movableDiv183').style.display = 'block';
    } catch (error) { notify(error.message); }
  });

  document.getElementById('myForm183')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (name) => form.querySelector(`[name="${name}"]`)?.value.trim() || '';
    const details = Array.from(form.querySelectorAll('#jv-new-table3 tbody tr')).map((row) => ({
      accountHead: cellValue(row.cells[2]), subHead: cellValue(row.cells[3]), drAmount: cellValue(row.cells[4]), crAmount: cellValue(row.cells[5])
    })).filter((row) => row.accountHead || row.subHead || row.drAmount || row.crAmount);
    const voucherDate = value('JVVoucherDate');
    const formattedVoucherDate = /^\d{4}-\d{2}-\d{2}$/.test(voucherDate)
      ? voucherDate.split('-').reverse().join('/')
      : voucherDate;
    const invalidCreditRow = details.find((row) => Number(row.crAmount || 0) > 0 || Number(row.drAmount || 0) <= 0);
    if (invalidCreditRow) return notify('Journal voucher detail rows should use Dr.Amount only.');
    try {
      const response = await fetch('/account/Transaction/JournalMaster97', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherNo: value('voucherNumberJVM'), docClass: value('docClassJVM'),
          JVVoucherDate: formattedVoucherDate, JVCollector: value('JVCollector'),
          JVRemarks: value('JVRemarks'), JVUserName: form.querySelector('#JVUserName')?.value.trim() || '',
          memberID: value('JVMemberID'), memberName: value('JVMemberName'), details
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to insert journal voucher.');
      notify(data.message); form.reset(); document.getElementById('movableDiv183').style.display = 'none'; refresh();
    } catch (error) { notify(error.message); }
  });

  [['closeButton97', 'movableDiv97'], ['closeButton182', 'movableDiv182'], ['closeButton183', 'movableDiv183']].forEach(([buttonId, divId]) => {
    document.getElementById(buttonId)?.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(divId).style.display = 'none';
    });
  });

  document.querySelector('#myForm183 button.jv-button:not([type])')?.setAttribute('type', 'button');

  master?.querySelector('#print-button')?.addEventListener('click', (event) => { event.preventDefault(); const row = selected(); if (!row) return; const popup = window.open('', '_blank'); popup.document.write(`<table border="1"><thead>${table.tHead.innerHTML}</thead><tbody>${row.outerHTML}</tbody></table>`); popup.document.close(); popup.print(); });
  master?.querySelector('#export-button')?.addEventListener('click', (event) => { event.preventDefault(); const row = selected(); if (!row) return; const values = Array.from(row.cells, cell => `"${cell.textContent.trim().replaceAll('"', '""')}"`); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([values.join(',')], { type: 'text/csv' })); a.download = 'journal-voucher.csv'; a.click(); URL.revokeObjectURL(a.href); });
  master?.querySelector('#trash-button')?.addEventListener('click', (event) => { event.preventDefault(); setTrashMode(!trashMode); });
  master?.querySelector('#reverse-button')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!trashMode) return notify('Open Trash first, then select a voucher to restore.');
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; }
    if (!id) return;
    try { const response = await fetch(`/api/vouchers/${id}/restore`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuName: 'Journal Voucher' }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || 'Unable to restore journal voucher.'); notify(data.message); selectedRow = null; refresh(); } catch (error) { notify(error.message); }
  });
});
