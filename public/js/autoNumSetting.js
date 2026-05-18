document.addEventListener("DOMContentLoaded", function () {
const tabs = document.querySelectorAll(".toggle-link");
const contents = document.querySelectorAll(".contents > div"); // Corrected selector

// Deactivate all tabs and hide all content
function deactivateAll() {
tabs.forEach(tab => tab.classList.remove("active"));
contents.forEach(content => content.style.display = "none");
}

// Activate the first tab by default
function activateDefaultTab() {
if (tabs.length > 0 && contents.length > 0) {
 tabs[0].classList.add("active");
 contents[0].style.display = "block";
}
}

// Show content based on tab click
function showContent(tab) {
const target = tab.getAttribute("data-target");
const contentToShow = document.querySelector(`#${target}`);

if (contentToShow) {
 deactivateAll(); // Hide all content and deactivate tabs
 tab.classList.add("active"); // Activate the clicked tab
 contentToShow.style.display = "block"; // Show the targeted content
} else {
 console.error(`No content found for ${target}`);
}
}

// Add click event listeners to tabs
tabs.forEach(tab => {
tab.addEventListener("click", function (event) {
 event.preventDefault();
 showContent(tab); // Show content related to the clicked tab
});
});

deactivateAll(); // Start with all tabs deactivated
activateDefaultTab(); // Activate the default tab
});
