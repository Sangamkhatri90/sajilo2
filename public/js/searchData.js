document.getElementById('dcm-searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page reload

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);


    fetch("/search-doc-class?search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#resultsTable tbody');
            const errorMessage = document.getElementById('error');
            tbody.innerHTML = ''; // Clear any previous results
            errorMessage.innerHTML = ''; // Clear any previous errors

            if (data.error) {
                errorMessage.innerHTML = data.error;
                return;
            }


            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
            } else {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.DocClassName}</td>
                        <td>${item.DocClassAlias}</td>
                        <td>${item.Address1}</td>
                        <td>${item.Address2}</td>
                        <td>${item.Phone1}</td>
                        <td>${item.Phone2}</td>
                        <td>${item.Fax}</td>
                        <td>${item.Email}</td>
                        <td>${item.Pan}</td>
                        <td>${item.IncomeTaxNo}</td>
                    `;
                    tbody.appendChild(row);
                });



                // Variable to hold the currently selected row index
                let selectedRowIndex = 0; // Start with the first row selected

                // Function to highlight the selected row
                function highlightRow(index) {
                    const rows = document.querySelectorAll('#resultsTable tbody tr');
                    rows.forEach((row, i) => {
                        row.classList.toggle('highlighted', i === index);
                    });
                }

                // Highlight the first row by default
                highlightRow(selectedRowIndex);

                // Event listener for arrow key navigation
                document.addEventListener('keydown', function (event) {

                    const rows = document.querySelectorAll('#resultsTable tbody tr');
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        selectedRowIndex = (selectedRowIndex + 1) % rows.length; // Loop back to the top
                        highlightRow(selectedRowIndex);
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        selectedRowIndex = (selectedRowIndex - 1 + rows.length) % rows.length; // Loop back to the bottom
                        highlightRow(selectedRowIndex);
                    }
                });


            }

        })



});

document.getElementById('myForm63').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = document.getElementById('myForm63');
    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/save-signatures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        showCustomAlert(result.message);

    } catch (error) {
        console.error(error);
        showCustomAlert("Error submitting form");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem('selectedusername');

    console.log("VSun:", username);

    if (username && username.trim() !== "") {
        fetch(`/get-signatures/${encodeURIComponent(username)}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("Fetched signature data:", data);

                // Explicit mapping from backend keys → frontend input IDs
                const fieldMap = {
                    FullName: 'vouchersign-username',
                    Designation: 'vouchersign-checkedBy',
                };

                // Loop through each key in data and fill the mapped input
                Object.keys(fieldMap).forEach(key => {
                    const inputId = fieldMap[key];
                    const input = document.getElementById(inputId);

                    if (input) {
                        input.value = data[key] ?? '';
                    } else {
                        console.warn(`Input field with ID '${inputId}' not found.`);
                    }
                });
            })
            .catch(err => console.error("Error loading data:", err));
    } else {
        console.warn("No username found in localStorage.");
    }
});




// The existing form submission code
document.getElementById('lm-searchForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const formData = new FormData(event.target);
    const searchParams = {};
    formData.forEach((value, key) => {
        searchParams[key] = value.trim(); // Trim values to remove unnecessary spaces
    });

    fetch('/search-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('.lm-table-container table tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="12">No records found</td></tr>';
                return;
            }

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.GLName || ''}</td>
                <td>${row.GlAlias || ''}</td>
                <td>${row.AltAlias || ''}</td>
                <td>${row.LedgerGroupName || ''}</td>
                <td>${row.Balance || ''}</td>
                <td>${row.LedgerSubGroupName || ''}</td>
                <td>${row.Address1 || ''}</td>
                <td>${row.Address2 || ''}</td>
                <td>${row.Phone1 || ''}</td>
                <td>${row.Phone2 || ''}</td>
                <td>${row.Fax || ''}</td>
                <td>${row.Email || ''}</td>
                <td>${row.Pan || ''}</td>
                <td>${row.MaturityDate ? new Date(row.MaturityDate).toISOString().split('T')[0] : ''}</td>
            `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));

});



document.getElementById('slm-searchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const searchParams = new URLSearchParams(formData);

    fetch('/search-sub-ledger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: searchParams.toString(),
    })
        .then((response) => response.json())
        .then((data) => {
            const tbody = document.querySelector('.slm-table-container tbody');
            tbody.innerHTML = ''; // Clear existing rows

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="15">No results found.</td></tr>';
                return;
            }

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.SubLedgerName || ''}</td>
                    <td>${row.SlAlias || ''}</td>
                    <td>${row.AltAlias || ''}</td>
                    <td>${row.LedgerName || ''}</td>
                    <td>${row.Balance || 0}</td>
                    <td>${row.SubGroup || ''}</td>
                    <td>${row.Address1 || ''}</td>
                    <td>${row.Address2 || ''}</td>
                    <td>${row.Phone1 || ''}</td>
                    <td>${row.Phone2 || ''}</td>
                    <td>${row.Fax || ''}</td>
                    <td>${row.Email || ''}</td>
                    <td>${row.Pan || ''}</td>
                    <td>${row.CreatedBy || ''}</td>
                    <td>${row.CreatedDateTime || ''}</td>
                    <td>${row.ModifiedBy || ''}</td>
                    <td>${row.ModifiedDateTime || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
});





document.getElementById('cm-searchForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Send AJAX POST request to /search
    fetch('/search-collector', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            // Populate the table with the results
            const tbody = document.querySelector("#collectorReserves tbody");
            tbody.innerHTML = ''; // Clear existing rows


            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${row.CollectorName || ''}</td>
                            <td>${row.CollectorAlias || ''}</td>
                            <td>${row.Address1 || ''} </td>
                             <td>${row.Address2 || ''} </td>
                            <td>${row.Phone1 || ''} </td>
                            <td>${row.Phone2 || ''} </td>
                            <td>${row.Fax || ''}</td>
                            <td>${row.Email || ''}</td>
                            <td>${row.Pan || ''}</td>
                            <td>${row.CommissionPercent || ''}</td>
                        `;
                tbody.appendChild(tr);
            });

        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('error').textContent = 'An error occurred while searching.';
        });
});


document.getElementById("stm-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Fetch results from the backend
    fetch("/search-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#resultstables1 tbody");
            tableBody.innerHTML = ""; // Clear previous results

            data.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${row.TransactionNo || ''}</td>
                        <td>${new Date(row.TransactionDate).toLocaleDateString()}</td>
                        
                        <td>${row.AccountType || ''}</td>
                        <td>${row.AccountAlias || ''}</td>
                        <td>${row.AccountName1 || ''}</td>
                        <td>${row.TotalShare || ''}</td>
                        <td>${row.ShareIDFrom || ''}</td>
                        <td>${row.ShareIDTo || ''}</td>
                        <td>${row.AccountAlias1 || ''}</td>
                        <td>${row.AccountName2 || ''}</td>
                        <td>${row.CreatedUser || ''}</td>
                        <td>${new Date(row.CreatedDateTime).toLocaleDateString() || ''}</td>
                        <td></td>
                        <td></td>
                    `;
                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error fetching results:", err));
});




document.getElementById("ccm-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Fetch results from the backend
    fetch("/search-collection-cheque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            const tableBody = document.querySelector("#CCTablevalues tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${row.TransactionNo}</td>
                        <td>${new Date(row.TransactionDate).toLocaleDateString()}</td>
                        <td>${row.DraweeBank}</td>
                        <td>${row.DraweeBankBranch}</td>
                        <td>${row.ChequeNo}</td>
                        <td>${new Date(row.ChequeDate).toLocaleDateString()}</td>
                        <td>${new Date(row.CollectedDate).toLocaleDateString()}</td>
                        <td>${row.AccountType}</td>
                        <td>${row.AccountAlias}</td>
                        <td>${row.AccountName1}</td>
                        <td>${row.Amount}</t>
                        <td>${row.FundSource}</td>
                        <td>${row.CreatedUser}</td>
                        <td>${new Date(row.CreatedDateTime).toLocaleDateString()}</td>
                        <td>${row.AccountName1}</td>
                        <td>${row.AccountName1}</td>
                        <td>${row.DocClass}</td>
                    `;
                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error fetching results:", err));
});

