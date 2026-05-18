const capsIndicator1 = document.getElementById('capsIndicator');
const numLockIndicator1 = document.getElementById('numLockIndicator');
const insertIndicator1 = document.getElementById('insertIndicator');
const scrollLockIndicator1 = document.getElementById('scrollLockIndicator');

// Retrieve states from localStorage or set default values
let capsActive1 = JSON.parse(localStorage.getItem('capsActive')) || false;
let numLockActive1 = JSON.parse(localStorage.getItem('numLockActive')) || false;
let insertActive1 = JSON.parse(localStorage.getItem('insertActive')) || false;
let scrollLockActive1 = JSON.parse(localStorage.getItem('scrollLockActive')) || false;

// Function to update the indicator classes based on state
function updateIndicators1() {
    capsIndicator1.classList.toggle('on', capsActive1);
    numLockIndicator1.classList.toggle('on', numLockActive1);
    insertIndicator1.classList.toggle('on', insertActive1);
    scrollLockIndicator1.classList.toggle('on', scrollLockActive1);
}

// Initialize indicators on page load
updateIndicators1();

// Function to check keyboard lock status
function checkLockStates1(event) {
    // Caps Lock
    if (event.getModifierState('CapsLock')) {
        capsActive1 = true;
    } else {
        capsActive1 = false;
    }

    // Num Lock
    if (event.getModifierState('NumLock')) {
        numLockActive1 = true;
    } else {
        numLockActive1 = false;
    }

    // Insert Key Handling
    if (event.key === "Insert") {
        insertActive1 = !insertActive1; // Toggle the insert state
    }

    // Scroll Lock
    if (event.getModifierState('ScrollLock')) {
        scrollLockActive1 = true;
    } else {
        scrollLockActive1 = false;
    }

    // Update indicators and localStorage
    updateIndicators1();
    localStorage.setItem('capsActive', capsActive1);
    localStorage.setItem('numLockActive', numLockActive1);
    localStorage.setItem('insertActive', insertActive1);
    localStorage.setItem('scrollLockActive', scrollLockActive1);
}

// Add event listener to the whole document to capture key events
document.addEventListener('keydown', checkLockStates1);

//For current date(B.S)
function gregorianToBS1(gregorianDate1) {
    const gYear1 = gregorianDate1.getFullYear();
    const gMonth1 = gregorianDate1.getMonth() + 1; // Months are 0-indexed
    const gDate1 = gregorianDate1.getDate();

    // Use a known Gregorian date that corresponds to BS 2080/07/12
    const bsBaseDate1 = new Date(2025, 9, 28); // This is Gregorian date for 2081/07/12
    const bsBaseYear1 = 2082; // Base BS year
    const bsBaseMonth1 = 7; // Base BS month (October)
    const bsBaseDay1 = 12; // Base BS day

    // Calculate the difference in milliseconds
    const diffInMillis1 = gregorianDate1 - bsBaseDate1;
    const daysDifference1 = Math.floor(diffInMillis1 / (1000 * 60 * 60 * 24));

    // Calculate BS date
    let bsYear1 = bsBaseYear1;
    let bsMonth1 = bsBaseMonth1;
    let bsDay1 = bsBaseDay1 + daysDifference1;

    // Adjust BS month and year if necessary
    const bsDaysInMonth1 = [0, 30, 30, 31, 30, 31, 30, 30, 30, 30, 29, 29]; // Days in each BS month

    // Loop to adjust for month and day overflow
    while (bsDay1 > bsDaysInMonth1[bsMonth1]) {
        bsDay1 -= bsDaysInMonth1[bsMonth1];
        bsMonth1++;
        if (bsMonth1 > 12) {
            bsMonth1 = 1;
            bsYear1++;
        }
    }

    // Adjust for negative days
    while (bsDay1 <= 0) {
        bsMonth1--;
        if (bsMonth1 < 1) {
            bsMonth1 = 12;
            bsYear1--;
        }
        bsDay1 += bsDaysInMonth1[bsMonth1];
    }

    return `${bsYear1}/${bsMonth1.toString().padStart(2, '0')}/${bsDay1.toString().padStart(2, '0')}`;
}

// Get current Gregorian date
const now1 = new Date();
const currentBSDate1 = gregorianToBS1(now1);



//For current time
function updateTime1() {
    const now1 = new Date();
    const options1 = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('currentTime').textContent = now1.toLocaleTimeString([], options1);
}

setInterval(updateTime1, 1000); // Update the time every second
updateTime1(); // Initial call to display the time immediately
