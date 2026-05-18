
    let selectedVdc = null;  // To store the currently selected VDC

// Function to fetch VDC/Municipality data and display the list
function showVdcList() {
    const vdcListDiv = document.getElementById('vdcList');
    vdcListDiv.innerHTML = ''; // Clear existing data
    vdcListDiv.style.display = 'none'; // Hide the list initially

    // Fetch VDC data from the server
    fetch('/fetchVdc')
        .then(response => response.json())
        .then(data => {
            if (data.vdc && data.vdc.length > 0) {
                displayVdc(data.vdc);  // Display the fetched VDCs
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No VDCs found';
                noResult.style.color = 'gray';
                vdcListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching VDCs:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching VDCs';
            errorMessage.style.color = 'red';
            vdcListDiv.appendChild(errorMessage);
        });
}

// Function to display VDC/Municipalities in the list
function displayVdc(vdcData) {
    const vdcListDiv = document.getElementById('vdcList');
    vdcListDiv.innerHTML = ''; // Clear previous suggestions

    // Sort the VDCs alphabetically by the 'Vdc' name
    vdcData.sort((a, b) => a.Vdc.localeCompare(b.Vdc));  // Sort alphabetically by 'Vdc'

    // Create close button to hide the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action
        vdcListDiv.style.display = 'none'; // Hide the list
    };
    vdcListDiv.appendChild(closeButton);

    vdcListDiv.style.display = 'block';  // Show the list

    // Display each VDC as a clickable item
    vdcData.forEach(vdc => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${vdc.Vdc} - ${vdc.Alias}`;  // Show both VDC and Alias

        // When a VDC is clicked, store it and fill the input fields
        div.onclick = function () {
            selectedVdc = vdc;  // Store the selected VDC
            document.getElementById('vdc-id').value = vdc.Vdc;
            document.getElementById('vdc-alias').value = vdc.Alias;
            vdcListDiv.style.display = 'none';  // Hide the suggestions list
            console.log("Selected VDC:", selectedVdc);
        };

        vdcListDiv.appendChild(div);  // Add to the list
    });
}

// Function to delete the selected VDC
function deleteVdc() {
    const vdcId = document.getElementById('vdc-id').value.trim();
    const vdcAlias = document.getElementById('vdc-alias').value.trim();

    // If no VDC is selected, show the list of VDCs
    if (!selectedVdc && !vdcId) {
        showVdcList();  // Show the list to choose from
        return;  // Stop further actions until a VDC is selected
    }

    // If a VDC is selected, proceed with deletion
    const vdcToDelete = selectedVdc ? selectedVdc.Vdc : vdcId;
    const aliasToDelete = selectedVdc ? selectedVdc.Alias : vdcAlias;

    // If no VDC or Alias are selected, show an error message
    if (!vdcToDelete || !aliasToDelete) {
        showCustomAlert("VDC and Alias are required.");
        return;
    }

    if(confirm(`Are you sure you want to delete the selected vdc "${vdcToDelete}"?`))  {
        // Send the delete request to the backend
        fetch('/deleteVdc', {
            method: 'POST',  // Ensure it's a POST request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vdcName: vdcToDelete})  // Send the VDC and Alias
        })
        .then(response => response.json())
        .then(data => {
            console.log("Delete Response Data:", data);

            if (data.success) {
                showCustomAlert(`VDC "${vdcToDelete}" deleted successfully.`);
                resetVdcSelection();  // Reset UI after successful deletion
            } else {
                showCustomAlert(data.message || "Failed to delete the VDC.");
                resetVdcSelection();  // Reset UI after failure
            }
        })
        .catch(error => {
            console.error('Error deleting VDC:', error);
            showCustomAlert("Error deleting VDC.");
            resetVdcSelection();  // Reset UI in case of error
        });
    } else {
      // On cancel
       resetVdcSelection();
    }

}

// Function to reset the selected VDC and input fields
function resetVdcSelection() {
    selectedVdc = null;  // Clear selected VDC
    document.getElementById('vdc-id').value = '';  // Clear the input field
    document.getElementById('vdc-alias').value = '';  // Clear the alias field
    const vdcListDiv = document.getElementById('vdcList');
    vdcListDiv.innerHTML = '';  // Clear the list
    vdcListDiv.style.display = 'none';  // Hide the list
}