document.getElementById("atm-searchForm").addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch('/search-account-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            const tableBody = document.querySelector("#AT-results-table tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${row.GLName}</td>
                        <td>${row.GlAlias}</td>
                        <td>${row.AccountGroup}</td>
                        <td>${row.SavingorLoan}</td>
                        <td>${row.Schedule}</td>

                    `;
                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error fetching results:", err));
});



document.getElementById("is-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Fetch results from the backend
    fetch("/search-interest-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const tableBody = document.querySelector("#ISTablevalues tbody");
            tableBody.innerHTML = ""; // Clear previous results
            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.AccountType || ''}</td>
                <td>${new Date(row.EffectiveDate).toLocaleDateString() || ''}</td>
                <td>${row.InterestMethod || ''}</td>
                <td>${row.IntRate || ''}</td>
                <td>${row.TaxRate || ''}</td>
                <td>${row.Creator || ''}</td>
                <td>${new Date(row.CreatedDateTime || '').toLocaleDateString()}</td>
                <td>${row.Modifier || ''}</td>
                <td>${new Date(row.LastSavedDateTime || '').toLocaleDateString()}</td>
            `;
                tableBody.appendChild(tr);
            });
        })

        .catch(err => console.error("Error fetching results:", err));
});


document.getElementById("ps-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Send search request to the backend
    fetch("/search-penalty-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((results) => {
            // Select the table body
            const tableBody = document.querySelector("#PS-results-table tbody");
            tableBody.innerHTML = ""; // Clear previous results

            // Populate the table with new results
            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.AccountType}</td>
                    <td>${new Date(row.EffectiveDate).toLocaleDateString()}</td>
                    <td>${row.Creator}</td>
                    <td>${new Date(row.CreatedDateTime).toLocaleDateString()}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${new Date(row.LastSavedDateTime || null).toLocaleDateString()}</td>


                `;
                tableBody.appendChild(tr);
            });
        })
        .catch((err) => console.error("Error fetching results:", err));
});

document.getElementById("rs-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Send search request to the backend
    fetch("/search-rebate-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((results) => {
            // Select the table body
            const tableBody = document.querySelector("#RS-results-table tbody");
            tableBody.innerHTML = ""; // Clear previous results

            // Populate the table with new results
            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.AccountType}</td>
                    <td>${new Date(row.EffectiveDate).toLocaleDateString()}</td>
                    <td>${row.Creator}</td>
                    <td>${new Date(row.CreatedDateTime).toLocaleDateString()}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${new Date(row.LastSavedDateTime || null).toLocaleDateString()}</td>


                `;
                tableBody.appendChild(tr);
            });
        })
        .catch((err) => console.error("Error fetching results:", err));
});

document.getElementById("cim-searchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Send search request to the backend
    fetch("/search-cheque-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((results) => {
            // Select the table body
            const tableBody = document.querySelector("#CIM-Search-Table tbody");
            tableBody.innerHTML = ""; // Clear previous results

            // Populate the table with new results
            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${new Date(row.IssueDate).toLocaleDateString()}</td>
                    <td>${row.GLName}</td>
                    <td>${row.AccountNumber}</td>
                    <td>${row.AccountName}</td>
                    <td>${row.TotalCheque}</td>
                    <td>${row.ChequeNoFrom}</td>
                    <td>${row.ChequeNoTo}</td>
                    <td>${row.Creator}</td>
                    <td>${new Date(row.CreatedDateTime).toLocaleDateString()}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${new Date(row.LastSavedDateTime || null).toLocaleDateString()}</td>


                `;
                tableBody.appendChild(tr);
            });
        })
        .catch((err) => console.error("Error fetching results:", err));
});

document.getElementById("ASsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Fetch results from the backend
    fetch("/search-mobile-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const tableBody = document.querySelector("#ASTablevalues tbody");
            tableBody.innerHTML = ""; // Clear previous results
            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.AccountType}</td>
                <td>${row.AccountNo}</td>
                <td>${row.AccountName}</td>
                <td>${new Date(row.EffectiveDate).toLocaleDateString()}</td>
                <td>${new Date(row.RenewDate).toLocaleDateString()}</td>
                <td>${new Date(row.ExpiryDate).toLocaleDateString()}</td>
                <td>${row.Creator}</td>
                <td>${new Date(row.CreatedDateTime).toLocaleDateString()}</td>
                <td>${row.Modifier}</td>
                <td>${row.LastSavedDateTime || ''}</td>

                
            `;
                tableBody.appendChild(tr);
            });
        })

        .catch(err => console.error("Error fetching results:", err));
});

let currentPage = 1; // Declare currentPage globally
const pageSize = 8000; // Number of rows per page

document.getElementById("myFormAccountLock").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetchData(currentPage, data); // Fetch data for the current page
});

// Fetch data and update the table
function fetchData(page, data) {
    fetch("/search-account-locked-unlocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page, pageSize }),
    })
        .then(response => response.json())
        .then(responseData => {
            if (!responseData || !responseData.results) {
                console.error("Unexpected response format:", responseData);
                return;
            }

            const { results, totalPages } = responseData;
            const tableBody = document.querySelector("#AccLockTableValues tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${(page - 1) * pageSize + (index + 1)}</td>
                <td><input type="checkbox" class="AccLockTableValues" data-slAlias="${row.SlAlias}" ${row.Locked === true ? 'checked' : ''}/></td>
                <td>${row.GLName || ""}</td>
                <td>${row.SlAlias || ""}</td>
                <td>${row.SLName || ""}</td>
                <td>${row.Phone1 || ""}</td>
                
            `;
                tableBody.appendChild(tr);
            });

            // Enable/Disable buttons based on pages
            document.getElementById("prevPage").disabled = page === 1;
            document.getElementById("nextPage").disabled = page >= totalPages;

            // Add event listeners to the checkboxes
            const checkboxes = document.querySelectorAll(".AccLockTableValues");
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener("change", function () {
                    const slAlias = this.getAttribute("data-slAlias");
                    const lockedValue = this.checked ? 1 : 0;

                    // Send a request to update the 'Locked' column
                    updateLockedStatus(slAlias, lockedValue);
                });
            });
        })
        .catch(err => console.error("Error fetching results:", err));
}

// Update the 'Locked' status in the database
function updateLockedStatus(slAlias, lockedValue) {
    fetch("/update-locked-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slAlias, locked: lockedValue }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Locked status for ${slAlias} updated to ${lockedValue}`);
            } else {
                console.error("Failed to update Locked status");
            }
        })
        .catch(err => console.error("Error updating Locked status:", err));
}

// Handle the 'Previous' page button
document.getElementById("prevPage").addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        fetchData(currentPage, data); // Fetch previous page data
    }
});

// Handle the 'Next' page button
document.getElementById("nextPage").addEventListener("click", function () {
    currentPage++;
    fetchData(currentPage, data); // Fetch next page data
});


// Lock All Button
document.getElementById("lockAllBtn").addEventListener("click", function () {
    const confirmLock = window.showCustomConfirm("Note: Only the loaded accounts will be locked.Are you sure you want to lock all the loaded accounts?");
    if (confirmLock) {
        lockAllCheckboxes(true); // Lock all checkboxes (checked) and update Locked status to 1
    }
});

