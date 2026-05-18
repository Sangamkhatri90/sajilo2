
    let mode5 = null;  // Mode will be 'new5' for adding and 'edit5' for editing
let selectedNarrationForEdit5 = null;  // Store the currently selected narration for editing

// Prevent the traditional form submission and handle it with fetch
const myFormNarration = document.getElementById('myForm121');  // Form ID for narrations
myFormNarration.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent traditional form submission
    saveNarration();  // Call the save function for narration
});

// Narration 'New5' button click event
document.getElementById('narration-new-button').addEventListener('click', function () {
    setMode5('new5');  // Set the mode to "new5" for narration
});

// Narration 'Edit5' button click event
document.getElementById('narration-edit-button').addEventListener('click', function () {
    setMode5('edit5');  // Set the mode to "edit5" for narration
    showNarrationsListForEdit();  // Show narrations list for editing
});

// Narration save button click event
document.getElementById('narration-save-button').addEventListener('click', function () {
    saveNarration();  // Trigger save operation for narration
});

// Save narration function
function saveNarration() {
    const narration = document.getElementById('narration-id').value.trim();

    let data;

    // For "new5" mode, send the new narration data
    if (mode5 === 'new5') {
        data = { narration: narration };
    }
    // For "edit5" mode, send the updated narration data
    else if (mode5 === 'edit5') {
        data = {
            narration: selectedNarrationForEdit5.Narration,
            newNarration: narration
        };
    }

    const url = mode5 === 'edit5' ? '/edit-narration' : '/add-narration';

    // Disable the save button to prevent double submission
    document.getElementById('narration-save-button').disabled = true;

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
        document.getElementById('narration-save-button').disabled = false;

        if (data.success) {
            showCustomAlert(data.message);
            resetNarrationForm(); // Clear the form after successful submission
        } else {
            showCustomAlert(data.message); // Show failure message
        }
    })
    .catch(error => {
        document.getElementById('narration-save-button').disabled = false;
        console.error('Error:', error);
        showCustomAlert('An error occurred while saving the narration. Please try again.');
    });
}

// Set mode for narration (either "new5" or "edit5")
function setMode5(newMode) {
    mode5 = newMode;
    if (mode5 === 'new5') {
        setNewMode5();  // Set to New Mode for narration
    } else if (mode5 === 'edit5') {
        setEditMode5();  // Set to Edit Mode for narration
    }
}

// Set form to "New Mode"
function setNewMode5() {
    document.getElementById('narration-id').value = '';  // Clear narration input
    document.getElementById('narration-id').disabled = false;  // Enable narration input
    document.getElementById('narration-save-button').disabled = false;  // Enable Save button
}

// Set form to "Edit Mode"
function setEditMode5() {
    document.getElementById('narration-id').disabled = false;  // Enable narration input
    document.getElementById('narration-save-button').disabled = false;  // Enable Save button
}

// Reset the narration form after successful save or cancellation
function resetNarrationForm() {
    document.getElementById('narration-id').value = '';  // Clear narration input
    document.getElementById('narration-save-button').disabled = true;  // Disable Save button
    document.getElementById('narration-id').disabled = true;  // Disable narration input
    mode5 = null;  // Reset mode to null
}

// Fetch narrations list for editing
function showNarrationsListForEdit() {
    const narrationListDiv = document.getElementById('narrationList');
    narrationListDiv.innerHTML = '';  // Clear previous suggestions
    narrationListDiv.style.display = 'none';  // Hide the list initially

    fetch('/fetchNarrationsForEdit')
        .then(response => response.json())
        .then(data => {
            if (data.narrations && data.narrations.length > 0) {
                displayNarrationsForEdit(data.narrations);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No narrations found';
                noResult.style.color = 'gray';
                narrationListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching narrations for edit:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching narrations';
            errorMessage.style.color = 'red';
            narrationListDiv.appendChild(errorMessage);
        });
}

// Display narrations for edit
function displayNarrationsForEdit(narrations) {
    const narrationListDiv = document.getElementById('narrationList');
    narrationListDiv.innerHTML = '';  // Clear previous suggestions

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();
        narrationListDiv.style.display = 'none';  // Hide the list
    };
    narrationListDiv.appendChild(closeButton);

    // Validate and filter narrations to ensure each narration has a valid 'Narration' field
    const validNarrations = narrations.filter(narration => narration.Narration && typeof narration.Narration === 'string');

    // Sort narrations by the 'Narration' field (safely)
    validNarrations.sort((a, b) => {
        const narrationA = a.Narration ? a.Narration.toLowerCase() : '';
        const narrationB = b.Narration ? b.Narration.toLowerCase() : '';
        return narrationA.localeCompare(narrationB);
    });

    if (validNarrations.length > 0) {
        narrationListDiv.style.display = 'block';
        validNarrations.forEach(narration => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = narration.Narration;

            // When clicked, set narration for editing
            div.onclick = function () {
                setEditMode5();
                selectedNarrationForEdit5 = narration;
                document.getElementById('narration-id').value = narration.Narration;
                narrationListDiv.style.display = 'none';  // Hide the list after selection
            };

            narrationListDiv.appendChild(div);
        });
    } else {
        const noResult = document.createElement('div');
        noResult.textContent = 'No narrations found';
        noResult.style.color = 'gray';
        narrationListDiv.appendChild(noResult);
    }
}

