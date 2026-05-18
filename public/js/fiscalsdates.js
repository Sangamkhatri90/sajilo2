document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the date from localStorage or use a default if not found
    const startDateLocal = localStorage.getItem('selectedStartDateLocal') || 'No date found';
    const endDateLocal = localStorage.getItem('selectedEndDateLocal') || 'No date found';

    // Function to convert YYYY-MM-DD to YYYY/MM/DD format
    function convertDateFormat(date) {
        const parts = date.split('-'); // Split the date into [YYYY, MM, DD]
        return `${parts[0]}/${parts[1]}/${parts[2]}`;  // Return as YYYY/MM/DD
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