// Unlock All Button with confirmation
document.getElementById("unlockAllBtn").addEventListener("click", function () {
    const confirmUnlock = window.showCustomConfirm("Note: Only the loaded accounts will be unlocked.Are you sure you want to unlock all the loaded accounts?");
    if (confirmUnlock) {
        lockAllCheckboxes(false); // Unlock all checkboxes (unchecked) and update Locked status to 0
    }
});

// Select/Deselect all checkboxes and update Locked status
function lockAllCheckboxes(lockStatus) {
    const checkboxes = document.querySelectorAll(".AccLockTableValues");
    checkboxes.forEach(checkbox => {
        checkbox.checked = lockStatus;
        const slAlias = checkbox.getAttribute("data-slAlias");
        const lockedValue = lockStatus ? 1 : 0;

        // Send a request to update the 'Locked' status for each row
        updateLockedStatus(slAlias, lockedValue);
    });
}


document.getElementById("AMUMForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetchDataam(currentPage, data); // Fetch data for the current page
});

// Fetch data and update the table
function fetchDataam(page, data) {
    fetch("/search-account-mapped-unmapped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page, pageSize }),
    })
        .then(response => response.json())
        .then(responseData => {
            if (!responseData || !responseData.results) {
                console.error("Unexpected response format:", responseData);
                return;
            }

            const { results, totalPages } = responseData;
            const tableBody = document.querySelector("#ACCmappedTableLock tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${(page - 1) * pageSize + (index + 1)}</td>
                <td><input type="checkbox" class="ACCmappedTableLock" data-slAlias="${row.SlAlias}" ${row.RouteID ? 'checked' : ''}/></td>
                <td>${row.GLName || ""}</td>
                <td>${row.SlAlias || ""}</td>
                <td>${row.SLName || ""}</td>
                <td>${row.MemberName || ""}</td>
                <td>${row.Route || ""}</td>
                <td>${row.MemberAlias || ""}</td>
                <td>${row.Phone1 || ""}</td>
            `;
                tableBody.appendChild(tr);
            });

            // Enable/Disable buttons based on pages
            document.getElementById("AMUMprevPage").disabled = page === 1;
            document.getElementById("AMUMnextPage").disabled = page >= totalPages;


        })
        .catch(err => console.error("Error fetching results:", err));
}

document.addEventListener("change", function (event) {
    if (event.target.classList.contains("ACCmappedTableLock")) {
        const checkbox = event.target;
        const slAlias = checkbox.getAttribute("data-slAlias"); // Get SlAlias from checkbox
        const routeInputField = document.getElementById("route-wise-acc");
        const routeInput = routeInputField.value.trim();

        if (checkbox.checked) {
            if (!routeInput) {
                showCustomAlert("Please enter a Route before checking the box.");
                checkbox.checked = false;
                routeInputField.focus(); // Set focus on the input field
                return;
            }

            // Fetch RouteID from tbRouteMaster
            fetch("/get-route-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ routeName: routeInput }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.routeID) {
                        updateRouteID(slAlias, data.routeID);
                    } else {
                        showCustomAlert("Invalid Route. Please enter a valid Route.");
                        checkbox.checked = false;
                        routeInputField.focus(); // Set focus back to input field if invalid
                    }
                })
                .catch(err => console.error("Error fetching RouteID:", err));
        } else {
            // Unchecking: Set RouteID to NULL
            updateRouteID(slAlias, null);
        }
    }
});


// Function to update RouteID in tbSubLedgerMaster
function updateRouteID(slAlias, routeID) {
    fetch("/update-route-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slAlias, routeID }),
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                console.error("Failed to update RouteID.");
            }
        })
        .catch(err => console.error("Error updating RouteID:", err));
}


document.addEventListener("DOMContentLoaded", function () {
    const routeInputField = document.getElementById("route-wise-acc");
    const mappedAllButton = document.getElementById("mappedAllBtn");
    const unmappedAllButton = document.getElementById("unmapppedAllBtn");

    // Function to update RouteID in the database
    function updateRouteID(slAlias, routeID) {
        fetch("/update-route-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slAlias, routeID }),
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.error("Error updating RouteID:", data.message);
                }
            })
            .catch(err => console.error("Error updating RouteID:", err));
    }

    // Handling single checkbox change
    document.addEventListener("change", function (event) {
        if (event.target.classList.contains("ACCmappedTableLock")) {
            const checkbox = event.target;
            const slAlias = checkbox.getAttribute("data-slAlias"); // Get SlAlias from checkbox
            const routeInput = routeInputField.value.trim();

            if (checkbox.checked) {
                if (!routeInput) {
                    showCustomAlert("Please enter a Route before checking the box.");
                    checkbox.checked = false;
                    routeInputField.focus(); // Set focus on the input field
                    return;
                }

                // Fetch RouteID from tbRouteMaster
                fetch("/get-route-id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ routeName: routeInput }),
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.routeID) {
                            updateRouteID(slAlias, data.routeID);
                        } else {
                            showCustomAlert("Invalid Route. Please enter a valid Route.");
                            checkbox.checked = false;
                            routeInputField.focus(); // Focus back if invalid
                        }
                    })
                    .catch(err => console.error("Error fetching RouteID:", err));
            } else {
                // Unchecking: Set RouteID to NULL
                updateRouteID(slAlias, null);
            }
        }
    });

    // Handling "Unmapped All" button click (Uncheck all checkboxes)
    unmappedAllButton.addEventListener("click", function () {
        if (showCustomConfirm("Note: Only the load accounts will be Unmapped.")) {
            document.querySelectorAll(".ACCmappedTableLock").forEach((checkbox) => {
                checkbox.checked = false;
                const slAlias = checkbox.getAttribute("data-slAlias");
                updateRouteID(slAlias, null); // Set RouteID to NULL
            });
        }
    });

    // Handling "Mapped All" button click (Check all checkboxes with validation)
    mappedAllButton.addEventListener("click", function () {
        const routeInput = routeInputField.value.trim();

        if (!routeInput) {
            showCustomAlert("Please enter a Route before mapping all accounts.");
            routeInputField.focus(); // Focus on input field if empty
            return;
        }

        if (showCustomConfirm("Note: Only the load accounts will be Mapped.")) {
            // Fetch RouteID from tbRouteMaster
            fetch("/get-route-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ routeName: routeInput }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.routeID) {
                        document.querySelectorAll(".ACCmappedTableLock").forEach((checkbox) => {
                            checkbox.checked = true;
                            const slAlias = checkbox.getAttribute("data-slAlias");
                            updateRouteID(slAlias, data.routeID);
                        });
                    } else {
                        showCustomAlert("Invalid Route. Please enter a valid Route.");
                        routeInputField.focus(); // Focus back if invalid
                    }
                })
                .catch(err => console.error("Error fetching RouteID:", err));
        }
    });
});




// Handle the 'Previous' page button
document.getElementById("AMUMprevPage").addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        fetchDataam(currentPage, data); // Fetch previous page data
    }
});

// Handle the 'Next' page button
document.getElementById("AMUMnextPage").addEventListener("click", function () {
    currentPage++;
    fetchDataam(currentPage, data); // Fetch next page data
});


document.getElementById("showReport-DayCount").addEventListener("click", function (event) {
    event.preventDefault();

    const form = document.getElementById("SRAform");
    if (!form) {
        console.error("Form not found.");
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    fetch("/display-dayslog-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results) || results.length === 0) {
                console.error("Expected a non-empty array but got:", results);
                showCustomAlert("No data found in the given date range>Please try again")
                return;
            }

            const table = document.querySelector(".dcl-table-container table");
            const tableHead = table.querySelector("thead");
            const tableBody = table.querySelector("tbody");

            tableHead.innerHTML = ""; // Clear previous headers
            tableBody.innerHTML = ""; // Clear previous results

            // Force override the column labels manually
            const columns = [
                { key: "ClosedOpenedDate", label: "Date" },
                { key: "UserName", label: "Closed By" },
                { key: "CloseOpenDatetime", label: "DateTime" },
                { key: "CloseOpenType", label: "ActionType" }


            ];

            console.log("Using Columns:", columns); // Debugging

            const trHead = document.createElement("tr");
            trHead.innerHTML = `<th>S.No</th>` + columns.map(col => `<th>${col.label}</th>`).join("");
            tableHead.appendChild(trHead);

            // Display data
            results.forEach((row, index) => {
                console.log("Processing row:", row);
                const tr = document.createElement("tr");
                tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.ClosedOpenedMiti}</td>
            <td>${row.UserName || ''}</td>
            <td>${row.CloseOpenMiti}</td>
            <td>${row.CloseOpenType}</td>
            
            `
                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error fetching results:", err));
});

                const formatDate = (dateStr) => {
                    if (!dateStr) return "";
                    return new Date(dateStr).toISOString().split("T")[0];
                };

document.getElementById("showStatus-DayCount").addEventListener("click", function (event) {
    event.preventDefault();

    const form = document.getElementById("SRAform"); // Ensure you're getting the correct form
    if (!form) {
        console.error("Form not found.");
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Fetch results from the backend
    fetch("/display-show-status-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results) || results.length === 0) {
                console.error("Expected a non-empty array but got:", results);
                return;
            }

            const table = document.getElementById("reportDayCountTable");
            const tableHead = table.querySelector("thead");
            const tableBody = table.querySelector("tbody");

            tableHead.innerHTML = ""; // Clear previous headers
            tableBody.innerHTML = ""; // Clear previous results

            // Extract column names from the first object
            const columns = [
                { key: "ClosedOpenedDate", label: "Date" },
                { key: "CloseOpenType", label: "Status" }
            ]

            // Create and append table headers
            const trHead = document.createElement("tr");
            trHead.innerHTML = `<th>S.No</th>` + columns.map(col => `<th>${col.label}</th>`).join("");
            tableHead.appendChild(trHead);

            // Create and append table rows
           results.forEach((row, index) => {
    console.log(`Row ${index + 1} →`, row);

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${row.Date || '-'}</td>
        
        <td>${row.CloseOpenType || '-'}</td>
    `;

    tableBody.appendChild(tr);
});

        })
        .catch(err => console.error("Error fetching results:", err));
});


document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-users-log")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#userLogTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((row, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td>${index + 1}</td>
                    <td>${row.UserName || ''}</td>
                    <td>${row.OrgName || ''}</td>
                    
                    <td>${row.ComputerName || ''}</td>
                    <td>${row.WinUserName || ''}</td>
                    <td>${row.LoginMiti || ''}</td>
                    <td>${row.LogoutMiti || ''}</td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-users-hit-report")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#userReportHitLogTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((row, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td>${index + 1}</td>
                    <td>${row.UserName || ''}</td>
                    <td>${row.ReportName || ''}</td>
                    
                    
                    <td>${row.ComputerName || ''}</td>
                    <td>${row.WinUserName || ''}</td>
                    <td>${row.LoginMiti || ''}</td>
                    <td>${row.LogoutMiti || ''}</td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-report-hit-count")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#userReportHitCountLogTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((row, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.ReportName || ''}</td>
                    <td>${row.ReportCount || ''}</td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-rights-right-master")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#userRightInfoTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            // Store row data by RightId for easy lookup
            const rightsMap = new Map();
            data.forEach(row => rightsMap.set(String(row.RightId), row)); // Ensure keys are strings

            data.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.dataset.rightId = row.RightId; // Store RightId in row dataset

                // Checkbox for IsRoot column
                const isRootCheckbox = row.IsRoot
                    ? `<input type="checkbox" class="isRootCheckbox" data-rightid="${row.RightId}">`
                    : "";

                // Checkboxes for ActionRight (New, Edit, Delete)
                const newCheckbox = row.ActionRight
                    ? `<input type="checkbox" class="actionCheckbox" data-type="new" data-rightid="${row.RightId}">`
                    : "";
                const editCheckbox = row.ActionRight
                    ? `<input type="checkbox" class="actionCheckbox" data-type="edit" data-rightid="${row.RightId}">`
                    : "";
                const deleteCheckbox = row.ActionRight
                    ? `<input type="checkbox" class="actionCheckbox" data-type="delete" data-rightid="${row.RightId}">`
                    : "";

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${isRootCheckbox}</td>
                    <td style="white-space: pre;">${row.RightDescription || ''}</td>
                    <td>${newCheckbox}</td>
                    <td>${editCheckbox}</td>
                    <td>${deleteCheckbox}</td>
                `;

                tableBody.appendChild(tr);
            });

            // Add event listener for all checkboxes
            document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
                checkbox.addEventListener("change", function () {
                    const selectedRightId = String(this.dataset.rightid); // Convert to string
                    if (this.checked) {
                        checkMatchingParentRights(selectedRightId);
                    } else {
                        uncheckMatchingParentRights(selectedRightId);
                    }
                });
            });

            // Recursive function to check all matching child checkboxes
            function checkMatchingParentRights(selectedRightId) {
                document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
                    const rowRightId = String(checkbox.dataset.rightid); // Convert to string
                    const rowData = rightsMap.get(rowRightId);

                    if (rowData && rowData.ParentRightID && String(rowData.ParentRightID) === selectedRightId) {
                        checkbox.checked = true; // Auto-check matching checkboxes

                        // Also check action checkboxes (New, Edit, Delete)
                        document.querySelectorAll(`input[data-rightid="${rowRightId}"]`).forEach(actionCheckbox => {
                            actionCheckbox.checked = true;
                        });

                        // Recursively check child checkboxes
                        checkMatchingParentRights(rowRightId);
                    }
                });
            }

            // Recursive function to uncheck all related checkboxes when unchecked
            function uncheckMatchingParentRights(selectedRightId) {
                document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
                    const rowRightId = String(checkbox.dataset.rightid); // Convert to string
                    const rowData = rightsMap.get(rowRightId);

                    if (rowData && rowData.ParentRightID && String(rowData.ParentRightID) === selectedRightId) {
                        checkbox.checked = false; // Uncheck matching checkboxes

                        // Also uncheck action checkboxes (New, Edit, Delete)
                        document.querySelectorAll(`input[data-rightid="${rowRightId}"]`).forEach(actionCheckbox => {
                            actionCheckbox.checked = false;
                        });

                        // Recursively uncheck child checkboxes
                        uncheckMatchingParentRights(rowRightId);
                    }
                });
            }
        })
        .catch(error => console.error("Error fetching data:", error));
});





