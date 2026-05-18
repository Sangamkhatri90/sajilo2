
let selectedProfession = null; // To store the selected profession

// Fetch professions from the backend
function showProfessionsList() {
    const professionListDiv = document.getElementById('professionList');
    professionListDiv.innerHTML = ''; // Clear any existing content
    professionListDiv.style.display = 'none'; // Hide the list initially

    fetch('/fetchProfessions')
        .then(response => response.json())
        .then(data => {
            if (data.professions && data.professions.length > 0) {
                displayProfessions(data.professions);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No professions found';
                professionListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching professions:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching professions';
            professionListDiv.appendChild(errorMessage);
        });
}

// Display fetched professions in a list
function displayProfessions(professions) {
    const professionListDiv = document.getElementById('professionList');
    professionListDiv.innerHTML = ''; // Clear previous suggestions

    // Create an "X" button to close the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button'; // You can style it with this class
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action
        professionListDiv.style.display = 'none'; // Hide the profession list
    };
    
    professionListDiv.appendChild(closeButton); // Add the close button to the list

    // Sort professions alphabetically
    professions.sort((a, b) => a.Profession.localeCompare(b.Profession));

    professionListDiv.style.display = 'block'; // Show the suggestions list

    professions.forEach(profession => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${profession.Profession} - ${profession.Alias}`; // Show both Profession and Alias

        // When a profession is clicked, fill the input fields
        div.onclick = function () {
            document.getElementById('profession-id').value = profession.Profession;
            document.getElementById('profession-alias').value = profession.Alias;
            selectedProfession = profession;  // Store the selected profession
            professionListDiv.style.display = 'none'; // Hide the suggestion list
        };
        professionListDiv.appendChild(div);
    });
}

// Delete profession
function deleteProfession() {
    const professionId = document.getElementById('profession-id').value.trim();
    const professionAlias = document.getElementById('profession-alias').value.trim();

    // If no profession is selected, show the profession list
    if (!selectedProfession && !professionId) {
        showProfessionsList(); // Show the profession list to choose from
        return;
    }

    const professionToDelete = selectedProfession ? selectedProfession.Profession : professionId;

    if (!professionToDelete) {
        showCustomAlert("Profession and Alias are required.");
        return; // Prevent deletion if no profession is selected
    }

   
    if(confirm(`Are you sure you want to delete the profession "${professionToDelete}"?`))
         {
        // Send the delete request to the server
        fetch('/deleteProfession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professionName: professionToDelete })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showCustomAlert(`Profession "${professionToDelete}" deleted successfully.`);
                    removeFromList(professionToDelete); // Remove the deleted profession from the list
                    resetSelection2(); // Reset the form and selection after successful deletion
                } else {
                    showCustomAlert(data.message || "Failed to delete the profession.");
                    resetSelection2();
                }
            })
            .catch(error => {
                console.error('Error deleting profession:', error);
                showCustomAlert("Error deleting profession.");
                resetSelection2();
            });
    }
    else {
      // On cancel
      resetSelection2();
    }

}

// Remove the deleted profession from the displayed list
function removeFromList(professionName) {
    const professionListDiv = document.getElementById('professionList');
    const items = professionListDiv.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        if (item.textContent.includes(professionName)) {
            item.remove();
        }
    });
}

// Reset selection and input fields (renamed to resetSelection2)
function resetSelection2() {
    selectedProfession = null;
    document.getElementById('profession-id').value = '';
    document.getElementById('profession-alias').value = '';
    const professionListDiv = document.getElementById('professionList');
    professionListDiv.innerHTML = '';
    professionListDiv.style.display = 'none';
}

