         let mode = null;  // Mode will be 'new' for adding and 'edit' for editing
        let selectedDistrictForEdit = null; // Store the currently selected district for editing

        // Prevent the traditional form submission and handle it with fetch
        const myForm = document.getElementById('myForm28');  // Renamed form to myForm to avoid redeclaration issue
        myForm.addEventListener('submit', function (event) {
            event.preventDefault();  // Prevent traditional form submission
            saveDistrict();  // Call the save function
        });

        // Button to handle 'New' mode
        document.getElementById('district-new-button').addEventListener('click', function () {
            setMode('new');  // Set the mode to "new" when the "New" button is clicked
        });

        // Button to handle 'Edit' mode
        document.getElementById('district-edit-button').addEventListener('click', function () {
            setMode('edit');  // Set the mode to "edit" when the "Edit" button is clicked
            showDistrictsListForEdit();  // Show the districts list for editing
        });

        // Save button listener
        document.getElementById('district-save-button').addEventListener('click', function () {
            saveDistrict();  // Trigger saving based on current mode
        });

        // Function to save district (either add or edit)// Function to save district (either add or edit)
function saveDistrict() {
  const district = document.getElementById('district-id').value.trim();
  const districtAlias = document.getElementById('district-alias').value.trim();

  let data;

  if (mode === 'new') {
    data = {
      district: district,
      districtalias: districtAlias
    };
  } else if (mode === 'edit') {
    data = {
      districtName: selectedDistrictForEdit.District,
      districtAlias: selectedDistrictForEdit.Alias,
      newDistrictName: district,
      newDistrictAlias: districtAlias
    };
  }

  const url = mode === 'edit' ? '/edit-district' : '/add-district';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(async response => {
      const result = await response.json();

      if (result.success) {
        showCustomAlert(result.message);
      } else {
        showCustomAlert(`Error: ${result.message}`);
      }

      document.getElementById('district-id').value = '';
      document.getElementById('district-alias').value = '';
      resetMode();
      selectedDistrictForEdit = null;
    })
    .catch(error => {
      console.error('Error:', error);
      showCustomAlert('An error occurred while saving the district. Please try again.');
      resetMode();
      selectedDistrictForEdit = null;
    });
}


        // Function to set the mode (either "new" or "edit")
        function setMode(newMode) {
            mode = newMode;  // Set mode to either "new" or "edit"
            if (mode === 'new') {
                setNewMode();  // Set to New Mode
            } else if (mode === 'edit') {
                setEditMode();  // Set to Edit Mode
            }
        }

        // Function to set the form in "New mode" (called when the user clicks the "New" button)
        function setNewMode() {
            document.getElementById('district-id').value = '';  // Clear the district input field
            document.getElementById('district-alias').value = '';  // Clear the alias input field
            document.getElementById('district-id').disabled = false;  // Enable the district input field
            document.getElementById('district-alias').disabled = false;  // Enable the alias input field
            document.getElementById('district-save-button').disabled = false;  // Enable Save button
        }

        // Function to set the form in "Edit mode" (called when a district is selected for editing)
        function setEditMode() {
            document.getElementById('district-id').disabled = false;  // Disable the district input field (it should not be editable)
            document.getElementById('district-alias').disabled = false;  // Enable the alias input field
            document.getElementById('district-save-button').disabled = false;  // Enable Save button
        }

        // Function to fetch and display districts for editing
        function showDistrictsListForEdit() {
            const districtListDiv = document.getElementById('districtList');
            districtListDiv.innerHTML = '';  // Clear any existing list
            districtListDiv.style.display = 'none';  // Hide the list initially

            // Fetch districts for edit
            fetch('/fetchDistrictsForEdit')  // API endpoint to get districts for editing
                .then(response => response.json())
                .then(data => {
                    if (data.districts && data.districts.length > 0) {
                        displayDistrictsForEdit(data.districts);  // Display fetched districts
                    } else {
                        const noResult = document.createElement('div');
                        noResult.textContent = 'No districts found';
                        noResult.style.color = 'gray';
                        districtListDiv.appendChild(noResult);
                    }
                })
                .catch(error => {
                    console.error('Error fetching districts for edit:', error);
                    const errorMessage = document.createElement('div');
                    errorMessage.textContent = 'Error fetching districts';
                    errorMessage.style.color = 'red';
                    districtListDiv.appendChild(errorMessage);
                });
        }

        // Function to display districts for edit
        function displayDistrictsForEdit(districts) {
            const districtListDiv = document.getElementById('districtList');
            districtListDiv.innerHTML = '';  // Clear previous suggestions

            // Create a close button for the list
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.className = 'close-button';  // Style for the close button
            closeButton.onclick = function (event) {
                event.preventDefault();
                districtListDiv.style.display = 'none';  // Hide the district list
            };
            districtListDiv.appendChild(closeButton);

            // Sort districts alphabetically
            districts.sort((a, b) => a.District.localeCompare(b.District));

            if (districts.length > 0) {
                districtListDiv.style.display = 'block';  // Show the list
                districts.forEach(district => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = `${district.District} - ${district.Alias}`;  // Show district and alias

                    // When a district is clicked, set it to Edit mode
                    div.onclick = function () {
                        setEditMode();
                        selectedDistrictForEdit = district;  // Store the selected district for editing
                        document.getElementById('district-id').value = district.District;  // Set the district name
                        document.getElementById('district-alias').value = district.Alias;  // Set the alias
                        districtListDiv.style.display = 'none';  // Hide the list
                    };

                    districtListDiv.appendChild(div);
                });
            }
        }

        // Function to reset mode back to null (after save or cancel/exit)
        function resetMode() {
            mode = null;  // Reset mode to null
            document.getElementById('district-save-button').disabled = true;  // Disable Save button
            document.getElementById('district-id').disabled = true;  // Disable district input field
            document.getElementById('district-alias').disabled = true;  // Disable alias input field
            document.getElementById('district-id').value = '';  // Clear district input
            document.getElementById('district-alias').value = '';  // Clear alias input
        }
