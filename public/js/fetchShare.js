document.addEventListener('DOMContentLoaded', async () => {
    const noStartFromInput = document.getElementById('no-start-from');

    // Fetch the last ShareNoTo value from the server
    const fetchLastShareNoTo = async () => {
        try {
            const response = await fetch('/get-last-share-no-to'); // Backend route to fetch ShareNoTo
            const data = await response.json();
            const lastShareNoTo = data.lastShareNoTo || 0; // If no value, default to 0
            noStartFromInput.value = lastShareNoTo + 1; // Set the input field automatically
        } catch (error) {
            console.error('Error fetching last ShareNoTo:', error);
            noStartFromInput.value = 1; // Default to 1 if an error occurs
        }
    };

    // Automatically fetch and set the value on page load
    await fetchLastShareNoTo();
});

document.addEventListener('DOMContentLoaded', async () => {
    const noStartFromInput = document.getElementById('share-start-from');
    const noOfSharesInput = document.getElementById('no-of-shares');
    const calculatedShareToInput = document.getElementById('share-end-to');

    // Fetch the last ShareNoTo value from the server
    const fetchLastShareNoTo = async () => {
        try {
            const response = await fetch('/get-last-share-no-to-1'); // Backend route to fetch ShareNoTo
            const data = await response.json();
            const lastShareNoTo = data.lastShareNoTo || 0; // If no value, default to 0
            noStartFromInput.value = lastShareNoTo + 1; // Set the input field automatically
        } catch (error) {
            console.error('Error fetching last ShareNoTo:', error);
            noStartFromInput.value = 1; // Default to 1 if an error occurs
        }
    };

    // Calculate and update the ShareNoTo on blur
    const updateCalculatedShareTo = () => {
        const startFrom = parseInt(noStartFromInput.value, 10) || 0;
        const noOfShares = parseInt(noOfSharesInput.value, 10) || 0;
        calculatedShareToInput.value = startFrom + noOfShares - 1; // Calculate the ending share number
    };

    // Automatically fetch and set the value on page load
    await fetchLastShareNoTo();

    // Add event listener for blur event on the noOfSharesInput
    noOfSharesInput.addEventListener('blur', updateCalculatedShareTo);
});



document.addEventListener('DOMContentLoaded', () => {
    const voucherDropdown = document.getElementById('voucherName');

    if (!voucherDropdown) return;

    const getValue = (value) => (value !== null && value !== undefined ? value : '');

    const loadVoucherDetails = (selectedMenuName) => {
        if (!selectedMenuName) return;

        fetch(`/api/voucher-details?menuName=${encodeURIComponent(selectedMenuName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showCustomAlert(data.error);
                    return;
                }

                document.getElementById("VCategory").value = getValue(data.Category);
                document.getElementById("dateFrom").value = getValue(data.StartDate || data.StartMiti);
                document.getElementById("dateTo").value = getValue(data.EndDate || data.EndMiti);
                document.getElementById("prefix").value = getValue(data.Prefix);
                document.getElementById("suffix").value = getValue(data.Suffix);
                document.getElementById("startFromP").value = getValue(data.StartFrom);
                document.getElementById("endTo").value = getValue(data.EndTo);
                document.getElementById("bodyLength").value = getValue(data.BodyLength);
                document.getElementById("fillChar").value = getValue(data.FillChar);
            })
            .catch(error => console.error("Error fetching voucher details:", error));
    };

    fetch('/api/voucher-names')
        .then(response => response.json())
        .then(data => {
            voucherDropdown.innerHTML = '';

            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.MenuName;
                option.textContent = item.MenuName;
                voucherDropdown.appendChild(option);
            });

            loadVoucherDetails(voucherDropdown.value);
        })
        .catch(error => {
            console.error('Error fetching voucher names:', error);
        });

    voucherDropdown.addEventListener("change", function () {
        loadVoucherDetails(voucherDropdown.value);
    });
});
// Fetch and populate the dropdown
document.addEventListener("DOMContentLoaded", function () {
    const moduleDropdown = document.getElementById("ModuleName");
    const categorySelect = document.getElementById("MCategory");

    // Fetch and populate the dropdown
    fetch('/api/modules')
        .then(response => response.json())
        .then(modules => {
            modules.forEach(module => {
                const option = document.createElement('option');
                option.value = module.Module;
                option.textContent = module.Module;
                moduleDropdown.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching modules:", error));

    moduleDropdown.addEventListener("change", function () {
        const selectedModule = moduleDropdown.value;

        // Fetch details for the selected module
        fetch(`/api/module-details?module=${encodeURIComponent(selectedModule)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showCustomAlert(data.error);
                    return;
                }

                // Helper function to handle null or undefined values
                const getValue = (value) => (value !== null && value !== undefined ? value : '');



                // Populate fields
                const categories = Array.isArray(data.Category) ? data.Category : [data.Category];
                categorySelect.innerHTML = ''; // Clear previous options
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    option.selected = true; // Select the option
                    categorySelect.appendChild(option);
                });
                document.getElementById("MCategory").value = getValue(data.Category);
                document.getElementById("MDateFrom").value = getValue(data.StartMiti);
                document.getElementById("MDateTo").value = getValue(data.EndMiti);
                document.getElementById("MPrefix").value = getValue(data.Prefix);
                document.getElementById("MSuffix").value = getValue(data.Suffix);
                document.getElementById("MStartFrom").value = getValue(data.StartFrom);
                document.getElementById("MEndTo").value = getValue(data.EndTo);
                document.getElementById("MLength").value = getValue(data.BodyLength);
                document.getElementById("MFillBy").value = getValue(data.FillChar);
            })
            .catch(error => console.error("Error fetching module details:", error));
    });
});




document.addEventListener('DOMContentLoaded', () => {
    fetch('/generate-share-transaction-no', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.transactionNo) {
                document.getElementById('transactionNoInput').value = data.transactionNo;
            } else {
                console.error('TransactionNo is undefined in the response.');
            }
        })
        .catch(error => console.error('Error fetching transaction number:', error));
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('/generate-collection-cheque-no', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.CCtransactionNo) {
                document.getElementById('collectionChequeNoInput').value = data.CCtransactionNo;
            } else {
                console.error('TransactionNo is undefined in the response.');
            }
        })
        .catch(error => console.error('Error fetching transaction number:', error));
});


