
    document.addEventListener("DOMContentLoaded", function () {
        let mode8 = null;  // Mode will be 'new8' for adding and 'edit8' for editing
        let selectedLedgerSubGroupForEdit = null;  // Store the currently selected ledger sub-group for editing

        console.log("Document loaded, attaching event listeners.");

        // Prevent the traditional form submission and handle it with fetch
        const myFormLedgerSubGroup = document.getElementById('myForm90');  // Form ID for ledger sub-groups
        if (myFormLedgerSubGroup) {
            myFormLedgerSubGroup.addEventListener('submit', function (event) {
                event.preventDefault();  // Prevent traditional form submission
                console.log('Form submission intercepted.');
                saveLedgerSubGroup();  // Call the save function for ledger sub-group
            });
        } else {
            console.error('Form element "myForm90" not found.');
        }

        // Ledger Sub Group 'New8' button click event
        const newButton = document.getElementById('ledgermsub-new-button');
        if (newButton) {
            newButton.addEventListener('click', function () {
                console.log('New button clicked, setting mode to "new8".');
                setMode8('new8');  // Set the mode to "new8" for ledger sub-group
            });
        } else {
            console.error('New button element "ledgermsub-new-button" not found.');
        }

        // Ledger Sub Group 'Edit8' button click event
        const editButton = document.getElementById('ledgermsub-edit-button');
        if (editButton) {
            editButton.addEventListener('click', function () {
                console.log('Edit button clicked, setting mode to "edit8".');
                setMode8('edit8');  // Set the mode to "edit8" for ledger sub-group
                showLedgerSubGroupsListForEdit();  // Show ledger sub-groups list for editing
            });
        } else {
            console.error('Edit button element "ledgermsub-edit-button" not found.');
        }

        // Save ledger sub-group function
        function saveLedgerSubGroup() {
            const ledgerSubGroupIdInput = document.getElementById('ledgermsub-id');
            const ledgerSubGroupAlias = document.getElementById('ledgermsubalias')?.value.trim() || '';
            const ledgerSubGroupAltAlias = document.getElementById('ledgermsubaltalias')?.value.trim() || '';
            const ledgerSubGroupRemarks = document.getElementById('ledgermsub-remark')?.value.trim() || '';
            const ledgerSubGroupDepreciation = document.getElementById('ledgermsub-deprication')?.value.trim() || '';

            let ledgerSubGroupParent = '';  // Initialize an empty value for the parent group
            let selectedSubGrpID = '';  // Initialize the variable for the selected SubGrpID

            // If in edit mode, set the parent group from the 'LedgerGroup2' field
            if (mode8 === 'edit8') {
                ledgerSubGroupParent = document.getElementById('LedgerGroup2')?.value.trim() || '';  // Ensure this is not empty
                selectedSubGrpID = selectedLedgerSubGroupForEdit.LgrSubGrpID;  // Store the LgrSubGrpID of the selected group for editing
                if (!selectedLedgerSubGroupForEdit) {
                    showCustomAlert("No ledger sub-group selected for editing.");
                    return;
                }

               
            } else {
                // For new mode, if no parent is selected, fallback to a default value from LedgerGroup2
                ledgerSubGroupParent = document.getElementById('LedgerGroup2')?.value.trim() || '';
            }

            // Ensure ledgerSubGroupParent is populated and is not empty
            if (!ledgerSubGroupParent) {
                showCustomAlert("Please select a valid parent group.");
                return;
            }

            // Debugging logs to check values
            console.log('Prepared data for ledger sub-group:', {
                subgroupName: ledgerSubGroupIdInput.value.trim(),
                subgroupalias: ledgerSubGroupAlias,
                altalias: ledgerSubGroupAltAlias,
                remarks: ledgerSubGroupRemarks,
                parentGroup: ledgerSubGroupParent,
                selectedLgrSubGrpID: selectedSubGrpID
            });

            // Ensure required fields are not empty only during the save process
            if (mode8 === 'new8' && (!ledgerSubGroupIdInput.value.trim() || !ledgerSubGroupAlias || !ledgerSubGroupParent)) {
                showCustomAlert("Please fill in all required fields.");
                return;
            }

            // Prepare the data object
            const data = {
                subgroup: ledgerSubGroupIdInput.value.trim(),  // Change subgroupId to subgroupName
                subgroupalias: ledgerSubGroupAlias,
                altalias: ledgerSubGroupAltAlias,
                depriciation: ledgerSubGroupDepreciation || 0,  // Default value for depreciation if empty
                LedgerGroup2: ledgerSubGroupParent,  // This must match the backend's parameter name
                remark: ledgerSubGroupRemarks,  // Pass remarks field
            };
            console.log('Sending subgroup name to backend:', ledgerSubGroupIdInput.value.trim());

            const url = mode8 === 'edit8' ? '/edit-ledger-subgroup' : '/addLedgerSubGroup';

            // Disable save button to prevent double submission
            document.getElementById('ledgermsub-save-button').disabled = true;

            // Sending the data to the server using fetch
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Send data as JSON
            })
                .then(response => response.json())
                .then(data => {
                    // Enable the save button after response
                    document.getElementById('ledgermsub-save-button').disabled = false;

                    if (data.success) {
                        showCustomAlert(data.message);  // Show success message
                        resetLedgerSubGroupForm(); // Reset the form after successful submission
                    } else {
                        showCustomAlert(data.message);  // Show failure message
                    }
                })
                .catch(error => {
                    document.getElementById('ledgermsub-save-button').disabled = false;
                    console.error('Error:', error);
                    showCustomAlert('An error occurred while saving the ledger sub-group. Please try again.');
                });
        }

        // Set mode for ledger sub-group (either "new8" or "edit8")
        function setMode8(newMode) {
            mode8 = newMode;
            console.log('Mode set to:', mode8);
            if (mode8 === 'new8') {
                setNewMode8();  // Set to New Mode8 for ledger sub-group
            } else if (mode8 === 'edit8') {
                setEditMode8();  // Set to Edit Mode8 for ledger sub-group
            }
        }

        // Set form to "New Mode8"
        function setNewMode8() {
            console.log('Setting form to New Mode8.');
            document.getElementById('ledgermsub-id').value = '';  // Clear ledger sub-group ID input
            document.getElementById('ledgermsubalias').value = '';  // Clear alias input
            document.getElementById('ledgermsubaltalias').value = ''; // Clear alt-alias input
            document.getElementById('ledgermsub-deprication').value = ''; // Clear depreciation input
            document.getElementById('ledgermsub-remark').value = ''; // Clear remark input
            document.getElementById('LedgerGroup2').value = ''; // Clear parent group input
            document.getElementById('ledgermsub-save-button').disabled = false;  // Enable Save button
            document.getElementById('ledgermsub-id').disabled = false;  // Enable ID input
            document.getElementById('ledgermsubalias').disabled = false;  // Enable alias input
            document.getElementById('ledgermsubaltalias').disabled = false;  // Enable alt-alias input
            document.getElementById('ledgermsub-deprication').disabled = false;  // Enable depreciation input
            document.getElementById('ledgermsub-remark').disabled = false; // Enable remark input
            document.getElementById('LedgerGroup2').disabled = false; // Enable parent group input
        }

        // Set form to "Edit Mode8"
        function setEditMode8() {
            console.log('Setting form to Edit Mode8.');

            // Enable the inputs for editing
            document.getElementById('ledgermsub-id').disabled = false;  // Enable Sub Group ID field
            document.getElementById('ledgermsubalias').disabled = false;  // Enable Alias field
            document.getElementById('ledgermsubaltalias').disabled = false;  // Enable Alt Alias field
            document.getElementById('ledgermsub-deprication').disabled = false;  // Enable Depreciation field
            document.getElementById('ledgermsub-remark').disabled = false;  // Enable Remark field
            document.getElementById('LedgerGroup2').disabled = false;  // Enable Parent Group field
            document.getElementById('ledgermsub-save-button').disabled = false;  // Enable Save button
        }

        // Reset the form fields after successful submission
        function resetLedgerSubGroupForm() {
            setNewMode8();  // Reset the form to New Mode8
            console.log('Ledger sub-group form reset.');
        }

       // Fetch the list of ledger sub-groups for editing
       function showLedgerSubGroupsListForEdit() {
    console.log('Showing ledger sub-groups list for edit.');

    // Ensure the list container is empty before appending new items
    const ledgerSubGroupListDiv = document.getElementById('ledgerSubGroupList');
    ledgerSubGroupListDiv.innerHTML = '';  // Clear previous suggestions

    // Fetch data from the backend to display ledger sub-groups
    fetch('/fetchLedgerSubGroupsForEdit')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data from backend:', data);  // Log the backend response

            if (data.ledgerSubGroups && data.ledgerSubGroups.length > 0) {
                // Loop through the sub-groups and create clickable divs
                data.ledgerSubGroups.forEach(item => {
                    console.log('Processing sub-group:', item);  // Log each item before appending

                    const div = document.createElement('div');
                    div.textContent = item.SubGrpName;  // Display the subgroup name
                    div.classList.add('ledger-subgroup-item');
                    div.dataset.id = item.LgrSubGrpID;  // Store the ID in the dataset

                    // Attach click event to each div
                    div.addEventListener('click', function () {
                        console.log('Sub-group clicked:', item);  // Debug the clicked item

                        // Store the selected item in the variable
                        selectedLedgerSubGroupForEdit = item;

                        // Update the form fields with the selected item
                        document.getElementById('ledgermsub-id').value = item.SubGrpName;
                        document.getElementById('ledgermsubalias').value = item.SubGrpAlias;
                        document.getElementById('ledgermsubaltalias').value = item.AltAlias;
                        document.getElementById('ledgermsub-remark').value = item.Remarks;
                        document.getElementById('ledgermsub-deprication').value = item.DepreciationPercent;
                        document.getElementById('LedgerGroup2').value = item.LgrGrpID;
                    });

                    // Append the div to the list
                    ledgerSubGroupListDiv.appendChild(div);
                });
            } else {
                showCustomAlert('No ledger sub-groups found for editing.');
            }
        })
        .catch(error => {
            console.error('Error fetching ledger sub-groups:', error);
            showCustomAlert('An error occurred while fetching the ledger sub-groups.');
        });
}

    });