// Function to update the checkbox action in the backend
function updateActionRight(RightID, Action, IsChecked) {
    fetch("/update-action-right", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            RightID: RightID,
            Action: Action,
            IsChecked: IsChecked
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ParentRightID) {
                console.log(`ParentRightID: ${data.ParentRightID}`);
            }
            console.log('Action updated successfully for', Action, 'on RightID', RightID);
        })
        .catch(error => {
            console.error("Error updating action:", error);
        });
}








document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-org-master")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#userOrgMasterTable tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            data.forEach((row, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="checkbox" class=""/></td>
                    <td>${row.OrgName || ''}</td>
                    <td>${row.OrgAlias || ''}</td>
                `;

                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});




document.addEventListener("DOMContentLoaded", () => {
    const fiscalYearForm = document.getElementById("myForm32");
    const tbody = document.querySelector("#FYMfiscalYearTable tbody");
    const movableDiv = document.getElementById("fiscalMOv");
    const updateForm = document.getElementById("fiscalYearUpdateForm");

    function formatMiti(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split("/");
        if (parts.length !== 3) return dateStr;
        const [day, month, year] = parts;
        return `${year}/${month}/${day}`;
    }

    // === your existing fiscal year fetch remains unchanged ===

    fiscalYearForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(fiscalYearForm);
        const requestData = {
            FYMCurrentAll: formData.get("FYMCurrentAll"),
            FYMYearStartsFrom: formData.get("FYMYearStartsFrom"),
            FYMEndAt: formData.get("FYMEndAt")
        };

        fetch('/search-fiscal-year', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                tbody.innerHTML = "";
                if (data.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='3'>No data found</td></tr>";
                    return;
                }

                data.forEach((row, index) => {
                    const tr = document.createElement("tr");
                    if (row.CurrentFiscal === true) tr.classList.add("FYMhighlight");

                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${formatMiti(row.StartMiti)}</td>
                    <td>${formatMiti(row.EndMiti)}</td>
                    <td>${row.Remarks || ""}</td>
                    
                `;

                    tr.addEventListener("dblclick", () => {
                        const fiscalmovstart = document.getElementById("fiscalmovstart");
                        const fiscalmovend = document.getElementById("fiscalmovend");
                        const fisChecked = document.getElementById('fiscalmovchecked');
                        const fisYearID = document.getElementById('fisYearID');
                        const fisYearIDval = row.YearID;

                        fisYearID.value = fisYearIDval;

                        fisChecked.checked = !!row.CurrentFiscal;

                        const startDate = formatMiti(row.StartMiti).replace(/\//g, "-");
                        const endDate = formatMiti(row.EndMiti).replace(/\//g, "-");

                        fiscalmovstart.value = startDate;
                        fiscalmovend.value = endDate;

                        movableDiv.style.display = "block";
                        makeDivMovable(movableDiv);
                    });

                    tbody.appendChild(tr);
                });
            })
            .catch(error => console.error("Error fetching fiscal years:", error));
    });

    // === NEW FETCH FOR /updateFiscalyr ===
    updateForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(updateForm);
        const data = Object.fromEntries(formData.entries());

        // Convert checkbox to boolean
        data.fiscalmovchecked = document.getElementById("fiscalmovchecked").checked;

        const response = await fetch("/updateFiscalyr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Muskanma');
        showCustomAlert(result.message || "Updated!");
    });


    // === Cancel Button ===
    document.getElementById("cancelFiscalMov").addEventListener("click", () => {
        movableDiv.style.display = "none";
    });

    // === Make movable helper ===
    function makeDivMovable(div) {
        let isDragging = false;
        let offsetX, offsetY;

        div.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            const rect = div.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                div.style.left = `${e.pageX - offsetX}px`;
                div.style.top = `${e.pageY - offsetY}px`;
                div.style.position = 'absolute';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutForm = document.getElementById("logoutForm");
    const closeButton = document.getElementById("closeButton185");
    const cancelButton = document.getElementById("cancelButton185");
    const movableDiv = document.getElementById("movableDiv185");

    cancelButton.addEventListener("click", () => {
        movableDiv.style.display = "none";
    });

    closeButton.addEventListener("click", () => {
        movableDiv.style.display = "none";
    });

    logoutForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("/logout", {
                method: "POST",
            });

            const result = await response.text();
            if (response.ok) {
                alert("You have been logged out successfully!");
                movableDiv.style.display = "none";
                window.location.href = "/index.html";
            } else {
                showCustomAlert(result || "Error logging out!");
            }
        } catch (err) {
            console.error("Logout error:", err);
            showCustomAlert("An unexpected error occurred.");
        }
    });
});



