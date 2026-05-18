
// Function to validate Nepali date format (YYYY/MM/DD)
function validateNepaliDate(date) {
  // Regular expression to check if the date is in YYYY/MM/DD format
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;  // Format: YYYY/MM/DD
  return regex.test(date);
}

// Helper function to check if a year is a leap year (for Nepali Calendar)
function isLeapYear(year) {
  // Leap year logic for Nepali year: Leap year if divisible by 4
  return (year % 4 === 0);
}

// Days in each Nepali month (non-leap years)
const bsDaysInMonth = [
  0,  // Index 0 is unused, months are 1-indexed
  30,  // Chaitra
  30,  // Baisakh
  31,  // Jestha
  30,  // Ashad
  31,  // Shrawan
  30,  // Bhadra
  30,  // Ashwin
  30,  // Kartik
  30,  // Mangsir
  29,  // Poush (29 days in leap years)
  29,  // Magh (29 days in leap years)
  30   // Falgun
];

// Adjust days in Poush and Magh for leap years
function getDaysInMonth(month, year) {
  if (month === 11 || month === 12) {  // Poush or Magh
    return isLeapYear(year) ? 30 : 29;
  }
  return bsDaysInMonth[month];
}

// Function to convert Gregorian date to Nepali (Bikram Sambat) date
function gregorianToBS(gregorianDate) {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1; // Months are 0-indexed
  const gDate = gregorianDate.getDate();

  // Use a known Gregorian date that corresponds to BS 2080/07/12
  const bsBaseDate = new Date(2024, 9, 28); // This is Gregorian date for 2081/07/12
  const bsBaseYear = 2081; // Base BS year
  const bsBaseMonth = 7; // Base BS month (October)
  const bsBaseDay = 12; // Base BS day

  // Calculate the difference in milliseconds
  const diffInMillis = gregorianDate - bsBaseDate;
  const daysDifference = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));

  // Calculate BS date
  let bsYear = bsBaseYear;
  let bsMonth = bsBaseMonth;
  let bsDay = bsBaseDay + daysDifference;

  // Adjust BS month and year if necessary
  while (bsDay > getDaysInMonth(bsMonth, bsYear)) {
    bsDay -= getDaysInMonth(bsMonth, bsYear);
    bsMonth++;
    if (bsMonth > 12) {
      bsMonth = 1;
      bsYear++;
    }
  }

  // Adjust for negative days (if going back in time)
  while (bsDay <= 0) {
    bsMonth--;
    if (bsMonth < 1) {
      bsMonth = 12;
      bsYear--;
    }
    bsDay += getDaysInMonth(bsMonth, bsYear);
  }

  return `${bsYear}/${bsMonth.toString().padStart(2, '0')}/${bsDay.toString().padStart(2, '0')}`;
}

// Get current Gregorian date
const now = new Date();
const currentBSDate = gregorianToBS(now);

// Display the current Nepali date on the input field
const dateInput = document.getElementById('voucher-Date');
dateInput.value = currentBSDate;  // Set the current Nepali date

// Helper function to handle backspace behavior and prevent resetting to 00/01/02
function handleBackspace(event) {
  const parts = dateInput.value.split('/');

  // Handle backspace logic for year, month, and day sections
  if (event.key === 'Backspace') {
    // If we're editing month or day and the field is one digit, allow deleting the last digit without resetting
    if (parts[1].length === 1 || parts[2].length === 1) {
      dateInput.value = dateInput.value.slice(0, -1);
    }
  }
}

// Function to maintain the cursor position
function setCursorPosition(pos) {
  dateInput.setSelectionRange(pos, pos);  // Set the cursor position explicitly
}

// Restrict the input to numbers only (and the '/' separator)
dateInput.addEventListener('input', function () {
  const cursorPosition = dateInput.selectionStart;  // Track the current cursor position
  let parts = dateInput.value.split('/');

  // Remove any non-numeric and non-slash characters
  dateInput.value = dateInput.value.replace(/[^0-9\/]/g, '');

  // Prevent more than 4 digits in the year, 2 digits in the month, and 2 digits in the day
  let dateValue = dateInput.value;

  // Split the input value into year, month, and day parts
  parts = dateValue.split('/');

  // If more than 3 parts (year, month, day), reset to just 3 parts
  if (parts.length > 3) {
    dateValue = parts.slice(0, 3).join('/');
  }

  // Year should have a max of 4 digits
  if (parts[0] && parts[0].length > 4) {
    parts[0] = parts[0].slice(0, 4);
  }

  // Month should have a max of 2 digits, and it should be between 01 and 12
  if (parts[1]) {
    let month = parseInt(parts[1], 10);
    if (month > 12) {
      month = 12;  // Cap to 12 if it exceeds
    }
    parts[1] = month.toString().padStart(2, '0');  // Ensure it's 2 digits
  }

  // Day should have a max of 2 digits, and it should be between 01 and 32 (allow 32 as special case)
  if (parts[2]) {
    let day = parseInt(parts[2], 10);
    // Allow days up to 32
    if (day > 32) {
      day = 32;  // Cap to 32 if it exceeds
    }
    // Ensure it's 2 digits
    parts[2] = day.toString().padStart(2, '0');
  }

  // Rebuild the date string
  dateInput.value = parts.join('/');

  // Set the cursor back to the previous position after the input change
  setCursorPosition(cursorPosition);

  // Check if the user input is a valid Nepali date format
  if (validateNepaliDate(dateInput.value)) {
    // If valid, clear error message
    document.getElementById('error-message').textContent = '';
  } else {
    // If invalid, show error message
    document.getElementById('error-message').textContent = 'Enter a valid Date format (YYYY/MM/DD)';
  }
});

// Custom handling for backspace and other key events to prevent resetting part of the date
dateInput.addEventListener('keydown', handleBackspace);

// Ensure that user input for year, month, and day is handled independently
dateInput.addEventListener('click', function (event) {
  const cursorPosition = event.target.selectionStart;
  const parts = dateInput.value.split('/');

  // Determine which part the user clicked on (year, month, or day)
  if (cursorPosition < 5) {
    // Focus on year part
    document.getElementById('error-message').textContent = '';
  } else if (cursorPosition >= 5 && cursorPosition < 8) {
    // Focus on month part
    document.getElementById('error-message').textContent = '';
  } else if (cursorPosition >= 8) {
    // Focus on day part
    document.getElementById('error-message').textContent = '';
  }
});
