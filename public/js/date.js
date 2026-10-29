(function () {
  'use strict';

  const pickerIds = ['nepali-date', ...Array.from({ length: 6 }, (_, i) => `nepali-date${i + 1}`)];

  const pad = (n) => String(n).padStart(2, '0');

  function validateNepaliDate(value) {
    const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value);
    if (!m) return false;
    const month = +m[2], day = +m[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= 32;
  }

  function formatDigits(raw) {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 4) return d;
    if (d.length <= 6) return `${d.slice(0, 4)}/${d.slice(4)}`;
    return `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6)}`;
  }

  function init() {
    // 1. Init pickers (v5 API: called on the element, no jQuery)
    pickerIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && typeof el.NepaliDatePicker === 'function') {
        el.NepaliDatePicker();
      } else if (el) {
        console.error('Nepali datepicker v5 not loaded for #' + id);
      }
    });

    // 2. Manual date input with validation
    const dateInput = document.getElementById('dateInput');
    const errorEl = document.getElementById('error-message');
    if (!dateInput || !errorEl) return;

    // Only set today's date if the library provides it
    if (typeof NepaliFunctions !== 'undefined' && NepaliFunctions.GetCurrentBsDate) {
      const d = NepaliFunctions.GetCurrentBsDate();
      dateInput.value = `${d.year}/${pad(d.month)}/${pad(d.day)}`;
    }

    dateInput.addEventListener('input', () => {
      dateInput.value = formatDigits(dateInput.value);
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
  }

  window.addEventListener('load', init);
})();