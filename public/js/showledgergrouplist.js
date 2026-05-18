let selectedLedgerGroup = null;  // To store the currently selected ledger group

// Function to fetch ledger groups from the server and display the list
function showLedgerGroupsList() {
    const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
    ledgerGroupListDiv.innerHTML = ''; // Clear any existing data
    ledgerGroupListDiv.style.display = 'none'; // Hide the list initially

    // Fetch ledger group data from the server
    fetch('/fetchLedgerGroups')
        .then(response => response.json())
        .then(data => {
            if (data.ledgerGroups && data.ledgerGroups.length > 0) {
                allLedgerGroups = data.ledgerGroups;  // Store the fetched ledger groups
                displayLedgerGroups(allLedgerGroups); // Display the fetched ledger groups
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No ledger groups found';
                noResult.style.color = 'gray';
                ledgerGroupListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching ledger groups:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching ledger groups';
            errorMessage.style.color = 'red';
            ledgerGroupListDiv.appendChild(errorMessage);
        });
}

// Function to display ledger groups in the suggestions list
function displayLedgerGroups(ledgerGroups) {
    const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
    ledgerGroupListDiv.innerHTML = ''; // Clear previous suggestions

    // Create an "X" button to close the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button'; // Add a class for styling
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action like form submission
        ledgerGroupListDiv.style.display = 'none';  // Hide the list
    };

    ledgerGroupListDiv.appendChild(closeButton); // Add the close button to the list

    // Sort the ledger groups alphabetically
    ledgerGroups.sort((a, b) => a.GrpName.localeCompare(b.GrpName));

    // Display the list of ledger groups
    ledgerGroups.forEach(ledgerGroup => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${ledgerGroup.GrpName} - ${ledgerGroup.GrpAlias}`; // Display GrpName and GrpAlias

        // When a ledger group is clicked, fill the input fields
        div.onclick = function () {
            document.getElementById('ledgerm-id').value = ledgerGroup.GrpName;  // Group Name
            document.getElementById('ledgermalias').value = ledgerGroup.GrpAlias;  // Alias
            document.getElementById('ledgermaltalias').value = ledgerGroup.AltAlias;  // Alt Alias
            document.getElementById('ledgerm-remark').value = ledgerGroup.Remarks;  // Remarks

            // Get the selected group's MGrpID
            const selectedMGrpID = ledgerGroup.MGrpID;

            // Debugging logs for checking the selected group
            console.log('Selected Group:', ledgerGroup);
            console.log('Selected MGrpID:', selectedMGrpID);

            // Find a group where LgrGrpID matches the selected MGrpID
            const matchingGroup = ledgerGroups.find(group => group.LgrGrpID === selectedMGrpID);

            // Debugging: Log the result of the find operation
            console.log('Matching Group:', matchingGroup);

            // If a matching group is found, populate the "Under" field with its GrpName
            if (matchingGroup) {
                console.log('Found matching group for under field:', matchingGroup.GrpName);
                document.getElementById('ledger-under').value = matchingGroup.GrpName;
            } else {
                console.log('No matching group found for under field.');
                // If no match is found, clear the "Under" input field
                document.getElementById('ledger-under').value = '';
            }

            selectedLedgerGroup = ledgerGroup;  // Store the selected ledger group
            ledgerGroupListDiv.style.display = 'none'; // Hide the suggestions list
        };

        ledgerGroupListDiv.appendChild(div); // Add the suggestion item to the list
    });

    ledgerGroupListDiv.style.display = 'block'; // Show the suggestions list
}

// Function to delete the selected ledger group
// Function to delete the selected ledger group
function deleteLedgerGroup() {
    const ledgerGroupName = document.getElementById('ledgerm-id').value.trim();

    // If no ledger group is selected, show the list of ledger groups
    if (!selectedLedgerGroup && !ledgerGroupName) {
        showLedgerGroupsList();  // Show the list of ledger groups to choose from
        return;  // Prevent further actions until a ledger group is selected
    }

    // If a ledger group is selected, proceed with deletion
    const groupNameToDelete = selectedLedgerGroup ? selectedLedgerGroup.GrpName : ledgerGroupName;

    // If a ledger group is still not selected, show error and prevent deletion
    if (!groupNameToDelete) {
        showCustomAlert("Group Name is required.");
        return;  // Prevent further actions
    }

    // Step 1: Check if the selected group has dependencies in the 'MGrpID' column
    const groupToDelete = selectedLedgerGroup || allLedgerGroups.find(group => group.GrpName === groupNameToDelete);

    const dependentGroup = allLedgerGroups.find(group => group.MGrpID === groupToDelete.LgrGrpID);

    // Step 2: If there is a dependent group, show an alert and reset the selection
    if (dependentGroup) {
        showCustomAlert(`Cannot delete group "${groupToDelete.GrpName}" as it is being used by another group.`);
        resetSelection7();  // Reset the form and selection after showing the alert
        return;
    }

       showCustomConfirm(
    `Are you sure you want to delete the route "${groupToDelete}"?`,
    () => {
        fetch('/deleteLedgerGroup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName: groupToDelete.GrpName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showCustomAlert(`Ledger group "${groupToDelete.GrpName}" deleted successfully.`);
                removeFromList(groupToDelete.GrpName);  // Remove the deleted ledger group from the list
                resetSelection7();  // Reset selection and inputs after successful deletion
            } else {
                showCustomAlert(data.message || "Failed to delete the ledger group.");
                resetSelection7();  // Reset selection even if deletion failed
            }
        })
        .catch(error => {
            console.error('Error deleting ledger group:', error);
            showCustomAlert("Error deleting ledger group.");
            resetSelection7();  // Ensure we reset even in case of error
        });
    } ,()  => {
      // On cancel
      resetSelection7();
    }
);
}


// Function to reset the ledger group selection and input fields
function resetSelection7() {
    selectedLedgerGroup = null;  // Clear the selected ledger group

    // Clear input fields
    document.getElementById('ledgerm-id').value = '';  // Clear the Group Name input field
    document.getElementById('ledgermalias').value = '';  // Clear the Alias input field
    document.getElementById('ledgermaltalias').value = '';  // Clear the Alt Alias input field
    document.getElementById('ledgerm-remark').value = '';  // Clear the Remarks input field
    document.getElementById('ledger-under').value = '';  // Clear the Parent Group input field

    // Optionally clear any other UI elements like the displayed ledger group list
    const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
    ledgerGroupListDiv.innerHTML = '';  // Clear any remaining suggestions
    ledgerGroupListDiv.style.display = 'none';  // Hide the ledger group list if needed
}

// Function to remove the deleted ledger group from the displayed list
function removeFromList(groupName) {
    const ledgerGroupListDiv = document.getElementById('ledgerGroupList');
    const items = ledgerGroupListDiv.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        if (item.textContent.includes(groupName)) {
            item.remove(); // Remove the ledger group from the displayed list
        }
    });
}
