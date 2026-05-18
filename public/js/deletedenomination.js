
    let selectedDenomination = null; // To store the selected denomination

// Fetch denominations from the backend
function showDenominationsList() {
    const denominationListDiv = document.getElementById('denominationList');
    denominationListDiv.innerHTML = ''; // Clear any existing content
    denominationListDiv.style.display = 'none'; // Hide the list initially

    fetch('/fetchDenominations')
        .then(response => response.json())
        .then(data => {
            if (data.denominations && data.denominations.length > 0) {
                displayDenominations(data.denominations);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No denominations found';
                denominationListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching denominations:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching denominations';
            denominationListDiv.appendChild(errorMessage);
        });
}

// Display fetched denominations in a list
function displayDenominations(denominations) {
    const denominationListDiv = document.getElementById('denominationList');
    denominationListDiv.innerHTML = ''; // Clear previous suggestions

    // Create an "X" button to close the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button'; // You can style it with this class
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action
        denominationListDiv.style.display = 'none'; // Hide the denomination list
    };

    denominationListDiv.appendChild(closeButton); // Add the close button to the list

    // Sort denominations alphabetically, ensuring 'Denomination' is treated as a string
    denominations.sort((a, b) => {
        const denomA = String(a.Denomination); // Convert to string if necessary
        const denomB = String(b.Denomination); // Convert to string if necessary
        return denomA.localeCompare(denomB);
    });

    denominationListDiv.style.display = 'block'; // Show the suggestions list

    denominations.forEach(denomination => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${denomination.Denomination} - ${denomination.Description}`; // Show both Denomination and Description

        // When a denomination is clicked, fill the input fields
        div.onclick = function () {
            document.getElementById('denomination-id').value = denomination.Denomination;
            document.getElementById('denomination-alias').value = denomination.Description;  // Corrected ID
            selectedDenomination = denomination;  // Store the selected denomination
            denominationListDiv.style.display = 'none'; // Hide the suggestion list
        };
        denominationListDiv.appendChild(div);
    });
}

// Delete denomination
function deleteDenomination() {
    const denominationId = document.getElementById('denomination-id') ? document.getElementById('denomination-id').value.trim() : '';
    const denominationDescription = document.getElementById('denomination-alias') ? document.getElementById('denomination-alias').value.trim() : '';  // Corrected ID

    // If no denomination is selected, show the denomination list
    if (!selectedDenomination && !denominationId) {
        showDenominationsList(); // Show the denomination list to choose from
        return;
    }

    const denominationToDelete = selectedDenomination ? selectedDenomination.Denomination : denominationId;

    if (!denominationToDelete) {
        showCustomAlert("Denomination and Description are required.");
        return; // Prevent deletion if no denomination is selected
    }

      if(confirm(`Are you sure you want to delete the selected denomination "${denominationToDelete}"?`)) {
        // Send the delete request to the server
        fetch('/deleteDenomination', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ denominationName: denominationToDelete })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showCustomAlert(`Denomination "${denominationToDelete}" deleted successfully.`);
                    removeFromList(denominationToDelete); // Remove the deleted denomination from the list
                    resetSelection5(); // Reset the form and selection after successful deletion
                } else {
                    showCustomAlert(data.message || "Failed to delete the denomination.");
                    resetSelection5();
                }
            })
            .catch(error => {
                console.error('Error deleting denomination:', error);
                showCustomAlert("Error deleting denomination.");
                resetSelection5();
            });
    }  else {
      // On cancel
      resetSelection5();
    }

}

// Remove the deleted denomination from the displayed list
function removeFromList(denominationName) {
    const denominationListDiv = document.getElementById('denominationList');
    const items = denominationListDiv.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        if (item.textContent.includes(denominationName)) {
            item.remove();
        }
    });
}

// Reset selection and input fields
function resetSelection5() {
    selectedDenomination = null;
    document.getElementById('denomination-id').value = '';
    document.getElementById('denomination-alias').value = '';  // Corrected ID
    const denominationListDiv = document.getElementById('denominationList');
    denominationListDiv.innerHTML = '';
    denominationListDiv.style.display = 'none';
}

