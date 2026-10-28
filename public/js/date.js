(function () {
  'use strict';

  // 1. Init all pickers by id (nepali-date, nepali-date1 ... nepali-date6)
  const pickerIds = ['nepali-date', ...Array.from({ length: 6 }, (_, i) => `nepali-date${i + 1}`)];

  $(function () {
    $(pickerIds.map((id) => `#${id}`).join(', ')).nepaliDatePicker({
      ndpYear: true,
      ndpMonth: true,
      ndpYearCount: 10
    });
  });

  // 2. Current BS date from the library (accurate calendar data)
  const pad = (n) => String(n).padStart(2, '0');

  function getCurrentBsDate() {
    const d = NepaliFunctions.GetCurrentBsDate(); // {year, month, day}
    return `${d.year}/${pad(d.month)}/${pad(d.day)}`;
  }

  // 3. Validation: YYYY/MM/DD, month 1-12, day 1-32
  function validateNepaliDate(value) {
    const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value);
    if (!m) return false;
    const month = +m[2], day = +m[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= 32;
  }

  // 4. Auto-format typed digits into YYYY/MM/DD
  function formatDigits(raw) {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0, 4)}/${d.slice(4)}`;
    return `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6)}`;
  }

  const dateInput = document.getElementById('dateInput');
  const errorEl = document.getElementById('error-message');
  if (!dateInput || !errorEl) return;

  dateInput.value = getCurrentBsDate();

  dateInput.addEventListener('input', () => {
    dateInput.value = formatDigits(dateInput.value);
    // Show error only once the full date is typed
    errorEl.textContent =
      dateInput.value.length === 10 && !validateNepaliDate(dateInput.value)
        ? 'Enter a valid date (YYYY/MM/DD)'
        : '';
  });

  dateInput.addEventListener('blur', () => {
    errorEl.textContent =
      dateInput.value && !validateNepaliDate(dateInput.value)
        ? 'Enter a valid date (YYYY/MM/DD)'
        : '';
  });
})();