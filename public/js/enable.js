// check box enable for email address
const textInput = document.getElementById('email');
const checkbox = document.getElementById('emailcheckbox');
textInput.addEventListener('input', () => {
  checkbox.disabled = textInput.value.trim() === '';
});

// check box enable for mobile
const textInput1 = document.getElementById('account-mobile');
const checkbox1 = document.getElementById('mobilecheckbox');
textInput1.addEventListener('input', () => {
  checkbox1.disabled = textInput1.value.trim() === '';
});



// enable input field for tax rate
const checkbox3 = document.getElementById('taxCheckbox');
const textInput3 = document.getElementById('taxRate');
checkbox3.addEventListener('change', () => {
  
  textInput3.disabled = !checkbox3.checked;
});

// enable input field for interest rate
const checkbox4 = document.getElementById('interestCheckbox');
const textInput4 = document.getElementById('interestRate');
checkbox4.addEventListener('change', () => {

  textInput4.disabled = !checkbox4.checked;
});

// enable input field for interest rate
const checkbox5 = document.getElementById('closeCheckbox');
const textInput5 = document.getElementById('closedDate');

// Add an event listener to the checkbox
checkbox5.addEventListener('change', () => {
  // Enable the input if the checkbox is checked, otherwise disable it
  textInput5.disabled = !checkbox5.checked;
});

