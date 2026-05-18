
    let mode4 = null;  // Mode will be 'new4' for adding and 'edit4' for editing
let selectedDenominationForEdit4 = null;  // Store the currently selected denomination for editing

// Prevent the traditional form submission and handle it with fetch
const myFormDenomination = document.getElementById('myForm25');  // Form ID for denominations
myFormDenomination.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent traditional form submission
    saveDenomination();  // Call the save function for denomination
});

// Denomination 'New4' button click event
document.getElementById('denomination-new-button').addEventListener('click', function () {
    setMode4('new4');  // Set the mode to "new4" for denomination
});

// Denomination 'Edit4' button click event
document.getElementById('denomination-edit-button').addEventListener('click', function () {
    setMode4('edit4');  // Set the mode to "edit4" for denomination
    showDenominationsListForEdit();  // Show denominations list for editing
});

// Denomination save button click event
document.getElementById('denomination-save-button').addEventListener('click', function () {
    saveDenomination();  // Trigger save operation for denomination
});

// Save denomination function
function saveDenomination() {
    const denomination = document.getElementById('denomination-id').value.trim();
    const denominationAlias = document.getElementById('denomination-alias').value.trim();

   
    let data;

    // For "new4" mode, send the new denomination data
    if (mode4 === 'new4') {
        data = {
            denominationName: denomination,
            description: denominationAlias
        };
    }
    // For "edit4" mode, send the updated denomination data
    else if (mode4 === 'edit4') {
        data = {
            denominationName: selectedDenominationForEdit4.Denomination,
            description: selectedDenominationForEdit4.Description,
            newDenominationName: denomination,
            newDescription: denominationAlias
        };
    }

    const url = mode4 === 'edit4' ? '/edit-denomination' : '/add-denomination';

    // Disable the save button to prevent double submission
    document.getElementById('denomination-save-button').disabled = true;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send the appropriate data as JSON
    })
    .then(response => response.json())
    .then(data => {
        // Enable the save button again
        document.getElementById('denomination-save-button').disabled = false;

        if (data.success) {
            showCustomAlert(data.message);
            resetDenominationForm(); // Clear the form after successful submission
        } else {
            showCustomAlert(data.message); // Show failure message
        }
    })
    .catch(error => {
        document.getElementById('denomination-save-button').disabled = false;
        console.error('Error:', error);
        showCustomAlert('An error occurred while saving the denomination. Please try again.');
    });
}

// Set mode for denomination (either "new4" or "edit4")
function setMode4(newMode) {
    mode4 = newMode;
    if (mode4 === 'new4') {
        setNewMode4();  // Set to New Mode for denomination
    } else if (mode4 === 'edit4') {
        setEditMode4();  // Set to Edit Mode for denomination
    }
}

// Set form to "New Mode"
function setNewMode4() {
    document.getElementById('denomination-id').value = '';  // Clear denomination input
    document.getElementById('denomination-alias').value = '';  // Clear alias input
    document.getElementById('denomination-id').disabled = false;  // Enable denomination input
    document.getElementById('denomination-alias').disabled = false;  // Enable alias input
    document.getElementById('denomination-save-button').disabled = false;  // Enable Save button
}

// Set form to "Edit Mode"
function setEditMode4() {
    document.getElementById('denomination-id').disabled = false;  // Enable denomination input
    document.getElementById('denomination-alias').disabled = false;  // Enable alias input
    document.getElementById('denomination-save-button').disabled = false;  // Enable Save button
}

// Reset the denomination form after successful save or cancellation
function resetDenominationForm() {
    document.getElementById('denomination-id').value = '';  // Clear denomination input
    document.getElementById('denomination-alias').value = '';  // Clear alias input
    document.getElementById('denomination-save-button').disabled = true;  // Disable Save button
    document.getElementById('denomination-id').disabled = true;  // Disable denomination input
    document.getElementById('denomination-alias').disabled = true;  // Disable alias input
    mode4 = null;  // Reset mode to null
}

// Fetch denominations list for editing
function showDenominationsListForEdit() {
    const denominationListDiv = document.getElementById('denominationList');
    denominationListDiv.innerHTML = '';  // Clear previous suggestions
    denominationListDiv.style.display = 'none';  // Hide the list initially

    fetch('/fetchDenominationsForEdit')
        .then(response => response.json())
        .then(data => {
            if (data.denominations && data.denominations.length > 0) {
                displayDenominationsForEdit(data.denominations);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No denominations found';
                noResult.style.color = 'gray';
                denominationListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching denominations for edit:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching denominations';
            errorMessage.style.color = 'red';
            denominationListDiv.appendChild(errorMessage);
        });
}

// Display denominations for edit
function displayDenominationsForEdit(denominations) {
    const denominationListDiv = document.getElementById('denominationList');
    denominationListDiv.innerHTML = '';  // Clear previous suggestions

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();
        denominationListDiv.style.display = 'none';  // Hide the list
    };
    denominationListDiv.appendChild(closeButton);

    // Sort denominations alphabetically
    denominations.sort((a, b) => a.Denomination.localeCompare(b.Denomination));

    if (denominations.length > 0) {
        denominationListDiv.style.display = 'block';
        denominations.forEach(denomination => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${denomination.Denomination} - ${denomination.Description}`;

            // When clicked, set denomination for editing
            div.onclick = function () {
                setEditMode4();
                selectedDenominationForEdit4 = denomination;
                document.getElementById('denomination-id').value = denomination.Denomination;
                document.getElementById('denomination-alias').value = denomination.Description;
                denominationListDiv.style.display = 'none';  // Hide the list after selection
            };

            denominationListDiv.appendChild(div);
        });
    }
}

