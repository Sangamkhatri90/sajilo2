document.addEventListener("DOMContentLoaded", function () {
    let mode7 = null;  // Mode will be 'new7' for adding and 'edit7' for editing
    let selectedParentGroup = null;
    let selectedLedgerGroupForEdit = null;  // Store the currently selected ledger group for editing

    console.log("Document loaded, attaching event listeners.");

    // Prevent the traditional form submission and handle it with fetch
    const myFormLedgerGroup = document.getElementById('myForm86');  // Form ID for ledger groups
    if (myFormLedgerGroup) {
        myFormLedgerGroup.addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent traditional form submission
            console.log('Form submission intercepted.');
            saveLedgerGroup();  // Call the save function for ledger group
        });
    } else {
        console.error('Form element "myForm86" not found.');
    }

    // Ledger Group 'New7' button click event
    const newButton = document.getElementById('ledgerm-new-button');
    if (newButton) {
        newButton.addEventListener('click', function () {
            console.log('New button clicked, setting mode to "new7".');
            setMode7('new7');  // Set the mode to "new7" for ledger group
        });
    } else {
        console.error('New button element "ledgerm-new-button" not found.');
    }

    // Ledger Group 'Edit7' button click event
    const editButton = document.getElementById('ledgerm-edit-button');
    if (editButton) {
        editButton.addEventListener('click', function () {
            console.log('Edit button clicked, setting mode to "edit7".');
            setMode7('edit7');  // Set the mode to "edit7" for ledger group
            showLedgerGroupsListForEdit();  // Show ledger groups list for editing
        });
    } else {
        console.error('Edit button element "ledgerm-edit-button" not found.');
    }

    // Save ledger group function
    function saveLedgerGroup() {
        const ledgerGroupIdInput = document.getElementById('ledgerm-id');
        const ledgerGroupAlias = document.getElementById('ledgermalias')?.value.trim() || '';
        const ledgerGroupAltAlias = document.getElementById('ledgermaltalias')?.value.trim() || '';
        const ledgerGroupRemarks = document.getElementById('ledgerm-remark')?.value.trim() || '';
        
        let ledgerGroupParent = '';  // Initialize an empty value for the parent group
        let selectedLgrGrpID = '';  // Initialize the variable for the selected LgrGrpID

        // If in edit mode, set the parent group from the 'ledger-under' field
        if (mode7 === 'edit7') {
            ledgerGroupParent = document.getElementById('ledger-under')?.value.trim() || '';
            selectedLgrGrpID = selectedLedgerGroupForEdit.LgrGrpID;  // Store the LgrGrpID of the selected group for editing
        } else if (selectedParentGroup) {
            // If in new mode, use selectedParentGroup
            ledgerGroupParent = selectedParentGroup.GrpName;
        } else {
            // For new mode, if no parent is selected, fallback to a default value
            ledgerGroupParent = document.getElementById('ledger-under')?.value.trim() || '';
        }

        // Debugging logs to check values
        console.log('Prepared data for ledger group:', {
            groupName: ledgerGroupIdInput.value.trim(),
            groupalias: ledgerGroupAlias,
            altalias: ledgerGroupAltAlias,
            remarks: ledgerGroupRemarks,
            parentGroup: ledgerGroupParent,
            selectedLgrGrpID: selectedLgrGrpID
        });

        // Ensure required fields are not empty only during the save process
        if (mode7 === 'new7' && (!ledgerGroupIdInput.value.trim() || !ledgerGroupAlias || !ledgerGroupParent)) {
            showCustomAlert("Please fill in all required fields.");
            return;
        }
    // Ensure required fields are not empty only during the save process
        if (mode7 === 'edit7' && (!ledgerGroupIdInput.value.trim() || !ledgerGroupAlias || !ledgerGroupParent)) {
            showCustomAlert("Please fill in all required fields.");
            return;
        }
        // Prepare the data object
        const data = {
            groupName: ledgerGroupIdInput.value.trim(),  // Change groupId to groupName
            groupalias: ledgerGroupAlias,
            altalias: ledgerGroupAltAlias,
            remarks: ledgerGroupRemarks,
            parentGroup: ledgerGroupParent,  // This must match the backend's parameter name
            selectedLgrGrpID: selectedLgrGrpID  // Pass the selected LgrGrpID for editing
        };
        console.log('Sending group name to backend:', ledgerGroupIdInput.value.trim());

        const url = mode7 === 'edit7' ? '/edit-ledger-group' : '/add-ledger-group';

        // Disable save button to prevent double submission
        document.getElementById('ledgerm-save-button').disabled = true;

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
            document.getElementById('ledgerm-save-button').disabled = false;

            if (data.success) {
                showCustomAlert(data.message);  // Show success message
                resetLedgerGroupForm(); // Reset the form after successful submission
            } else {
                showCustomAlert(data.message);  // Show failure message
            }
        })
        .catch(error => {
            document.getElementById('ledgerm-save-button').disabled = false;
            console.error('Error:', error);
            showCustomAlert('An error occurred while saving the ledger group. Please try again.');
        });
    }

    // Set mode for ledger group (either "new7" or "edit7")
    function setMode7(newMode) {
        mode7 = newMode;
        console.log('Mode set to:', mode7);
        if (mode7 === 'new7') {
            setNewMode7();  // Set to New Mode7 for ledger group
        } else if (mode7 === 'edit7') {
            setEditMode7();  // Set to Edit Mode7 for ledger group
        }
    }

    // Set form to "New Mode7"
    function setNewMode7() {
        console.log('Setting form to New Mode7.');
        document.getElementById('ledgerm-id').value = '';  // Clear ledger group ID input
        document.getElementById('ledgermalias').value = '';  // Clear alias input
        document.getElementById('ledgermaltalias').value = ''; // Clear alt-alias input
        document.getElementById('ledgerm-remark').value = ''; // Clear remark input
        document.getElementById('ledger-under').value = ''; // Clear parent group input
        document.getElementById('ledgerm-save-button').disabled = false;  // Enable Save button
        document.getElementById('ledgerm-id').disabled = false;  // Enable ID input
        document.getElementById('ledgermalias').disabled = false;  // Enable alias input
        document.getElementById('ledgermaltalias').disabled = false;  // Enable alt-alias input
        document.getElementById('ledgerm-remark').disabled = false; // Enable remark input
        document.getElementById('ledger-under').disabled = false; // Enable parent group input
    }

    // Set form to "Edit Mode7"
    function setEditMode7() {
        console.log('Setting form to Edit Mode7.');
    
        // Enable the inputs for editing
        document.getElementById('ledgerm-id').disabled = false;  // Enable Group Name field
        document.getElementById('ledgermalias').disabled = false;  // Enable Alias field
        document.getElementById('ledgermaltalias').disabled = false;  // Enable Alt Alias field
        document.getElementById('ledgerm-remark').disabled = false;  // Enable Remark field
        document.getElementById('ledger-under').disabled = false;  // Enable Parent Group field
        document.getElementById('ledgerm-save-button').disabled = false;  // Enable Save button
    
        // Ensure no validation is triggered on Edit button click
        document.getElementById('ledgerm-save-button').onclick = function() {
            saveLedgerGroup();  // Save function should only be triggered when Save is clicked
        };
    
        // Add debugging to check if the values are correctly populated
        console.log("Populating the form for editing...");
        console.log("Selected Ledger Group for Edit:", selectedLedgerGroupForEdit);
    
        // Populate form fields with the selected group values
        if (selectedLedgerGroupForEdit) {
            document.getElementById('ledgerm-id').value = selectedLedgerGroupForEdit.GrpName;  // Set Group Name
            document.getElementById('ledgermalias').value = selectedLedgerGroupForEdit.GrpAlias;  // Set Alias
            document.getElementById('ledgermaltalias').value = selectedLedgerGroupForEdit.AltAlias;  // Set Alt Alias
            document.getElementById('ledgerm-remark').value = selectedLedgerGroupForEdit.Remarks;  // Set Remarks
            document.getElementById('ledger-under').value = selectedLedgerGroupForEdit.ParentGroupName || ''; // Set Parent Group Name (if available)
    
            // Make sure the data is correctly set and no premature validation occurs
            console.log("Form fields populated. Ready for user edit.");
        }
    }
    
    // Reset the ledger group form after successful save or cancellation
    function resetLedgerGroupForm() {
        console.log('Resetting ledger group form after save.');
        document.getElementById('ledgerm-id').value = '';  // Clear ledger group ID input
        document.getElementById('ledgermalias').value = '';  // Clear alias input
        document.getElementById('ledgermaltalias').value = ''; // Clear alt-alias input
        document.getElementById('ledgerm-remark').value = ''; // Clear remark input
        document.getElementById('ledger-under').value = ''; // Clear parent group input
        document.getElementById('ledgerm-save-button').disabled = true;  // Disable Save button
        document.getElementById('ledgerm-id').disabled = true;  // Disable ID input
        document.getElementById('ledgermalias').disabled = true;  // Disable alias input
        document.getElementById('ledgermaltalias').disabled = true;  // Disable alt-alias input
        document.getElementById('ledgerm-remark').disabled = true; // Disable remark input
        document.getElementById('ledger-under').disabled = true; // Disable parent group input
        mode7 = null;  // Reset mode7 to null
    }

    // Fetch ledger groups list for editing
    function showLedgerGroupsListForEdit() {
        const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
        ledgerGroupListDiv.innerHTML = '';  // Clear previous suggestions
        ledgerGroupListDiv.style.display = 'none';  // Hide the list initially

        console.log('Fetching ledger groups list for edit...');
        fetch('/fetchLedgerGroupsForEdit')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched ledger groups data:', data);
                if (data.ledgerGroups && data.ledgerGroups.length > 0) {
                    displayLedgerGroupsForEdit(data.ledgerGroups);
                } else {
                    const noResult = document.createElement('div');
                    noResult.textContent = 'No ledger groups found';
                    noResult.style.color = 'gray';
                    ledgerGroupListDiv.appendChild(noResult);
                }
            })
            .catch(error => {
                console.error('Error fetching ledger groups for edit:', error);
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error fetching ledger groups';
                errorMessage.style.color = 'red';
                ledgerGroupListDiv.appendChild(errorMessage);
            });
    }

    // Display ledger groups for edit
    function displayLedgerGroupsForEdit(ledgerGroups) {
        const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
        ledgerGroupListDiv.innerHTML = '';  // Clear previous suggestions

        // Create an "X" button to close the list
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';  // Text content for the button
        closeButton.className = 'close-button';  // Add class for styling
        closeButton.onclick = function (event) {
            event.preventDefault();  // Prevent default action like form submission
            ledgerGroupListDiv.style.display = 'none';  // Hide the list
        };

        ledgerGroupListDiv.appendChild(closeButton);  // Add the close button to the list

        // Sort the ledger groups alphabetically
        ledgerGroups.sort((a, b) => a.GrpName.localeCompare(b.GrpName));

        // Display the list of ledger groups
        ledgerGroups.forEach(group => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${group.GrpName} - ${group.GrpAlias}`;  // Display GrpName and GrpAlias

            // When clicked, set the ledger group for editing and populate the fields
            div.onclick = function () {
                console.log('Selected ledger group for editing:', group);
                setEditMode7();
                selectedLedgerGroupForEdit = group;

                // Populate form fields
                document.getElementById('ledgerm-id').value = group.GrpName;
                document.getElementById('ledgermalias').value = group.GrpAlias;
                document.getElementById('ledgermaltalias').value = group.AltAlias;
                document.getElementById('ledgerm-remark').value = group.Remarks;
                document.getElementById('ledger-under').value = group.ParentGroupName || ''; // Assuming ParentGroupName is returned

                // Find and populate the "Under" field with the parent group name
                const selectedMGrpID = group.MGrpID;
                const matchingGroup = ledgerGroups.find(ledgerGroup => ledgerGroup.LgrGrpID === selectedMGrpID);
                if (matchingGroup) {
                    document.getElementById('ledger-under').value = matchingGroup.GrpName;  // Set the "Under" field value
                } else {
                    document.getElementById('ledger-under').value = '';  // Clear the "Under" field if no match is found
                }

                // Close the ledger groups list by hiding it
                ledgerGroupListDiv.style.display = 'none';  // Hide the list after selection
            };

            ledgerGroupListDiv.appendChild(div); // Add the suggestion item to the list
        });

        ledgerGroupListDiv.style.display = 'block';  // Show the suggestions list
    }

});