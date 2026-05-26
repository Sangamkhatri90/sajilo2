// Function to reset form fields to blank, excluding specific classes and IDs
function resetFormFields(movableDivId) {
    const id = `#${movableDivId}`;
    const form = document.querySelector(`${id} form`);
    if (form) {
        const excludedClasses = ['benchods', 'start-date-local', 'end-date-local'];
        const excludedIds = ['custom-english-date']; // your excluded IDs here

        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];

            const hasExcludedClass = excludedClasses.some(cls => el.classList.contains(cls));
            const hasExcludedId = excludedIds.includes(el.id);

            if (!hasExcludedClass && !hasExcludedId) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = false;
                } else if (el.tagName.toLowerCase() === 'select') {
                    el.selectedIndex = 0;
                } else {
                    el.value = '';
                }
            }
        }
    }
}



// Function to keep track of the highest z-index value
let highestZIndex = 1;

function makeMovable(movableDivId, closeButtonId, cancelButtonId, toggleButtonId, toggleKey) {
    const draggable = document.getElementById(movableDivId);
    const closeButton = document.getElementById(closeButtonId);
    const cancelButton = document.getElementById(cancelButtonId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !closeButton || !cancelButton || !toggleButton) {
        return;
    }

    let isDragging = false;

    // Function to bring the div to the front by updating the z-index
    function bringToFront(element) {
        highestZIndex++;
        element.style.zIndex = highestZIndex;
    }

    // Show/hide the div when clicking the toggle button
    toggleButton.addEventListener('click', function () {
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            bringToFront(draggable);
        }
    });

    // Close the div when clicking the close button
    closeButton.addEventListener('click', function () {
        draggable.style.display = 'none';
        resetFormFields(movableDivId); // Reset form fields when close button is clicked
    });

    // Close the div when clicking the cancel button
    cancelButton.addEventListener('click', function () {
        draggable.style.display = 'none';
        resetFormFields(movableDivId); // Reset form fields when cancel button is clicked
    });

    // Add a keyboard shortcut for toggling the div using Ctrl + alphabet
    document.addEventListener('keydown', function (e) {
        if (toggleKey && e.ctrlKey && e.key.toLowerCase() === toggleKey.toLowerCase()) {
            const currentDisplay = window.getComputedStyle(draggable).display;
            draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
            if (currentDisplay === 'none') {
                bringToFront(draggable);
            }
        }
    });

    // Dragging functionality
    draggable.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        e.preventDefault();
        bringToFront(draggable); // Bring the div to the front when clicked
        isDragging = true;

        let offsetX = e.clientX - draggable.getBoundingClientRect().left;
        let offsetY = e.clientY - draggable.getBoundingClientRect().top;

        function moveAt(clientX, clientY) {
            draggable.style.left = clientX - offsetX + 'px';
            draggable.style.top = clientY - offsetY + 'px';
        }

        function onMouseMove(e) {
            e.preventDefault();
            if (isDragging) {
                moveAt(e.clientX, e.clientY);
            }
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function () {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        };
    });

    draggable.ondragstart = function () {
        return false;
    };
}

