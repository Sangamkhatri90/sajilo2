     let selectedQualification = null;  // To store the currently selected qualification

    // Function to fetch qualifications from the server and display the list
    function showQualificationsList() {
        const qualificationListDiv = document.getElementById('qualificationList');
        qualificationListDiv.innerHTML = ''; // Clear any existing data
        qualificationListDiv.style.display = 'none'; // Hide the list initially

        // Fetch qualification data from the server
        fetch('/fetchQualifications')
            .then(response => response.json())
            .then(data => {
                if (data.qualifications && data.qualifications.length > 0) {
                    allQualifications = data.qualifications;  // Store the fetched qualifications
                    displayQualifications(allQualifications); // Display the fetched qualifications
                } else {
                    const noResult = document.createElement('div');
                    noResult.textContent = 'No qualifications found';
                    noResult.style.color = 'gray';
                    qualificationListDiv.appendChild(noResult);
                }
            })
            .catch(error => {
                console.error('Error fetching qualifications:', error);
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error fetching qualifications';
                errorMessage.style.color = 'red';
                qualificationListDiv.appendChild(errorMessage);
            });
    }

    // Function to display qualifications in the suggestions list
    function displayQualifications(qualifications) {
        const qualificationListDiv = document.getElementById('qualificationList');
        qualificationListDiv.innerHTML = ''; // Clear previous suggestions

        // Create an "X" button to close the list
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.className = 'close-button'; // Add a class for styling
        closeButton.onclick = function (event) {
            event.preventDefault();  // Prevent default action like form submission
            qualificationListDiv.style.display = 'none';  // Hide the qualification list
        };

        qualificationListDiv.appendChild(closeButton); // Add the close button to the list

        // Sort the qualifications alphabetically
        qualifications.sort((a, b) => a.Qualification.localeCompare(b.Qualification));

        if (qualifications.length > 0) {
            qualificationListDiv.style.display = 'block'; // Show the suggestions list
            qualifications.forEach(qualification => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.textContent = `${qualification.Qualification} - ${qualification.Alias}`; // Show both Qualification and Alias

                // When a qualification is clicked, fill the input fields and store it
                div.onclick = function () {
                    document.getElementById('qualification-id').value = qualification.Qualification;
                    document.getElementById('qualification-alias').value = qualification.Alias;
                    selectedQualification = qualification;  // Store the selected qualification
                    qualificationListDiv.style.display = 'none'; // Hide the suggestions list
                };
                qualificationListDiv.appendChild(div);
            });
        }
    }

    // Function to delete the selected qualification
    function deleteQualification() {
  const qualificationId = document.getElementById('qualification-id').value.trim();
  const qualificationAlias = document.getElementById('qualification-alias').value.trim();

  // If no qualification is selected, show the list of qualifications
  if (!selectedQualification && !qualificationId) {
    showQualificationsList();  // Show the list to choose from
    return;
  }

  // Determine which qualification to delete
  const qualificationToDelete = selectedQualification ? selectedQualification.Qualification : qualificationId;

  // Validate again
  if (!qualificationToDelete) {
    showCustomAlert("Qualification and Alias are required.");
    return;
  }

   if(confirm(`Are you sure you want to delete the qualification "${qualificationToDelete}"?`)){

  fetch('/deleteQualification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qualificationName: qualificationToDelete })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Delete response:', data);

      if (data.success) {
        showCustomAlert(`Qualification "${qualificationToDelete}" deleted successfully.`);
        removeFromList(qualificationToDelete);
        resetSelection1();
      } else {
        showCustomAlert(data.message || "Failed to delete the qualification.");
        resetSelection1();
      }
    })
    .catch(error => {
      console.error('Error deleting qualification:', error);
      showCustomAlert("Error deleting qualification.");
      resetSelection1();
    });
  }
  else {
      // On cancel
      resetSelection1();
    }


}


    // Function to reset the qualification selection and input fields
    function resetSelection1() {
        selectedQualification = null;  // Clear the selected qualification

        // Clear input fields related to qualification
        document.getElementById('qualification-id').value = '';  // Clear the qualification input field
        document.getElementById('qualification-alias').value = '';  // Clear the alias input field

        // Optionally clear any other UI elements like the displayed qualification list
        const qualificationListDiv = document.getElementById('qualificationList');
        qualificationListDiv.innerHTML = '';  // Clear any remaining suggestions
        qualificationListDiv.style.display = 'none';  // Hide the qualification list if needed
    }

    // Function to remove the deleted qualification from the displayed list
    function removeFromList(qualificationName) {
        const qualificationListDiv = document.getElementById('qualificationList');
        const items = qualificationListDiv.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            if (item.textContent.includes(qualificationName)) {
                item.remove(); // Remove the qualification from the displayed list
            }
        });
    }