let currentPagesec = 1; // Corrected variable name
const pageSizesec = 8000; // Number of rows per page

document.getElementById("voucherApproved").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);


    fetchDatapp(currentPagesec, data); // Fetch data for the current page
});

// Fetch data and update the table
function fetchDatapp(page, data) {
    fetch("/getVoucherApproved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page, pageSize: pageSizesec }),
    })
        .then(response => response.json())
        .then(responseData => {
            if (!responseData || !responseData.results) {
                console.error("Unexpected response format:", responseData);
                return;
            }

            const { results, totalPages } = responseData;
            const tableBody = document.querySelector("#approvedUNvoucher tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${(page - 1) * pageSizesec + (index + 1)}</td>
                <td><input type="checkbox" class="VoucherApprovedVal" data-slAlias="${row.VoucherNo}" ${row.ApprovedUserID ? 'checked' : ''}/></td>
                <td>${row.VoucherNo}</td>
                <td></td>
                <td>${row.MenuName}</td>
                <td>${row.TotalDrAmount}</td>
                <td>${row.UserName || ""}</td>

            `;
                tableBody.appendChild(tr);
            });

            // Enable/Disable buttons based on pages
            document.getElementById("VAprevPage").disabled = page === 1;
            document.getElementById("VAnextPage").disabled = page >= totalPages;

            // Add event listeners to the checkboxes
            document.querySelectorAll(".VoucherApprovedVal").forEach(checkbox => {
                checkbox.addEventListener("change", function () {
                    const slAlias = this.getAttribute("data-slAlias");
                    const VaUserName = document.getElementById('VAUserName').value; // Get VAUserName

                    const lockedValue = this.checked ? VaUserName : ""; // Pass VaUserName if checked, else empty string

                    // Send a request to update the 'Locked' column
                    updateapprovedStatus(slAlias, lockedValue);
                });
            });
        })
        .catch(err => console.error("Error fetching results:", err));
}

// Update the 'Locked' status in the database
function updateapprovedStatus(slAlias, lockedValue) {
    fetch("/update-approved-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slAlias, locked: lockedValue }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Locked status for ${slAlias} updated to ${lockedValue}`);
            } else {
                console.error("Failed to update Locked status");
            }
        })
        .catch(err => console.error("Error updating Locked status:", err));
}

// Handle the 'Previous' page button
document.getElementById("VAprevPage").addEventListener("click", function () {
    if (currentPagesec > 1) {
        currentPagesec--;
        fetchDatapp(currentPagesec, getFormData()); // Fetch previous page data
    }
});

// Handle the 'Next' page button
document.getElementById("VAnextPage").addEventListener("click", function () {
    currentPagesec++;
    fetchDatapp(currentPagesec, getFormData()); // Fetch next page data
});

// Function to get form data
function getFormData() {
    const formData = new FormData(document.getElementById("voucherApproved"));
    return Object.fromEntries(formData);
}

// Lock All Button
document.getElementById("VAapprovedAllBtn").addEventListener("click", function () {
    const confirmLock = window.showCustomConfirm("Note: Only the loaded accounts will be locked. Are you sure?");
    if (confirmLock) {
        approvedAllCheckboxes(true);
    }
});

// Unlock All Button with confirmation
document.getElementById("VAunapprovedAllBtn").addEventListener("click", function () {
    const confirmUnlock = window.showCustomConfirm("Note: Only the loaded accounts will be unlocked. Are you sure?");
    if (confirmUnlock) {
        approvedAllCheckboxes(false);
    }
});

