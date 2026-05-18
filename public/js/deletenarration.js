
    let selectedNarration = null; // To store the selected narration

// Fetch narrations from the backend
function showNarrationsList() {
    const narrationListDiv = document.getElementById('narrationList');
    narrationListDiv.innerHTML = ''; // Clear any existing content
    narrationListDiv.style.display = 'none'; // Hide the list initially

    fetch('/fetchNarrations')
        .then(response => response.json())
        .then(data => {
            if (data.narrations && data.narrations.length > 0) {
                displayNarrations(data.narrations);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No narrations found';
                narrationListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching narrations:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching narrations';
            narrationListDiv.appendChild(errorMessage);
        });
}

// Display fetched narrations in a list
function displayNarrations(narrations) {
    const narrationListDiv = document.getElementById('narrationList');
    narrationListDiv.innerHTML = ''; // Clear previous suggestions

    // Create an "X" button to close the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button'; // You can style it with this class
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action
        narrationListDiv.style.display = 'none'; // Hide the narration list
    };

    narrationListDiv.appendChild(closeButton); // Add the close button to the list

    // Sort narrations alphabetically
    narrations.sort((a, b) => {
        const narrationA = String(a.Narration); // Ensure it's treated as a string
        const narrationB = String(b.Narration); // Ensure it's treated as a string
        return narrationA.localeCompare(narrationB);
    });

    narrationListDiv.style.display = 'block'; // Show the suggestions list

    narrations.forEach(narration => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = narration.Narration; // Display only the Narration

        // When a narration is clicked, fill the input fields
        div.onclick = function () {
            document.getElementById('narration-id').value = narration.Narration;
            selectedNarration = narration;  // Store the selected narration
            narrationListDiv.style.display = 'none'; // Hide the suggestion list
        };
        narrationListDiv.appendChild(div);
    });
}

// Delete narration
function deleteNarration() {
    const narrationId = document.getElementById('narration-id') ? document.getElementById('narration-id').value.trim() : '';

    // If no narration is selected, show the narration list
    if (!selectedNarration && !narrationId) {
        showNarrationsList(); // Show the narration list to choose from
        return;
    }

    const narrationToDelete = selectedNarration ? selectedNarration.Narration : narrationId;

    if (!narrationToDelete) {
        showCustomAlert("Narration is required.");
        return; // Prevent deletion if no narration is selected
    }

    if(confirm(`Are you sure you want to delete the narration "${narrationToDelete}"?`))
     {
        // Send the delete request to the server
        fetch('/deleteNarration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ narration: narrationToDelete })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showCustomAlert(`Narration "${narrationToDelete}" deleted successfully.`);
                    removeFromList(narrationToDelete); // Remove the deleted narration from the list
                    resetSelection6(); // Reset the form and selection after successful deletion
                } else {
                    showCustomAlert(data.message || "Failed to delete the narration.");
                    resetSelection6();
                }
            })
            .catch(error => {
                console.error('Error deleting narration:', error);
                showCustomAlert("Error deleting narration.");
                resetSelection6();
            });
    }  else {
      // On cancel
      resetSelection6();
    }

}

// Remove the deleted narration from the displayed list
function removeFromList(narrationName) {
    const narrationListDiv = document.getElementById('narrationList');
    const items = narrationListDiv.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        if (item.textContent.includes(narrationName)) {
            item.remove();
        }
    });
}

// Reset selection and input fields
function resetSelection6() {
    selectedNarration = null;
    document.getElementById('narration-id').value = '';  // Reset narration ID field
    const narrationListDiv = document.getElementById('narrationList');
    narrationListDiv.innerHTML = '';
    narrationListDiv.style.display = 'none';
}
