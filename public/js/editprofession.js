
    let mode2 = null;  // Mode will be 'new2' for adding and 'edit2' for editing
    let selectedProfessionForEdit2 = null;  // Store the currently selected profession for editing

    // Prevent the traditional form submission and handle it with fetch
    const myFormProfession = document.getElementById('myForm52');  // Form ID for professions
    myFormProfession.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent traditional form submission
        saveProfession();  // Call the save function for profession
    });

    // Profession 'New2' button click event
    document.getElementById('profession-new-button').addEventListener('click', function () {
        setMode2('new2');  // Set the mode to "new2" for profession
    });

    // Profession 'Edit2' button click event
    document.getElementById('profession-edit-button').addEventListener('click', function () {
        setMode2('edit2');  // Set the mode to "edit2" for profession
        showProfessionsListForEdit2();  // Show professions list for editing
    });

    // Profession save button click event
    document.getElementById('profession-save-button').addEventListener('click', function () {
        saveProfession();  // Trigger save operation for profession
    });

    // Save profession function
    function saveProfession() {
        const profession = document.getElementById('profession-id').value.trim();
        const professionAlias = document.getElementById('profession-alias').value.trim();

        let data;

        // For "new2" mode, send the new profession data
        if (mode2 === 'new2') {
            data = {
                profession: profession,
                professionalias: professionAlias
            };
        }
        // For "edit2" mode, send the updated profession data
        else if (mode2 === 'edit2') {
            data = {
                professionName: selectedProfessionForEdit2.Profession,
                professionAlias: selectedProfessionForEdit2.Alias,
                newProfessionName: profession,
                newProfessionAlias: professionAlias
            };
        }

        const url = mode2 === 'edit2' ? '/editprofession' : '/add-profession';

        // Disable the save button to prevent double submission
        document.getElementById('profession-save-button').disabled = true;

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
            document.getElementById('profession-save-button').disabled = false;

            if (data.success) {
                showCustomAlert(data.message);
                resetProfessionForm(); // Clear the form after successful submission
            } else {
                showCustomAlert(data.message); // Show failure message
            }
        })
        .catch(error => {
            document.getElementById('profession-save-button').disabled = false;
            console.error('Error:', error);
            showCustomAlert('An error occurred while saving the profession. Please try again.');
        });
    }

    // Set mode for profession (either "new2" or "edit2")
    function setMode2(newMode) {
        mode2 = newMode;
        if (mode2 === 'new2') {
            setNewMode2();  // Set to New Mode for profession
        } else if (mode2 === 'edit2') {
            setEditMode2();  // Set to Edit Mode for profession
        }
    }

    // Set form to "New Mode"
    function setNewMode2() {
        document.getElementById('profession-id').value = '';  // Clear profession input
        document.getElementById('profession-alias').value = '';  // Clear alias input
        document.getElementById('profession-id').disabled = false;  // Enable profession input
        document.getElementById('profession-alias').disabled = false;  // Enable alias input
        document.getElementById('profession-save-button').disabled = false;  // Enable Save button
    }

    // Set form to "Edit Mode"
    function setEditMode2() {
        document.getElementById('profession-id').disabled = false;  // Enable profession input
        document.getElementById('profession-alias').disabled = false;  // Enable alias input
        document.getElementById('profession-save-button').disabled = false;  // Enable Save button
    }

    // Reset the profession form after successful save or cancellation
    function resetProfessionForm() {
        document.getElementById('profession-id').value = '';  // Clear profession input
        document.getElementById('profession-alias').value = '';  // Clear alias input
        document.getElementById('profession-save-button').disabled = true;  // Disable Save button
        document.getElementById('profession-id').disabled = true;  // Disable profession input
        document.getElementById('profession-alias').disabled = true;  // Disable alias input
        mode2 = null;  // Reset mode to null
    }

    // Fetch professions list for editing
    function showProfessionsListForEdit2() {
        const professionListDiv = document.getElementById('professionList');
        professionListDiv.innerHTML = '';  // Clear previous suggestions
        professionListDiv.style.display = 'none';  // Hide the list initially

        fetch('/fetchProfessionsForEdit')
            .then(response => response.json())
            .then(data => {
                if (data.professions && data.professions.length > 0) {
                    displayProfessionsForEdit2(data.professions);
                } else {
                    const noResult = document.createElement('div');
                    noResult.textContent = 'No professions found';
                    noResult.style.color = 'gray';
                    professionListDiv.appendChild(noResult);
                }
            })
            .catch(error => {
                console.error('Error fetching professions for edit:', error);
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error fetching professions';
                errorMessage.style.color = 'red';
                professionListDiv.appendChild(errorMessage);
            });
    }

    // Display professions for edit
    function displayProfessionsForEdit2(professions) {
        const professionListDiv = document.getElementById('professionList');
        professionListDiv.innerHTML = '';  // Clear previous suggestions

        // Create a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.className = 'close-button';
        closeButton.onclick = function (event) {
            event.preventDefault();
            professionListDiv.style.display = 'none';  // Hide the list
        };
        professionListDiv.appendChild(closeButton);

        // Sort professions alphabetically
        professions.sort((a, b) => a.Profession.localeCompare(b.Profession));

        if (professions.length > 0) {
            professionListDiv.style.display = 'block';
            professions.forEach(profession => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = `${profession.Profession} - ${profession.Alias}`;

                // When clicked, set profession for editing
                div.onclick = function () {
                    setEditMode2();
                    selectedProfessionForEdit2 = profession;
                    document.getElementById('profession-id').value = profession.Profession;
                    document.getElementById('profession-alias').value = profession.Alias;
                    professionListDiv.style.display = 'none';  // Hide the list after selection
                };

                professionListDiv.appendChild(div);
            });
        }
    }
