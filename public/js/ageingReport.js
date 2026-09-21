document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('myForm7');
  if (!form) return;

  const category = document.getElementById('ageing-report-category');
  const selectAll = document.getElementById('ar-lajita');
  const selector = document.getElementById('ageingAccountTypeSelector');
  const selectorBody = document.querySelector('#ageingAccountTypeTable tbody');
  const selectorSearch = document.getElementById('ageingAccountTypeSearch');
  const selectedText = document.getElementById('doc-class-acc-als-age-rep');
  const viewer = document.getElementById('ageingReportViewer');
  const reportTable = document.getElementById('ageingReportTable');
  let accountTypes = [];
  let selectedGlids = [];

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const amount = value => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderSelector = () => {
    const search = selectorSearch.value.trim().toLowerCase();
    selectorBody.innerHTML = accountTypes
      .filter(item => !search || `${item.GLName} ${item.GLAlias || ''}`.toLowerCase().includes(search))
      .map((item, index) => `<tr>
        <td><input type="checkbox" class="ageing-account-type" value="${item.GLID}" ${selectedGlids.includes(Number(item.GLID)) ? 'checked' : ''}></td>
        <td>${index + 1}</td><td>${escapeHtml(item.GLName)}</td><td>${escapeHtml(item.GLAlias || '')}</td>
      </tr>`).join('');
  };

  const loadAccountTypes = async () => {
    const response = await fetch(`/api/ageing-report/account-types?category=${encodeURIComponent(category.value)}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load account types.');
    accountTypes = data.accountTypes || [];
    selectedGlids = [];
    selectorSearch.value = '';
    renderSelector();
  };

  const showSelector = async () => {
    try {
      await loadAccountTypes();
      selector.style.display = 'block';
    } catch (error) {
      alert(error.message);
    }
  };

  const buildHeaders = (slots, days) => {
    const buckets = Array.from({ length: slots }, (_, index) => {
      const from = index * days + 1;
      return `${from}-${from + days - 1}`;
    });
    buckets.push(`${slots * days + 1} Over`);
    return buckets;
  };

  const showReport = async () => {
    const dateFrom = document.getElementById('ageing-report-date-from').value;
    const dateTo = document.getElementById('ageing-report-date-to').value;
    const asOn = document.getElementById('ageing-report-as-on').value;
    const slots = Number(document.getElementById('ageing-report-slots').value);
    const days = Number(document.getElementById('ageing-report-days').value);
    if (!dateFrom || !dateTo || !asOn || !Number.isInteger(slots) || slots < 1 || !Number.isInteger(days) || days < 1) {
      alert('Enter Date From, Date To, As on, a positive number of slots, and days per slot.');
      return;
    }

    try {
      const response = await fetch('/api/ageing-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFrom, dateTo, asOn, category: category.value, selectedGlids })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load ageing report.');

      const headers = buildHeaders(slots, days);
      reportTable.querySelector('thead').innerHTML = `<tr><th>S.No</th><th>Particular</th><th>Account Type</th><th>Voucher No.</th><th>Date</th><th>Amount</th><th>Day</th>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
      const totals = Array(headers.length).fill(0);
      let totalAmount = 0;
      reportTable.querySelector('tbody').innerHTML = data.rows.map((row, index) => {
        const rowAmount = Number(row.Amount || 0);
        totalAmount += rowAmount;
        const bucket = Array(headers.length).fill(0);
        if (Number(row.Day) >= 1) bucket[Math.min(Math.floor((Number(row.Day) - 1) / days), slots)] = rowAmount;
        bucket.forEach((value, bucketIndex) => { totals[bucketIndex] += value; });
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.Particular)}</td><td>${escapeHtml(row.AccountType)}</td><td>${escapeHtml(row.VoucherNo)}</td><td>${escapeHtml(row.VoucherDate)}</td><td class="amount">${amount(rowAmount)}</td><td>${row.Day}</td>${bucket.map(value => `<td class="amount">${value ? amount(value) : ''}</td>`).join('')}</tr>`;
      }).join('') || `<tr><td colspan="${7 + headers.length}">No matching transactions found.</td></tr>`;
      reportTable.querySelector('tfoot').innerHTML = `<tr><th colspan="5">Total</th><th class="amount">${amount(totalAmount)}</th><th></th>${totals.map(value => `<th class="amount">${amount(value)}</th>`).join('')}</tr>`;
      document.getElementById('ageingReportAsOn').textContent = `As on ${asOn}`;
      viewer.style.display = 'block';
    } catch (error) {
      alert(error.message);
    }
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (selectAll.checked) {
      selectedGlids = [];
      selectedText.value = 'All account types';
      showReport();
    } else {
      showSelector();
    }
  });

  category.addEventListener('change', () => { selectedGlids = []; selectedText.value = ''; });
  selectorSearch.addEventListener('input', renderSelector);
  selectorBody.addEventListener('change', event => {
    if (!event.target.matches('.ageing-account-type')) return;
    const glid = Number(event.target.value);
    selectedGlids = event.target.checked ? [...new Set([...selectedGlids, glid])] : selectedGlids.filter(value => value !== glid);
  });
  document.getElementById('selectAllAgeingAccountTypes').addEventListener('click', () => {
    selectedGlids = accountTypes.map(item => Number(item.GLID)); renderSelector();
  });
  document.getElementById('clearAgeingAccountTypes').addEventListener('click', () => { selectedGlids = []; renderSelector(); });
  document.getElementById('confirmAgeingAccountTypes').addEventListener('click', () => {
    if (!selectedGlids.length) return alert('Select at least one account type.');
    const names = accountTypes.filter(item => selectedGlids.includes(Number(item.GLID))).map(item => item.GLName);
    selectedText.value = names.join(', ');
    selector.style.display = 'none';
    showReport();
  });
  ['closeAgeingAccountTypeSelector', 'cancelAgeingAccountTypes'].forEach(id => document.getElementById(id).addEventListener('click', () => { selector.style.display = 'none'; }));
  document.getElementById('closeAgeingReportViewer').addEventListener('click', () => { viewer.style.display = 'none'; });
});
