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
    const button = document.getElementById('trash-button');
    if (button) button.innerHTML = value ? '<i class="fas fa-list"></i> Active' : '<i class="fas fa-recycle"></i> Trash';
    selectedRow?.classList.remove('selected-row');
    selectedRow = null;
    refresh();
  };
  const cellValue = (cell) => (cell?.querySelector('input, select, textarea')?.value ?? cell?.textContent ?? '').trim();

  const bindMemberLookup = (form) => {
    const memberID = form.querySelector('[name="JVMemberID"]');
    const memberName = form.querySelector('[name="JVMemberName"]');
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

  ['myForm97', 'myForm182', 'myForm183'].forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) bindMemberLookup(form);
  });

  table.addEventListener('click', (event) => {
    const row = event.target.closest('tbody tr');
    if (!row || row.cells.length < 2 || row.cells[0].colSpan > 1) return;
    selectedRow?.classList.remove('selected-row');
    selectedRow = row;
    selectedRow.classList.add('selected-row');
  });

  const actionButtons = ['toggleButton182', 'toggleButton183', 'delete-button', 'print-button', 'export-button', 'reverse-button'];
  actionButtons.forEach((id) => document.getElementById(id)?.addEventListener('click', (event) => {
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

  document.getElementById('delete-button')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (trashMode) return notify('Open Active vouchers before moving a voucher to Trash.');
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; }
    if (!id || !confirm('Move the selected journal voucher to Trash?')) return;
    try { const response = await fetch(`/api/vouchers/${id}/trash`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuName: 'Journal Voucher' }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || 'Unable to move journal voucher to Trash.'); notify(data.message); selectedRow = null; refresh(); } catch (error) { notify(error.message); }
  });

  document.getElementById('toggleButton183')?.addEventListener('click', async (event) => {
    event.preventDefault(); let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; } if (!id) return;
    const voucherNo = prompt('Enter the voucher number for the copy:'); if (!voucherNo?.trim()) return;
    try { const response = await fetch(`/api/journal-vouchers/${id}/copy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voucherNo: voucherNo.trim() }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || 'Unable to copy journal voucher.'); notify(data.message); refresh(); } catch (error) { notify(error.message); }
  });

  document.getElementById('print-button')?.addEventListener('click', (event) => { event.preventDefault(); const row = selected(); if (!row) return; const popup = window.open('', '_blank'); popup.document.write(`<table border="1"><thead>${table.tHead.innerHTML}</thead><tbody>${row.outerHTML}</tbody></table>`); popup.document.close(); popup.print(); });
  document.getElementById('export-button')?.addEventListener('click', (event) => { event.preventDefault(); const row = selected(); if (!row) return; const values = Array.from(row.cells, cell => `"${cell.textContent.trim().replaceAll('"', '""')}"`); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([values.join(',')], { type: 'text/csv' })); a.download = 'journal-voucher.csv'; a.click(); URL.revokeObjectURL(a.href); });
  document.getElementById('trash-button')?.addEventListener('click', (event) => { event.preventDefault(); setTrashMode(!trashMode); });
  document.getElementById('reverse-button')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!trashMode) return notify('Open Trash first, then select a voucher to restore.');
    let id; try { id = await selectedId(); } catch (error) { notify(error.message); return; }
    if (!id) return;
    try { const response = await fetch(`/api/vouchers/${id}/restore`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuName: 'Journal Voucher' }) }); const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.message || 'Unable to restore journal voucher.'); notify(data.message); selectedRow = null; refresh(); } catch (error) { notify(error.message); }
  });
});
