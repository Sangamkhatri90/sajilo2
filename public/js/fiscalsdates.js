document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the date from localStorage.
    const startDateLocal = localStorage.getItem('selectedStartDateLocal');
    const endDateLocal = localStorage.getItem('selectedEndDateLocal');

    // input[type="date"] only accepts YYYY-MM-DD values.
    function convertDateFormat(date) {
        if (!date) return '';

        const value = date.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

        let match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
        if (match) {
            const [, year, month, day] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (match) {
            const [, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return '';
    }

    // Update all elements with the class "start-date-local"
    document.querySelectorAll('.start-date-local').forEach(element => {
        if (element.tagName === 'INPUT') {
            element.value = convertDateFormat(startDateLocal);  // Set the formatted value in the input field
        } else {
            element.innerText = convertDateFormat(startDateLocal);  // Set the formatted inner text for non-input elements
        }
    });

    // Update all elements with the class "end-date-local"
    document.querySelectorAll('.end-date-local').forEach(element => {
        if (element.tagName === 'INPUT') {
            element.value = convertDateFormat(endDateLocal);  // Set the formatted value in the input field
        } else {
            element.innerText = convertDateFormat(endDateLocal);  // Set the formatted inner text for non-input elements
        }
    });
});