// Select/Deselect all checkboxes and update ApprovedUserID
function approvedAllCheckboxes(lockStatus) {
    const VaUserName = document.getElementById("VAUserName").value; // Get username

    document.querySelectorAll(".VoucherApprovedVal").forEach(checkbox => {
        checkbox.checked = lockStatus;
        const slAlias = checkbox.getAttribute("data-slAlias");

        // If locking, send the username; if unlocking, send NULL
        const lockedValue = lockStatus ? VaUserName : null;

        // Send request to update ApprovedUserID
        updateapprovedStatus(slAlias, lockedValue);
    });
}

let currentPagethird = 1; // Corrected variable name
const pageSizethird = 8000; // Number of rows per page

document.getElementById("voucherCheckedNVerified").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);


    fetchDatCNV(currentPagethird, data); // Fetch data for the current page
});

// Fetch data and update the table
function fetchDatCNV(page, data) {
    fetch("/getVoucherCheckedAndVerified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page, pageSize: pageSizethird }),
    })
        .then(response => response.json())
        .then(responseData => {
            if (!responseData || !responseData.results) {
                console.error("Unexpected response format:", responseData);
                return;
            }

            const { results, totalPages } = responseData;
            const tableBody = document.querySelector("#checkedNVerifiedvoucher tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${(page - 1) * pageSizethird + (index + 1)}</td>
                <td><input type="checkbox" class="VoucherCheckedNVVal" data-slAlias="${row.VoucherNo}" ${row.CheckUserID ? 'checked' : ''}/></td>
                <td>${row.VoucherNo}</td>
                <td></td>
                <td>${row.MenuName}</td>
                <td>${row.TotalDrAmount}</td>
                <td>${row.UserName || ""}</td>

            `;
                tableBody.appendChild(tr);
            });

            // Enable/Disable buttons based on pages
            document.getElementById("VCNVprevPage").disabled = page === 1;
            document.getElementById("VCNVnextPage").disabled = page >= totalPages;

            // Add event listeners to the checkboxes
            document.querySelectorAll(".VoucherCheckedNVVal").forEach(checkbox => {
                checkbox.addEventListener("change", function () {
                    const slAlias = this.getAttribute("data-slAlias");
                    const VaUserName = document.getElementById('VCNVUserName').value; // Get VAUserName

                    const lockedValue = this.checked ? VaUserName : ""; // Pass VaUserName if checked, else empty string

                    // Send a request to update the 'Locked' column
                    updateCheckedNVStatus(slAlias, lockedValue);
                });
            });
        })
        .catch(err => console.error("Error fetching results:", err));
}

// Update the 'Locked' status in the database
function updateCheckedNVStatus(slAlias, lockedValue) {
    fetch("/update-CheckedNVerified-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slAlias, locked: lockedValue }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Locked status for ${slAlias} updated to ${lockedValue}`);
            } else {
                console.error("Failed to update Locked status");
            }
        })
        .catch(err => console.error("Error updating Locked status:", err));
}

// Handle the 'Previous' page button
document.getElementById("VCNVprevPage").addEventListener("click", function () {
    if (currentPagethird > 1) {
        currentPagethird--;
        fetchDatCNV(currentPagethird, getFormDataCNV()); // Fetch previous page data
    }
});

// Handle the 'Next' page button
document.getElementById("VCNVnextPage").addEventListener("click", function () {
    currentPagethird++;
    fetchDatCNV(currentPagethird, getFormDataCNV()); // Fetch next page data
});

// Function to get form data
function getFormDataCNV() {
    const formData = new FormData(document.getElementById("voucherCheckedNVerified"));
    return Object.fromEntries(formData);
}

// Lock All Button
document.getElementById("VCNVerfiedAllBtn").addEventListener("click", function () {
    const confirmLock = window.showCustomConfirm("Note: Only the loaded accounts will be locked. Are you sure?");
    if (confirmLock) {
        CheckedNVerifiedAllCheckboxes(true);
    }
});

// Unlock All Button with confirmation
document.getElementById("VCNUnverfirdAllBtn").addEventListener("click", function () {
    const confirmUnlock = window.showCustomConfirm("Note: Only the loaded accounts will be unlocked. Are you sure?");
    if (confirmUnlock) {
        CheckedNVerifiedAllCheckboxes(false);
    }
});

// Select/Deselect all checkboxes and update ApprovedUserID
function CheckedNVerifiedAllCheckboxes(lockStatus) {
    const VaUserName = document.getElementById("VCNVUserName").value; // Get username

    document.querySelectorAll(".VoucherCheckedNVVal").forEach(checkbox => {
        checkbox.checked = lockStatus;
        const slAlias = checkbox.getAttribute("data-slAlias");

        // If locking, send the username; if unlocking, send NULL
        const lockedValue = lockStatus ? VaUserName : null;

        // Send request to update ApprovedUserID
        updateCheckedNVStatus(slAlias, lockedValue);
    });
}


let currentPageForth = 1; // Corrected variable name
const pageSizeForth = 8000; // Number of rows per page

document.getElementById("voucherPostingNunpost").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);


    fetchDatPNUP(currentPageForth, data); // Fetch data for the current page
});

// Fetch data and update the table
function fetchDatPNUP(page, data) {
    fetch("/getVoucherPostNUPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page, pageSize: pageSizeForth }),
    })
        .then(response => response.json())
        .then(responseData => {
            if (!responseData || !responseData.results) {
                console.error("Unexpected response format:", responseData);
                return;
            }

            const { results, totalPages } = responseData;
            const tableBody = document.querySelector("#postNUPostedvoucher tbody");
            tableBody.innerHTML = ""; // Clear previous results

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>${(page - 1) * pageSizeForth + (index + 1)}</td>
                <td><input type="checkbox" class="VoucherPostNUnPostedVal" data-slAlias="${row.VoucherNo}" ${row.PostUserID ? 'checked' : ''}/></td>
                <td>${row.VoucherNo}</td>
                <td></td>
                <td>${row.MenuName}</td>
                <td>${row.TotalDrAmount}</td>
                <td>${row.UserName || ""}</td>

            `;
                tableBody.appendChild(tr);
            });

            // Enable/Disable buttons based on pages
            document.getElementById("VPNUPprevPage").disabled = page === 1;
            document.getElementById("VPNUPnextPage").disabled = page >= totalPages;

            // Add event listeners to the checkboxes
            document.querySelectorAll(".VoucherPostNUnPostedVal").forEach(checkbox => {
                checkbox.addEventListener("change", function () {
                    const slAlias = this.getAttribute("data-slAlias");
                    const VaUserName = document.getElementById('VPNUPUserName').value; // Get VAUserName

                    const lockedValue = this.checked ? VaUserName : ""; // Pass VaUserName if checked, else empty string

                    // Send a request to update the 'Locked' column
                    updatePostedNUPStatus(slAlias, lockedValue);
                });
            });
        })
        .catch(err => console.error("Error fetching results:", err));
}

// Update the 'Locked' status in the database
function updatePostedNUPStatus(slAlias, lockedValue) {
    fetch("/update-PostedNUnposted-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slAlias, locked: lockedValue }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Locked status for ${slAlias} updated to ${lockedValue}`);
            } else {
                console.error("Failed to update Locked status");
            }
        })
        .catch(err => console.error("Error updating Locked status:", err));
}

// Handle the 'Previous' page button
document.getElementById("VPNUPprevPage").addEventListener("click", function () {
    if (currentPageForth > 1) {
        currentPageForth--;
        fetchDatPNUP(currentPageForth, getFormDataVNUP()); // Fetch previous page data
    }
});

// Handle the 'Next' page button
document.getElementById("VPNUPnextPage").addEventListener("click", function () {
    currentPageForth++;
    fetchDatPNUP(currentPageForth, getFormDataVNUP()); // Fetch next page data
});

// Function to get form data
function getFormDataVNUP() {
    const formData = new FormData(document.getElementById("voucherPostingNunpost"));
    return Object.fromEntries(formData);
}