function bindAdditionalToggleButton(movableDivId, toggleButtonId) {
    const draggable = document.getElementById(movableDivId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !toggleButton) {
        return;
    }

    toggleButton.addEventListener('click', async function () {
        const EditCollChequemasAccIDforaccpostingVD = document.getElementById('Maintransaccountnumberofaccpostedit').value;
       
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

        
                        // Inside the fetch call for necessary data 
                        fetch('/fetchCollectionChequemasaccpostviewDetailsForEdit', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ EditCollChequemasAccIDforaccpostingVD })  // Send the EditAccTypePenaltySelectedName to the backend
                        })
                            .then(response => response.json())
                            .then(data => {

                                if (data.success) {
                                    document.getElementById('accpost-viewdetials-account-number').value = data.SLAlias || '';
                                    document.getElementById('accopendate-viewaccdeteditaccposting').value = data.AccountOpenDate || '';
                                    document.getElementById('acc-name-viewaccdeteditaccposting').value = data.SLName || '';
                                    document.getElementById('ccacceditvd-accountType').value = data.GLName || '';
                                    document.getElementById('acc-address-viewaccdeteditaccposting').value = data.Address1 || '';
                                    document.getElementById('acc-address2-viewaccdeteditaccposting').value = data.Address2 || '';
                                    document.getElementById('acc-phone-viewaccdeteditaccposting').value = data.Phone1 || '';
                                    document.getElementById('acc-email-viewaccdeteditaccposting').value = data.Email || '';
                                    document.getElementById('acc-mobile-viewaccdeteditaccposting').value = data.Mobile || '';
                                    document.getElementById('acc-DOB-viewaccdeteditaccposting').value = data.DateOfBirth || '';
                                    document.getElementById('NextofKinName-viewaccdeteditaccposting').value = data.NextofKinName || '';
                                    document.getElementById('NextofKinAddress-viewaccdeteditaccposting').value = data.NextofKinAddress || '';
                                    document.getElementById('NextofKinReln-viewaccdeteditaccposting').value = data.Relation || '';
                                    document.getElementById('NextofKinContactNumber-viewaccdeteditaccposting').value = data.NextofKinContactNumber || '';
                                    document.getElementById('acc-remarks-viewaccdeteditaccposting').value = data.Remarks || '';
                                    document.getElementById('acc-fax-viewaccdeteditaccposting').value = data.Fax || '';
                                    document.getElementById('acc-MemberId-viewaccdeteditaccposting').value = data.MemberAlias || '';
                                    document.getElementById('acc-MemberName-viewaccdeteditaccposting').value = data.MemberName || '';


                                    document.getElementById("accounteidtcolcheque-photo").src = data.Photo || "";
                                    document.getElementById("accounteidtcolcheque-sign1").src = data.Sign1 || "";
                                    document.getElementById("accounteidtcolcheque-sign2").src = data.Sign2 || "";
                                    document.getElementById("accounteidtcolcheque-sign3").src = data.Sign3 || "";
                                    document.getElementById("accounteidtcolcheque-sign4").src = data.Sign4 || "";

                                    const gendertype = data.Gender;
                                    // Select the appropriate option in the dropdown based on the TransactionType
                                    const genderTypeSelect = document.getElementById('EditGenderTrans-optionforaccpost');
                                    const options = genderTypeSelect.options;
                                    //Loop through the options to find the matching value and set it as selected
                                    for (let i = 0; i < options.length; i++) {
                                        if (options[i].value === gendertype) {
                                            options[i].selected = true;
                                            break; // Stop the loop once the correct option is selected
                                        }
                                    }


                                } else {
                                    showCustomAlert(data.message || 'Member not found');
                                }

                      
                            });
                            const slAlias = document.getElementById("Maintransaccountnumberofaccpostedit")?.value?.trim();
                        console.log("value", slAlias)
                        if (!slAlias) {
                            alert("Missing End date, or SubLedger Alias.");
                            return;
                        }



                        try {
                            const res = await fetch("/api/getRecentTransactionsLP9", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ slAlias })
                            });

                            const data = await res.json();
                            const tbody = document.querySelector("#ccactranstablefd tbody");
                            tbody.innerHTML = ""; // clear old rows

                            if (data.success && data.transactions.length > 0) {
                                data.transactions.forEach((txn, index) => {
                                    const row = document.createElement("tr");
                                    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${txn.JV_Date || ''}</td>
            <td>${txn.VoucherNo || ''} </td>
            <td>${txn.MenuName || ''} </td>
            <td>${txn.DrAmount}</td>
            <td>${txn.CrAmount}</td>
            <td>${txn.Balance.toFixed(2)} ${txn.BalanceType}</td>
          `;
                                    tbody.appendChild(row);
                                });
                            } else {
                                tbody.innerHTML = `<tr><td colspan="3">No transactions found</td></tr>`;
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Error loading transactions");
                        }
                        const accountNumber = document.getElementById("Maintransaccountnumberofaccpostedit")?.value?.trim();
                        const table = document.getElementById("EditMainSharemastable");
                        const tbody = table.querySelector('tbody');
                                                if (accountNumber) {
                            fetch('/fetchShareTransDetailsForMainAccedit', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    EditShareTransACCNumber: accountNumber
                                    

                                }),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log("Share Transaction master Details:", data);

                                    tbody.innerHTML = ""; // Clear existing rows

                                    if (data.ShareTransDetails && data.ShareTransDetails.length > 0) {
                                        // Populate the table with the returned data
                                        data.ShareTransDetails.forEach((row, index) => {
                                            const tr = document.createElement("tr");

                                            const transactionno = row.TransactionNo === 0 ? "0" : row.TransactionNo || '';
                                            const from = row.ShareIDFrom === 0 ? "0" : row.ShareIDFrom || '';
                                            const to = row.ShareIDTo === 0 ? "0" : row.ShareIDTo || '';
                                            const total = row.TotalShare === 0 ? "0" : row.TotalShare || '';

                                            tr.innerHTML = `
                                        <td>${index + 1}</td>
                                        <td contenteditable="true" class="editable-cell" data-field="Transactiono">${transactionno}</td>
                                        <td contenteditable="true" class="editable-cell" data-field="From">${from}</td>
                                        <td contenteditable="true" class="editable-cell" data-field="To">${to}</td>
                                        <td contenteditable="true" class="editable-cell" data-field="Total">${total}</td>
                                    `;
                                            tbody.appendChild(tr);
                                        });

                                        // If there are fewer than 5 rows, add empty rows to make it 5
                                        const emptyRowsCount = 5 - data.ShareTransDetails.length;
                                        for (let i = 0; i < emptyRowsCount; i++) {
                                            const emptyRow = document.createElement("tr");
                                            emptyRow.innerHTML = `
                                        <td>${data.ShareTransDetails.length + i + 1}</td>
                                        <td contenteditable="true" class="editable-cell" data-field="Transactiono"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="From"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="To"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="Total"></td>
                                    `;
                                            tbody.appendChild(emptyRow);
                                        }
                                    } else {
                                        // No data found, show the "No Data Found" message and 5 empty rows
                                        console.log("No data available to display in the table.");
                                        tbody.innerHTML = "";
                                        const noDataRow = document.createElement("tr");
                                        noDataRow.innerHTML = `<td colspan="5" >No data found for the entered Account Number.</td>`;
                                        tbody.appendChild(noDataRow);

                                        // Add 5 empty rows (if no data is returned)
                                        for (let i = 0; i < 5; i++) {
                                            const emptyRow = document.createElement("tr");
                                            emptyRow.innerHTML = `
                                        <td></td> <!-- No serial number when no data -->
                                        <td contenteditable="true" class="editable-cell" data-field="Transactiono"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="From"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="To"></td>
                                        <td contenteditable="true" class="editable-cell" data-field="Total"></td>
                                    `;
                                            tbody.appendChild(emptyRow);
                                        }
                                    }
                                })
                                .catch(error => {
                                    console.error("Error fetching data:", error);
                                    // Handle the error here (e.g., show an alert or message to the user)
                                    tbody.innerHTML = "";
                                    const errorRow = document.createElement("tr");
                                    errorRow.innerHTML = `<td colspan="5" rowspan = "5">Error fetching data. Please try again later.</td>`;
                                    tbody.appendChild(errorRow);

                                    // Add 5 empty rows (if there's an error)
                                    for (let i = 0; i < 5; i++) {
                                        const emptyRow = document.createElement("tr");
                                        emptyRow.innerHTML = `
                                    <td></td> <!-- No serial number when error occurs -->
                                    <td contenteditable="true" class="editable-cell" data-field="Transactiono"></td>
                                    <td contenteditable="true" class="editable-cell" data-field="From"></td>
                                    <td contenteditable="true" class="editable-cell" data-field="To"></td>
                                    <td contenteditable="true" class="editable-cell" data-field="Total"></td>
                                `;
                                        tbody.appendChild(emptyRow);
                                    }
                                });
                        } else {
                            // If account number is empty, clear the table and add 5 empty rows
                            tbody.innerHTML = "";
                            for (let i = 0; i < 5; i++) {
                                const emptyRow = document.createElement("tr");
                                emptyRow.innerHTML = `
                            <td></td> <!-- No serial number when no data -->
                            <td contenteditable="true" class="editable-cell" data-field="Transactiono"></td>
                            <td contenteditable="true" class="editable-cell" data-field="From"></td>
                            <td contenteditable="true" class="editable-cell" data-field="To"></td>
                            <td contenteditable="true" class="editable-cell" data-field="Total"></td>
                        `;
                                tbody.appendChild(emptyRow);
                            }
                        }
    });
}

function bindAdditionalToggleButtonNrm(movableDivId, toggleButtonId) {
    const draggable = document.getElementById(movableDivId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !toggleButton) {
        return;
    }

    toggleButton.addEventListener('click', function () {
       
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

    });
}
function bindAdditionalToggleButtonNrmBill(movableDivId, toggleButtonId) {
    const draggable = document.getElementById(movableDivId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !toggleButton) {
        return;
    }

    toggleButton.addEventListener('click', function () {
       
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

            
                            const ccacceditGLName = document.getElementById("Maintransaccountnumberofaccpostedit")?.value?.trim();
                            document.getElementById("cc-apBillsLedger").value = ccacceditGLName || '';
                             const EditCollChequemasAccIDforaccposting = document.getElementById("Maintransaccountnumberofaccpostedit").value;
console.log("value", EditCollChequemasAccIDforaccposting)
                            fetch('/fetchCollectionChequemasaccpostForEdit', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ EditCollChequemasAccIDforaccposting })
                            })
                                .then(response => response.json())
                                .then(data => {

                                    if (data.success) {
                                        document.getElementById('ccapbillsMemberAlias').value = (data.MemberAlias || '');
                                        document.getElementById('ccapbillsMemberName').value = (data.MemberName || '');

                                    }

                                    else {
                                        showCustomAlert(data.message || 'Member not found');
                                    }

                                })
               

    });
}

// Automatically initialize all movable divs by matching ID patterns
function initializeMovableDivs() {
    const movableDivs = document.querySelectorAll('.movableDiv[id^="movableDiv"]');
    movableDivs.forEach((div) => {
        const match = div.id.match(/^movableDiv(\d+)$/);
        if (!match) {
            return;
        }

        const id = match[1];
        const closeButtonExists = document.getElementById(`closeButton${id}`) !== null;
        const cancelButtonExists = document.getElementById(`cancelButton${id}`) !== null;
        const toggleButtonExists = document.getElementById(`toggleButton${id}`) !== null;

        if (!closeButtonExists || !cancelButtonExists || !toggleButtonExists) {
            console.warn(`movableDiv${id} is present but missing control IDs:`, {
                close: closeButtonExists,
                cancel: cancelButtonExists,
                toggle: toggleButtonExists,
            });
        }

        makeMovable(div.id, `closeButton${id}`, `cancelButton${id}`, `toggleButton${id}`);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMovableDivs);
} else {
    initializeMovableDivs();
}

bindAdditionalToggleButton('movableDiv184', 'MaintranstoggleButton184');
bindAdditionalToggleButtonNrmBill('movableDiv187', 'MaintranstoggleButton187');
bindAdditionalToggleButtonNrm('movableDiv188', 'MaintranstoggleButton188');

      
