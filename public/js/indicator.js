const capsIndicator = document.getElementById('capsIndicator');
const numLockIndicator = document.getElementById('numLockIndicator');
const insertIndicator = document.getElementById('insertIndicator');
const scrollLockIndicator = document.getElementById('scrollLockIndicator');

// Retrieve states from localStorage or set default values
let capsActive = JSON.parse(localStorage.getItem('capsActive')) || false;
let numLockActive = JSON.parse(localStorage.getItem('numLockActive')) || false;
let insertActive = JSON.parse(localStorage.getItem('insertActive')) || false;
let scrollLockActive = JSON.parse(localStorage.getItem('scrollLockActive')) || false;

// Function to update the indicator classes based on state
function updateIndicators() {
    capsIndicator.classList.toggle('on', capsActive);
    numLockIndicator.classList.toggle('on', numLockActive);
    insertIndicator.classList.toggle('on', insertActive);
    scrollLockIndicator.classList.toggle('on', scrollLockActive);
}

// Initialize indicators on page load
updateIndicators();

// Function to check keyboard lock status
function checkLockStates(event) {
    // Caps Lock
    if (event.getModifierState('CapsLock')) {
        capsActive = true;
    } else {
        capsActive = false;
    }

    // Num Lock
    if (event.getModifierState('NumLock')) {
        numLockActive = true;
    } else {
        numLockActive = false;
    }

    // Insert Key Handling
    if (event.key === "Insert") {
        insertActive = !insertActive; // Toggle the insert state
    }

    // Scroll Lock
    if (event.getModifierState('ScrollLock')) {
        scrollLockActive = true;
    } else {
        scrollLockActive = false;
    }

    // Update indicators and localStorage
    updateIndicators();
    localStorage.setItem('capsActive', capsActive);
    localStorage.setItem('numLockActive', numLockActive);
    localStorage.setItem('insertActive', insertActive);
    localStorage.setItem('scrollLockActive', scrollLockActive);
}

// Add event listener to the whole document to capture key events
document.addEventListener('keydown', checkLockStates);

//For current date(B.S)
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
    const bsDaysInMonth = [0, 30, 30, 31, 30, 31, 30, 30, 30, 30, 29, 29]; // Days in each BS month

    // Loop to adjust for month and day overflow
    while (bsDay > bsDaysInMonth[bsMonth]) {
        bsDay -= bsDaysInMonth[bsMonth];
        bsMonth++;
        if (bsMonth > 12) {
            bsMonth = 1;
            bsYear++;
        }
    }

    // Adjust for negative days
    while (bsDay <= 0) {
        bsMonth--;
        if (bsMonth < 1) {
            bsMonth = 12;
            bsYear--;
        }
        bsDay += bsDaysInMonth[bsMonth];
    }

    return `${bsYear}/${bsMonth.toString().padStart(2, '0')}/${bsDay.toString().padStart(2, '0')}`;
}

// Get current Gregorian date
const now = new Date();
const currentBSDate = gregorianToBS(now);



//For current time
function updateTime() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('currentTime').textContent = now.toLocaleTimeString([], options);
}

setInterval(updateTime, 1000); // Update the time every second
updateTime(); // Initial call to display the time immediately

document.addEventListener('DOMContentLoaded', () => {
    refreshDateIndicators();
});

async function refreshFiscalDateIndicators() {
    const response = await fetch('/api/indicator-fiscal-dates');
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Unable to refresh fiscal-year dates.');

    document.getElementById('startDateInput').textContent = `Fiscal Start Date: ${data.startDate}`;
    document.getElementById('endDateInput').textContent = `Fiscal End Date: ${data.endDate}`;
    const fiscalStart = document.getElementById('setfiscalstartyear');
    const fiscalEnd = document.getElementById('setfiscalendyear');
    if (fiscalStart) fiscalStart.textContent = `Fiscal Year : ${data.startDate}`;
    if (fiscalEnd) fiscalEnd.textContent = `To : ${data.endDate}`;
}

async function refreshDateIndicators() {
    const nowAD = new Date().toISOString().split("T")[0];
    const results = await Promise.allSettled([fetchCurrentBSDate(nowAD), refreshFiscalDateIndicators()]);
    results.filter(result => result.status === 'rejected').forEach(result => console.error(result.reason));
}

window.refreshDateIndicators = refreshDateIndicators;

async function fetchCurrentBSDate(nowAD) {
    if (!nowAD) {
        alert("It seems date is not available at the moment.");
        return;
    }
    console.log("AD date sent:", nowAD);
    try {
        const res = await fetch('/api/selectbsdateusingAddate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nowAD })
        });

        if (!res.ok) throw new Error('Failed to fetch BS date value');
        const data = await res.json();
        console.log("Received date is", data);

       if (data.dateType === 'AD' && data.adDate) {
  document.getElementById('current-bs-date').innerText = `Date: ${data.adDate}`;
  return;
}

       if (data.bsDate) {
  let [day, month, year] = data.bsDate.split("/");
  let formatted = `${year}/${month}/${day}`;
    // Format as YYYY-MM-DD (dashes, not slashes)
  let formattedForInput = `${year}-${month}-${day}`;
    document.getElementById('current-bs-date').innerText = `Date: ${formatted}`;

   // ✅ update all inputs with class .bs-date-field
  document.querySelectorAll(".currentlocaldate").forEach(el => {
    el.value = formattedForInput;
  });
}
    } catch (err) {
        console.error(err);
        alert("Something went wrong while fetching date value.");
    }
}