// Lock All Button
document.getElementById("VPNPostedAllBtn").addEventListener("click", function () {
    const confirmLock = window.showCustomConfirm("Note: Only the loaded accounts will be locked. Are you sure?");
    if (confirmLock) {
        PostedNUnpostedAllCheckboxes(true);
    }
});

// Unlock All Button with confirmation
document.getElementById("VPNUPPostedAllBtn").addEventListener("click", function () {
    const confirmUnlock = window.showCustomConfirm("Note: Only the loaded accounts will be unlocked. Are you sure?");
    if (confirmUnlock) {
        PostedNUnpostedAllCheckboxes(false);
    }
});

// Select/Deselect all checkboxes and update ApprovedUserID
function PostedNUnpostedAllCheckboxes(lockStatus) {
    const VaUserName = document.getElementById("VPNUPUserName").value; // Get username

    document.querySelectorAll(".VoucherPostNUnPostedVal").forEach(checkbox => {
        checkbox.checked = lockStatus;
        const slAlias = checkbox.getAttribute("data-slAlias");

        // If locking, send the username; if unlocking, send NULL
        const lockedValue = lockStatus ? VaUserName : null;

        // Send request to update ApprovedUserID
        updatePostedNUPStatus(slAlias, lockedValue);
    });
}


//JournalVoucher search
document.getElementById("jvSearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-journal-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("JVShowEntryLog");
            const table = document.getElementById("JVTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Create new header row
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                // ✅ Checkbox is checked: show full log columns
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Created By</th>
                    <th>Created Date Time</th>
                    <th>Modified By</th>
                    <th>Modified Date</th>
                    <th>Posted By</th>
                    <th>Posted Date</th>
                    <th>Verified By</th>
                    <th>Verified Date</th>
                    <th>Approved By</th>
                    <th>Approved Date</th>
                    <th>Doc Class</th>
            `;
            } else {
                // ✅ Checkbox is unchecked: simpler header
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate table body rows
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");

                if (checkbox.checked) {
                    // ✅ Show full log columns
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalDrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    // ✅ Simpler row
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Add total row at the end
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="4"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});




//transactionvoucher search
document.getElementById("tmsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-transaction-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }
            const checkbox = document.getElementById("TMShowLog");
            const table = document.getElementById("TMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // Build header based on checkbox state
            const headerRow = document.createElement("tr");
            if (checkbox.checked) {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Created By</th>
                <th>Created Date Time</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Posted By</th>
                <th>Posted Date</th>
                <th>Verified By</th>
                <th>Verified Date</th>
                <th>Approved By</th>
                <th>Approved Date</th>
                <th>Doc Class</th>
                <th>Account #</th>
                 <th>Account Name</th>
            `;
            } else {
                headerRow.innerHTML = `
                 <th>S.No</th>
                 <th>V.No.</th>
                 <th>Date</th>
                 <th>Amount</th>
                 <th>Doc. Class</th>
                 <th>Account Type</th>
                 <th>Account #</th>
                 <th>Account Name</th>
            `;
            }
            thead.appendChild(headerRow);

            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                if (checkbox.checked) {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                    <td>${row.SlAlias || ''}</td>
                    <td>${row.SLName || ''}</td>

                `;
                } else {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                    <td>${row.SlAlias || ''}</td>
                    <td>${row.SLName || ''}</td>
                `;
                }
                tbody.appendChild(tr);

                // ✅ Accumulate the amount (make sure it's a number)
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Append total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";
            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="2"></td>
            `;
            }
            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});

//receipt voucher search

document.getElementById("rvsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-receipt-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("RVShowEntryLog");
            const table = document.getElementById("RMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Build new header based on checkbox state
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                // ✅ Checkbox is checked: show full log columns
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Created By</th>
                    <th>Created Date Time</th>
                    <th>Modified By</th>
                    <th>Modified Date</th>
                    <th>Posted By</th>
                    <th>Posted Date</th>
                    <th>Verified By</th>
                    <th>Verified Date</th>
                    <th>Approved By</th>
                    <th>Approved Date</th>
                    <th>Doc Class</th>
            `;
            } else {
                // ✅ Checkbox is unchecked: simpler header
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate table body
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");

                if (checkbox.checked) {
                    // ✅ Show full log columns
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    // ✅ Simpler row
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Add total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="4"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});



//Payment voucher

document.getElementById("pvmsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('payment-voucher-search-start'));

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-payment-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("PVMShowEntry");
            const table = document.getElementById("PVMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Build new header based on checkbox state
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                // ✅ Checkbox is checked: show full log columns
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Created By</th>
                    <th>Created Date Time</th>
                    <th>Modified By</th>
                    <th>Modified Date</th>
                    <th>Posted By</th>
                    <th>Posted Date</th>
                    <th>Verified By</th>
                    <th>Verified Date</th>
                    <th>Approved By</th>
                    <th>Approved Date</th>
                    <th>Doc Class</th>
            `;
            } else {
                // ✅ Checkbox is unchecked: simpler header
                headerRow.innerHTML = `
                    <th>S.NO</th>
                    <th>V.NO</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Number of A/c</th>
                    <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate table body
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.dataset.journalId = row.JournalID || '';

                if (checkbox.checked) {
                    // ✅ Show full log columns
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalDrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    // ✅ Simpler row
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalDrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalDrAmount) || 0;
            });

            // ✅ Add total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="4"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err))
        .finally(() => window.dispatchEvent(new CustomEvent('payment-voucher-search-finished')));
});



//collection voucher

