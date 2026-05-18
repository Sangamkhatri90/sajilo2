
let mode10 = '';

const yearInput = document.getElementById('define-nepali-date');
const adInput = document.getElementById('define-english-date');
const monthIds = ['baisakh','jestha','ashadh','shrawan','bhadra','ashwin','kartik','mangsir','poush','magh','falgun','chaitra'];
const monthInputs = monthIds.map(id => document.getElementById(id));

// When user clicks or focuses English date input, try to auto-fill
yearInput.addEventListener('blur', async () => {
  const bsYear = yearInput.value.trim();
  if (!bsYear) return;

  const bsDate = `01/01/${bsYear}`;

  try {
    if (mode10=== 'new') {
      // Check if bsDate already exists
      const checkRes = await fetch(`/api/check-nepali-year/${encodeURIComponent(bsDate)}`);
      if (!checkRes.ok) {
        showCustomAlert('Error checking the date.');
        return;
      }
      const checkData = await checkRes.json();
      if (checkData.exists) {
        showCustomAlert('This Nepali year already exists!');
        yearInput.value = '';
        yearInput.focus();
        return;
      }

      // ✅ Fetch last AD date of previous BS year
      const lastDateRes = await fetch(`/api/get-last-ad-date/${bsYear}`);
      if (lastDateRes.ok) {
        const lastDateData = await lastDateRes.json();
        const lastDate = new Date(lastDateData.lastDate);
        lastDate.setDate(lastDate.getDate() + 1);
        const nextDateISO = lastDate.toISOString().slice(0, 10);
        adInput.value = nextDateISO;
      } else {
        // If no previous year found, leave AD date blank or set to today
        adInput.value = '';
      }

      // Stop here for 'new'
      return;
    }

    // For edit and delete, fetch existing date info
    if (mode10 === 'edit' || mode10 === 'delete') {
      const res = await fetch(`/api/get-nepali-date-info/${encodeURIComponent(bsDate)}`);
      if (!res.ok) {
        showCustomAlert('No data found for that year');
        return;
      }
      const data = await res.json();

      const adDateISO = new Date(data.adDate).toISOString().slice(0, 10);
      adInput.value = adDateISO;

      data.monthDayCounts.forEach((count, i) => {
        monthInputs[i].value = count;
      });
    }

  } catch (err) {
    console.error('Error:', err);
    showCustomAlert('Error loading date info');
  }
});



function enableAll() {
  yearInput.disabled = false;
  adInput.disabled = false;
  monthInputs.forEach(i => i.disabled = false);
}

function disableAll() {
  yearInput.disabled = true;
  adInput.disabled = true;
  monthInputs.forEach(i => i.disabled = true);
}

function clearForm() {
  yearInput.value = '';
  adInput.value = '';
  monthInputs.forEach(i => i.value = '');
}

document.getElementById('define-new-button').addEventListener('click', () => {
  mode10 = 'new';
  clearForm();
  enableAll();
});

document.getElementById('define-edit-button').addEventListener('click', () => {
  mode10 = 'edit';
  clearForm();
  enableAll();
  adInput.disabled = false;
});

document.getElementById('define-delete-button').addEventListener('click', () => {
  mode10 = 'delete';
  clearForm();
  yearInput.disabled = false;
  adInput.disabled = false;
  monthInputs.forEach(i => i.disabled = true);
});

document.getElementById('define-copy-button').addEventListener('click', () => {
  mode10 = 'copy';
  clearForm();
  yearInput.disabled = false;
  adInput.disabled = true;
  monthInputs.forEach(i => i.disabled = true);
});

document.getElementById('define-nepali-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bsYear = yearInput.value;
  const adDate = adInput.value;
  const monthDays = monthInputs.map(i => parseInt(i.value || '0'));

  try {
    if (mode10 === 'delete') {
      const res = await fetch('/api/delete-nepali-calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bsYear })
      });
      const data = await res.json();
      showCustomAlert(data.message || (res.ok ? 'Deleted successfully.' : 'Delete failed.'));
    }

    else if (mode10 === 'new' || mode10 === 'edit') {
      const mapping = buildCalendarMapping(bsYear, adDate, monthDays);
      const method = mode10 === 'new' ? 'POST' : 'PUT';
      const url = mode10 === 'new' ? '/api/save-nepali-calendar' : '/api/edit-nepali-calendar';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bsYear, mapping })
      });
      const data = await res.json();
      showCustomAlert(data.message || (res.ok ? 'Operation succeeded.' : 'Operation failed.'));
    }

    else if (mode10 === 'copy') {
      const response = await fetch(`/api/get-nepali-calendar/${bsYear}`);
      const data = await response.json();
      if (!data.mapping || !data.mapping.length) {
        showCustomAlert('No data found to copy.');
        return;
      }
      enableAll();
      adInput.value = '';
      monthInputs.forEach((input, i) => input.value = 30);
      showCustomAlert('Now enter NEW Year and AD Start date, then press Ok to save as new.');
      mode10 = 'new';
    }

    clearForm();
    disableAll();
    mode10 = '';
  } catch (err) {
    console.error(err);
    showCustomAlert('Error occurred. Please try again.');
  }
});



function buildCalendarMapping(bsYear, adStart, monthValues) {
  let mapping = [];
  let currentDate = new Date(adStart);

  for (let m = 0; m < 12; m++) {
    const days = monthValues[m];
    for (let d = 1; d <= days; d++) {
      const bsDate = `${d.toString().padStart(2, '0')}/${(m + 1).toString().padStart(2, '0')}/${bsYear}`;
      const adDate = currentDate.toISOString().slice(0, 10);
      mapping.push({ bsDate, adDate });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return mapping;
}

