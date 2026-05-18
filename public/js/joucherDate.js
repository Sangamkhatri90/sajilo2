// Function to convert Gregorian date to Nepali (Bikram Sambat) date
function gregorianToBS(gregorianDate) {
    const gYear = gregorianDate.getFullYear();
    const gMonth = gregorianDate.getMonth() + 1; // Months are 0-indexed
    const gDate = gregorianDate.getDate();

    const bsBaseDate = new Date(2024, 9, 28); // Known Gregorian date corresponding to BS 2081/07/12
    const bsBaseYear = 2081;
    const bsBaseMonth = 7;
    const bsBaseDay = 12;

    const diffInMillis = gregorianDate - bsBaseDate;
    const daysDifference = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));

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

    // Return as YYYY/MM/DD format
    return `${bsYear}/${bsMonth.toString().padStart(2, '0')}/${bsDay.toString().padStart(2, '0')}`;
}

// Helper function to get the number of days in a Nepali month
function getDaysInMonth(month, year) {
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

    if (month === 11 || month === 12) {  // Poush or Magh
        return isLeapYear(year) ? 30 : 29;
    }
    return bsDaysInMonth[month];
}

// Helper function to check if a year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0);
}

// Function to display Nepali date in the specified input field
function displayNepaliDate(inputId) {
    const now = new Date();  // Get current Gregorian date
    const currentBSDate = gregorianToBS(now);  // Convert to Nepali date

    // Set the value of the specified input field
    const dateInput = document.getElementById(inputId);
    if (dateInput) {
        dateInput.value = currentBSDate;
    }
}

// Call the function to display the current Nepali date in the 'voucher-Date' input field
displayNepaliDate('voucher-Date');
