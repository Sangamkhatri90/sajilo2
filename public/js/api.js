const originalFetch = window.fetch;

// Fallback login page URL
const LOGIN_PAGE_URL = "/index.html";

// List of frontend scripts to exclude
const excludedFiles = [
  "js/orgData.js",
  "/js/loader.js",
  "/js/setupdb.js",
  "/setup.js"
];

// Flag to skip session handling for excluded scripts
let skipSessionForCurrentScript = false;

// Automatically detect if this script is running in an excluded file
(function detectExcludedScript() {
    try {
        const stack = new Error().stack || "";
        skipSessionForCurrentScript = excludedFiles.some(file => stack.includes(file));
    } catch (e) {
        console.warn("Failed to detect script exclusion:", e);
    }
})();

// Flag to prevent multiple session expired modals
let sessionExpiredActive = false;

// Show session expired modal
function showSessionExpiredUI() {
    if (sessionExpiredActive) return;
    sessionExpiredActive = true;

    console.warn("Session expired. Prompting for database selection...");
    alert("Session expired. Please select a database to continue.");

    // Mark in sessionStorage for reload detection
    sessionStorage.setItem("sessionExpired", "true");

    const orgDiv = document.getElementById('movableDiv81');
    const cancelBtn = document.getElementById('cancelButton81');
    const closeBtn = document.getElementById('closeButton81');

    if (orgDiv) {
        orgDiv.style.zIndex = 9999;
        orgDiv.style.position = 'fixed';
        orgDiv.style.top = '10%';
        orgDiv.style.left = '50%';
        orgDiv.style.transform = 'translateX(-50%)';
        orgDiv.style.display = 'block';
        orgDiv.setAttribute("data-session-expired", "true");

        if (cancelBtn) cancelBtn.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
    } else {
        console.error("movableDiv81 not found in DOM, redirecting to login.");
        setTimeout(() => window.location.href = LOGIN_PAGE_URL, 1000);
    }

    // Optional: clear page content to avoid raw JSON rendering
    if (document.readyState === "loading") {
        document.body.innerHTML = "";
    }
}

// Reset session expired modal
function resetSessionExpired() {
    sessionExpiredActive = false;
    sessionStorage.removeItem("sessionExpired");

    const orgDiv = document.getElementById('movableDiv81');
    const cancelBtn = document.getElementById('cancelButton81');
    const closeBtn = document.getElementById('closeButton81');

    if (orgDiv) {
        orgDiv.style.display = 'none';
        orgDiv.removeAttribute("data-session-expired");
    }

    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (closeBtn) closeBtn.style.display = 'inline-block';
}

window.resetSessionExpired = resetSessionExpired;

// Fetch override
window.fetch = async function(url, options = {}) {
    try {
        const response = await originalFetch(url, options);

        // Skip session handling if flagged
        const isExcluded = options.skipSessionCheck || skipSessionForCurrentScript;
        if (isExcluded) return response;

        // Handle session expired codes
        if ([440, 401, 419].includes(response.status)) {
            console.warn("Session expired detected in fetch.");
            showSessionExpiredUI();
            return Promise.reject(new Error("Session expired"));
        }

        return response;
    } catch (err) {
        console.error("Global fetch error:", err);
        throw err;
    }
};
