
    let mode1 = null;  // Mode for qualification will be 'new1' for adding and 'edit1' for editing
    let selectedQualificationForEdit = null;  // Store the currently selected qualification for editing

    // Prevent traditional form submission and handle it with fetch
    const myFormQualification = document.getElementById('myFrom53');  // Form ID for qualifications
    myFormQualification.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent traditional form submission to avoid double submit
        saveQualification();  // Call the save function for qualification
    });

    // Qualification 'New1' button click event
    document.getElementById('qualification-new-button').addEventListener('click', function () {
        setMode1('new1');  // Set the mode to "new1" for qualification
    });

    // Qualification 'Edit1' button click event
    document.getElementById('qualification-edit-button').addEventListener('click', function () {
        setMode1('edit1');  // Set the mode to "edit1" for qualification
        showQualificationsListForEdit();  // Show qualifications list for editing
    });

    // Qualification save button click event
    document.getElementById('qualification-save-button').addEventListener('click', function () {
        saveQualification();  // Trigger save operation for qualification
    });

    // Save qualification function
function saveQualification() {
  const qualification = document.getElementById('qualification-id').value.trim();
  const alias = document.getElementById('qualification-alias').value.trim();

  let data;

  if (mode1 === 'new1') {
    data = {
      qualification,
      alias
    };
  } else if (mode1 === 'edit1') {
    data = {
      qualificationName: selectedQualificationForEdit.Qualification,
      qualificationAlias: selectedQualificationForEdit.Alias,
      newQualificationName: qualification,
      newQualificationAlias: alias
    };
  }

  const url = mode1 === 'edit1' ? '/edit-qualification' : '/add-qualification';

  // Disable the save button to prevent double submission
  document.getElementById('qualification-save-button').disabled = true;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('qualification-save-button').disabled = false;

    if (data.success) {
      showCustomAlert(data.message);
      resetQualificationForm();
    } else {
      showCustomAlert(data.message || 'Operation failed. Please try again.');
    }
  })
  .catch(error => {
    document.getElementById('qualification-save-button').disabled = false;
    console.error('Error:', error);
    showCustomAlert('An error occurred while saving the qualification. Please try again.');
  });
}


    // Set mode for qualification (either "new1" or "edit1")
    function setMode1(newMode) {
        mode1 = newMode;
        if (mode1 === 'new1') {
            setNewMode1();  // Set to New Mode for qualification
        } else if (mode1 === 'edit1') {
            setEditMode1();  // Set to Edit Mode for qualification
        }
    }

    // Set form to "New Mode"
    function setNewMode1() {
        document.getElementById('qualification-id').value = '';  // Clear qualification input
        document.getElementById('qualification-alias').value = '';  // Clear alias input
        document.getElementById('qualification-id').disabled = false;  // Enable qualification input
        document.getElementById('qualification-alias').disabled = false;  // Enable alias input
        document.getElementById('qualification-save-button').disabled = false;  // Enable Save button
    }

    // Set form to "Edit Mode"
    function setEditMode1() {
        document.getElementById('qualification-id').disabled = false;  // Enable qualification input
        document.getElementById('qualification-alias').disabled = false;  // Enable alias input
        document.getElementById('qualification-save-button').disabled = false;  // Enable Save button
    }

    // Reset the qualification form after successful save or cancellation
    function resetQualificationForm() {
        document.getElementById('qualification-id').value = '';  // Clear qualification input
        document.getElementById('qualification-alias').value = '';  // Clear alias input
        document.getElementById('qualification-save-button').disabled = true;  // Disable Save button
        document.getElementById('qualification-id').disabled = true;  // Disable qualification input
        document.getElementById('qualification-alias').disabled = true;  // Disable alias input
        mode1 = null;  // Reset mode to null
    }

    // Fetch qualifications list for editing
    function showQualificationsListForEdit() {
        const qualificationListDiv = document.getElementById('qualificationList');
        qualificationListDiv.innerHTML = '';  // Clear previous suggestions
        qualificationListDiv.style.display = 'none';  // Hide the list initially

        fetch('/fetchQualificationsForEdit')
            .then(response => response.json())
            .then(data => {
                if (data.qualifications && data.qualifications.length > 0) {
                    displayQualificationsForEdit(data.qualifications);
                } else {
                    const noResult = document.createElement('div');
                    noResult.textContent = 'No qualifications found';
                    noResult.style.color = 'gray';
                    qualificationListDiv.appendChild(noResult);
                }
            })
            .catch(error => {
                console.error('Error fetching qualifications for edit:', error);
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error fetching qualifications';
                errorMessage.style.color = 'red';
                qualificationListDiv.appendChild(errorMessage);
            });
    }

    // Display qualifications for edit
    function displayQualificationsForEdit(qualifications) {
        const qualificationListDiv = document.getElementById('qualificationList');
        qualificationListDiv.innerHTML = '';  // Clear any existing content

        // Create a close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.className = 'close-button';
        closeButton.onclick = function (event) {
            event.preventDefault();
            qualificationListDiv.style.display = 'none';  // Hide the list
        };
        qualificationListDiv.appendChild(closeButton);

        // Sort qualifications alphabetically
        qualifications.sort((a, b) => a.Qualification.localeCompare(b.Qualification));

        if (qualifications.length > 0) {
            qualificationListDiv.style.display = 'block';
            qualifications.forEach(qualification => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = `${qualification.Qualification} - ${qualification.Alias}`;

                // When clicked, set qualification for editing
                div.onclick = function () {
                    setEditMode1();
                    selectedQualificationForEdit = qualification;
                    document.getElementById('qualification-id').value = qualification.Qualification;
                    document.getElementById('qualification-alias').value = qualification.Alias;
                    qualificationListDiv.style.display = 'none';  // Hide the list after selection
                };

                qualificationListDiv.appendChild(div);
            });
        }
    }
