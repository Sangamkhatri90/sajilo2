function setFiscalYearEnd() {
    // Get the start date of the fiscal year from the input field
    const startDateInput = document.getElementById('fiscalYearStart');
    const endDateInput = document.getElementById('fiscalYearEnd');
    
    if (startDateInput.value) {
        // Convert the start date value to a Date object
        const startDate = new Date(startDateInput.value);
        
        // Set the end date by adding 1 year and subtracting 1 day from the start date
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1);

        // Format the end date as YYYY-MM-DD for the date input field
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Set the calculated end date in the end date input field
        endDateInput.value = formattedEndDate;
    } else {
        showCustomAlert('Please enter a start date for the fiscal year.');
    }
}

function setFiscalYear() {
    // Get the start date of the fiscal year from the input field
    const fystartDate = document.getElementById('fiscalStartDate');
    const fyendDate = document.getElementById('fiscalEndDate');
    
    if (fystartDate.value) {
        // Convert the start date value to a Date object
        const startDate = new Date(fystartDate.value);
        
        // Set the end date by adding 1 year and subtracting 1 day from the start date
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1);

        // Format the end date as YYYY-MM-DD for the date input field
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Set the calculated end date in the end date input field
        fyendDate.value = formattedEndDate;
    } else {
        showCustomAlert('Please enter a start date for the fiscal year.');
    }
}


// Disable all inputs on page load to ensure they are initially not editable, except for buttons
window.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('#myForm47 input, #myForm47 select, #myForm47 textarea');
    inputs.forEach(input => {
        // Disable fields that aren't buttons
        if (input.type !== 'button' && input.type !== 'submit') {
            input.setAttribute('readonly', true); // Make fields readonly
            input.disabled = true; // Disable fields that don't support readonly
        }
    });
});
// Function to enable all input fields when the "New" button is clicked
document.getElementById('org-new-button').addEventListener('click', function () {
    const inputs = document.querySelectorAll('#myForm47 input, #myForm47 select, #myForm47 textarea');
    
    inputs.forEach(input => {
        const type = input.type;
        if (type !== 'button' && type !== 'submit' && type !== 'reset') {
            input.removeAttribute('readonly');
            input.disabled = false;
        }
    });

    // Disable specific buttons
    const buttonsToDisable = ['org-edit-button', 'org-delete-button', ];
    buttonsToDisable.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = true;
        }
    });
     const nameInput = document.getElementById('orgm-name');
    if (nameInput) {
        nameInput.focus();
    }
});


// Function to enable all input fields when the "Edit" button is clicked
document.getElementById('org-edit-button').addEventListener('click', function () {
    const inputs = document.querySelectorAll('#myForm47 input, #myForm47 select, #myForm47 textarea');
    inputs.forEach(input => {
        // Enable all fields except buttons
        if (input.type !== 'button' && input.type !== 'submit') {
            input.removeAttribute('readonly'); // Remove readonly attribute if present
            input.disabled = false; // Enable all fields
        }
    });
     // Disable specific buttons
    const buttonsToDisable = ['org-new-button', 'org-delete-button', ];
    buttonsToDisable.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = true;
        }
    });
      const nameInput = document.getElementById('orgm-name');
    if (nameInput) {
        nameInput.focus();
    }
});

document.getElementById('org-delete-button').addEventListener('click', function () {
    
     // Disable specific buttons
    const buttonsToDisable = ['org-new-button', 'org-edit-button', 'org-save-button' ];
    buttonsToDisable.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = true;
        }
    });
    
});


document.getElementById('org-cancel-button').addEventListener('click', function () {
    const inputs = document.querySelectorAll('#myForm47 input, #myForm47 select, #myForm47 textarea');
    inputs.forEach(input => {
        // Enable all fields except buttons
        if (input.type !== 'button' && input.type !== 'submit') {
            input.removeAttribute('readonly'); // Remove readonly attribute if present
            input.disabled = true; // Enable all fields
        }
    });
     // Enable the  buttons
    const buttonsToEnable = ['org-new-button', 'org-edit-button', 'org-delete-button','org-save-button', ];
    buttonsToEnable.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = false;
        }
    });
    
});