document.getElementById("colmsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-collection-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("CVMShowlog");
            const table = document.getElementById("CVMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Build new header based on checkbox state
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                // ✅ Checkbox is checked: show full log columns
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Created By</th>
                <th>Created Date Time</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Posted By</th>
                <th>Posted Date</th>
                <th>Verified By</th>
                <th>Verified Date</th>
                <th>Approved By</th>
                <th>Approved Date</th>
                <th>Doc Class</th>
            `;
            } else {
                // ✅ Checkbox is unchecked: simpler header
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate table body
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.dataset.journalId = row.JournalID || '';

                if (checkbox.checked) {
                    // ✅ Checked: full log columns
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    // ✅ Unchecked: simpler row
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Add total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="2"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});



//distribution voucher

document.getElementById("dimsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-distribution-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("DVMShowLog");
            const table = document.getElementById("DVMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Build header based on checkbox
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Created By</th>
                <th>Created Date Time</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Posted By</th>
                <th>Posted Date</th>
                <th>Verified By</th>
                <th>Verified Date</th>
                <th>Approved By</th>
                <th>Approved Date</th>
                <th>Doc Class</th>
            `;
            } else {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate body
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");

                if (checkbox.checked) {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Add total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="2"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});


//interest Posting voucher

document.getElementById("ipmsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-interest-posting-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("IPVMShowLog");
            const table = document.getElementById("IPVMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // ✅ Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // ✅ Build header based on checkbox
            const headerRow = document.createElement("tr");

            if (checkbox.checked) {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Created By</th>
                <th>Created Date Time</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Posted By</th>
                <th>Posted Date</th>
                <th>Verified By</th>
                <th>Verified Date</th>
                <th>Approved By</th>
                <th>Approved Date</th>
                <th>Doc Class</th>
            `;
            } else {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Doc Class</th>
            `;
            }

            thead.appendChild(headerRow);

            // ✅ Populate table body
            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                tr.dataset.journalId = row.JournalID || '';

                if (checkbox.checked) {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }

                tbody.appendChild(tr);
                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // ✅ Add total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";

            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="2"></td>
            `;
            }

            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});



//mbank voucher

document.getElementById("mvmsearchForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("/search-mbank-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(results => {
            if (!Array.isArray(results)) {
                console.error("Expected an array but got:", results);
                return;
            }

            const checkbox = document.getElementById("MbVMShowLog");
            const table = document.getElementById("MbVMTablevalues");
            const thead = table.querySelector("thead");
            const tbody = table.querySelector("tbody");

            // Clear previous header and body
            thead.innerHTML = "";
            tbody.innerHTML = "";

            // Build header based on checkbox state
            const headerRow = document.createElement("tr");
            if (checkbox.checked) {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Created By</th>
                <th>Created Date Time</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Posted By</th>
                <th>Posted Date</th>
                <th>Verified By</th>
                <th>Verified Date</th>
                <th>Approved By</th>
                <th>Approved Date</th>
                <th>Doc Class</th>
            `;
            } else {
                headerRow.innerHTML = `
                <th>S.NO</th>
                <th>V.NO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Number of A/c</th>
                <th>Doc Class</th>
            `;
            }
            thead.appendChild(headerRow);

            let totalAmount = 0;

            results.forEach((row, index) => {
                const tr = document.createElement("tr");
                if (checkbox.checked) {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.Creator || ''}</td>
                    <td>${row.CreatedDate || ''}</td>
                    <td>${row.Modifier || ''}</td>
                    <td>${row.ModifiedDate || ''}</td>
                    <td>${row.Poster || ''}</td>
                    <td>${row.PostDate || ''}</td>
                    <td></td>
                    <td></td>
                    <td>${row.Approver || ''}</td>
                    <td>${row.ApprovedDate || ''}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                } else {
                    tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${row.JV_Miti || ''}</td>
                    <td>${row.TotalCrAmount}</td>
                    <td>${row.DetailsCount}</td>
                    <td>${row.DocClassName || ''}</td>
                `;
                }
                tbody.appendChild(tr);

                totalAmount += parseFloat(row.TotalCrAmount) || 0;
            });

            // Append total row
            const totalRow = document.createElement("tr");
            totalRow.style.fontWeight = "bold";
            if (checkbox.checked) {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="12"></td>
            `;
            } else {
                totalRow.innerHTML = `
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${totalAmount.toFixed(2)}</td>
                <td colspan="2"></td>
            `;
            }
            tbody.appendChild(totalRow);
        })
        .catch(err => console.error("Error fetching results:", err));
});

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/getUserData");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        // ✅ Populate inputs
        document.getElementById("smsurl").value = data.WebSMSMessageURL || "";
        document.getElementById("successmessage").value = data.WebSMSSuccessMessage || "";
        document.getElementById("balancequeryurl").value = data.WebSMSBalanceQueryURL || "";
        document.getElementById("withdrawmessage").value = data.MessageWithdraw || "";
        document.getElementById("depositmessage").value = data.MessageDeposit || "";
        document.getElementById("installmentschedule").value = data.MessageInstallment || "";
        document.getElementById("loanmaturity").value = data.MessageMaturityLoan || "";
        document.getElementById("savingmaturity").value = data.MessageMaturityDeposit || "";
        document.getElementById("longtimenotran").value = data.MessageLongTimeNoTran || "";
        document.getElementById("SSCharge").value = data.SMSCharge || "";
        document.getElementById("SDALTdays").value = data.SMSDaysAfterLastTranDate || "";
        document.getElementById("withdrawamount").value = data.AlertonWithdrawAmount || "0";
        document.getElementById("depositamount").value = data.AlertonDepositAmount || "0";

        console.log("✅ Data loaded successfully", data);
    } catch (err) {
        console.error("❌ Error loading data:", err);
    }
});

window.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("modeSelect");
    const teamModem = [
        document.getElementById('port'),
        document.getElementById('baudrate'),
        document.getElementById('timeout')
    ];
    const teamWeb = [
        document.getElementById('smsurl'),
        document.getElementById('successmessage'),
        document.getElementById('balancequeryurl'),
        document.getElementById('SSBalance')
    ];

    function updateInputs() {
        if (select.value === "modem") {
            teamModem.forEach(inp => inp.classList.remove("SSdisabled"));
            teamWeb.forEach(inp => inp.classList.add("SSdisabled"));
        } else {
            teamModem.forEach(inp => inp.classList.add("SSdisabled"));
            teamWeb.forEach(inp => inp.classList.remove("SSdisabled"));
        }
    }

    // Run once on DOM load
    updateInputs();

    // Change dynamically when select changes
    select.addEventListener("change", updateInputs);
});

document.addEventListener("DOMContentLoaded", () => {
    const ad = document.getElementById("SSAD");
    const ld = document.getElementById("SSLD");
    const dateInput = document.getElementById("SSFormat");

    // set initial value based on selected date type
    if (ad.checked) {
        dateInput.value = "YYYY-MM-DD";
    } else if (ld.checked) {
        dateInput.value = "DD/MM/YYYY";
    }

    ad.addEventListener("change", () => {
        if (ad.checked) {
            dateInput.value = "YYYY-MM-DD";
        }
    });

    ld.addEventListener("change", () => {
        if (ld.checked) {
            dateInput.value = "DD/MM/YYYY";
        }
    });
});

// systemSetting checkboxes
window.addEventListener("DOMContentLoaded", () => {
    const checkBox = document.getElementById("SSCheckedAB");
    const checkBox1 = document.getElementById('SSRBCheckBox');
    const checkBox2 = document.getElementById('SSDCheckbox');

    const teamAB = [
        document.getElementById('SSIDDiff'),
        document.getElementById('SSBPath'),
        document.getElementById('SSBrowse')
    ];
    const teamRB = [
        document.getElementById('SSIEvery')
    ];
    const teamDFT = [
        document.getElementById('SSDFrom'),
        document.getElementById('SSDTo')
    ]

    function updateInputee() {
        if (!checkBox.checked) {
            teamAB.forEach(inp => inp.classList.add("SSdisabled"));
        } else {
            teamAB.forEach(inp => inp.classList.remove("SSdisabled"));
        }
    }
    function updateInputRB() {
        if (!checkBox1.checked) {
            teamRB.forEach(inp => inp.classList.add("SSdisabled"));
        } else {
            teamRB.forEach(inp => inp.classList.remove("SSdisabled"));
        }
    }
    function updateInputDFT() {
        if (!checkBox2.checked) {
            teamDFT.forEach(inp => inp.classList.add("SSdisabled"));
        } else {
            teamDFT.forEach(inp => inp.classList.remove("SSdisabled"));
        }
    }

    // Run once when page loads
    updateInputee();
    updateInputRB();
    updateInputDFT();


    // Update dynamically when checkbox state changes
    checkBox.addEventListener("change", updateInputee);
    checkBox1.addEventListener("change", updateInputRB);
    checkBox2.addEventListener("change", updateInputDFT);
});


// User Define Field checkboxs
document.addEventListener("DOMContentLoaded", () => {
    const selectEl = document.getElementById("UDFType");   // select element

    const teamDTA = [
        document.getElementById("UDFDecimalCB"),
        document.getElementById("UDFShowTotalCB")
    ];

    function updateDTA() {
        const val = selectEl.value;

        if (val === "T" || val === "D" || val === "Y") {
            // Disable (with your class)
            teamDTA.forEach(inp => {
                inp.classList.add("SSdisabled");
                inp.checked = false;  // uncheck also when disabled
            });
        } else {
            // Enable
            teamDTA.forEach(inp => {
                inp.classList.remove("SSdisabled");
                inp.checked = false;  // also uncheck on enabling if needed
            });
        }
    }


    updateDTA();                 // run on page load
    selectEl.addEventListener("change", updateDTA); // run on change
});
