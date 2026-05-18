
    let mode6 = null;  // Mode will be 'new6' for adding and 'edit6' for editing
let selectedVdcForEdit6 = null;  // Store the currently selected VDC for editing

// Prevent the traditional form submission and handle it with fetch
const myFormVdc = document.getElementById('myForm69');  // Form ID for VDC
myFormVdc.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent traditional form submission
    saveVdc();  // Call the save function for VDC
});

// VDC 'New6' button click event
document.getElementById('vdc-new-button').addEventListener('click', function () {
    setMode6('new6');  // Set the mode to "new6" for VDC
});

// VDC 'Edit6' button click event
document.getElementById('vdc-edit-button').addEventListener('click', function () {
    setMode6('edit6');  // Set the mode to "edit6" for VDC
    showVdcsListForEdit();  // Show VDCs list for editing
});

// VDC save button click event
document.getElementById('vdc-save-button').addEventListener('click', function () {
    saveVdc();  // Trigger save operation for VDC
});

// Save VDC function
function saveVdc() {
    const vdcElement = document.getElementById('vdc-id');
    const vdcaliasElement = document.getElementById('vdc-alias');

    // Check if the form elements exist
    if (!vdcElement || !vdcaliasElement) {
        showCustomAlert("Form elements are not found. Please check the form.");
        return;
    }

    const vdc = vdcElement.value.trim();
    const vdcalias = vdcaliasElement.value.trim();

    if (!vdc || !vdcalias) {
        showCustomAlert('VDC and Alias are required.');
        return;
    }

    let data;

    // For "new6" mode, send the new VDC data
    if (mode6 === 'new6') {
        data = { vdcmunicipality: vdc, vdcalias: vdcalias };
    }
    // For "edit6" mode, send the updated VDC data
    else if (mode6 === 'edit6') {
        data = {
            vdcmunicipality: selectedVdcForEdit6.Vdc,
            newVdcMunicipality: vdc,
            vdcalias: selectedVdcForEdit6.Alias,
            newVdcAlias: vdcalias
        };
    }

    const url = mode6 === 'edit6' ? '/edit-vdc-municipality' : '/add-vdc-municipality';

    // Disable the save button to prevent double submission
    document.getElementById('vdc-save-button').disabled = true;

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
        document.getElementById('vdc-save-button').disabled = false;

        if (data.success) {
            showCustomAlert(data.message);
            resetVdcForm(); // Clear the form after successful submission
        } else {
            showCustomAlert(data.message); // Show failure message
        }
    })
    .catch(error => {
        document.getElementById('vdc-save-button').disabled = false;
        console.error('Error:', error);
        showCustomAlert('An error occurred while saving the VDC. Please try again.');
    });
}

// Set mode for VDC (either "new6" or "edit6")
function setMode6(newMode) {
    mode6 = newMode;
    if (mode6 === 'new6') {
        setNewMode6();  // Set to New Mode for VDC
    } else if (mode6 === 'edit6') {
        setEditMode6();  // Set to Edit Mode for VDC
    }
}

// Set form to "New Mode"
function setNewMode6() {
    document.getElementById('vdc-id').value = '';  // Clear VDC input
    document.getElementById('vdc-alias').value = '';  // Clear Alias input
    document.getElementById('vdc-id').disabled = false;  // Enable VDC input
    document.getElementById('vdc-alias').disabled = false;  // Enable Alias input
    document.getElementById('vdc-save-button').disabled = false;  // Enable Save button
}

// Set form to "Edit Mode"
function setEditMode6() {
    document.getElementById('vdc-id').disabled = false;  // Enable VDC input
    document.getElementById('vdc-alias').disabled = false;  // Enable Alias input
    document.getElementById('vdc-save-button').disabled = false;  // Enable Save button
}

// Reset the VDC form after successful save or cancellation
function resetVdcForm() {
    document.getElementById('vdc-id').value = '';  // Clear VDC input
    document.getElementById('vdc-alias').value = '';  // Clear Alias input
    document.getElementById('vdc-save-button').disabled = true;  // Disable Save button
    document.getElementById('vdc-id').disabled = true;  // Disable VDC input
    document.getElementById('vdc-alias').disabled = true;  // Disable Alias input
    mode6 = null;  // Reset mode to null
}

// Fetch VDCs list for editing
function showVdcsListForEdit() {
    const vdcListDiv = document.getElementById('vdcList');
    vdcListDiv.innerHTML = '';  // Clear previous suggestions
    vdcListDiv.style.display = 'none';  // Hide the list initially

    fetch('/fetchVdcForEdit')
        .then(response => response.json())
        .then(data => {
            if (data.vdc && data.vdc.length > 0) {
                displayVdcsForEdit(data.vdc);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No VDCs found';
                noResult.style.color = 'gray';
                vdcListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching VDCs for edit:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching VDCs';
            errorMessage.style.color = 'red';
            vdcListDiv.appendChild(errorMessage);
        });
}

// Display VDCs for edit
function displayVdcsForEdit(vdcs) {
    const vdcListDiv = document.getElementById('vdcList');
    vdcListDiv.innerHTML = '';  // Clear previous suggestions

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();
        vdcListDiv.style.display = 'none';  // Hide the list
    };
    vdcListDiv.appendChild(closeButton);

    // Validate and filter VDCs to ensure each VDC has a valid 'Vdc' field
    const validVdcs = vdcs.filter(vdc => vdc.Vdc && typeof vdc.Vdc === 'string');

    // Sort VDCs by the 'Vdc' field (safely)
    validVdcs.sort((a, b) => {
        const vdcA = a.Vdc ? a.Vdc.toLowerCase() : '';
        const vdcB = b.Vdc ? b.Vdc.toLowerCase() : '';
        return vdcA.localeCompare(vdcB);
    });

    if (validVdcs.length > 0) {
        vdcListDiv.style.display = 'block';
        validVdcs.forEach(vdc => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${vdc.Vdc} - ${vdc.Alias}`;

            // When clicked, set VDC for editing
            div.onclick = function () {
                setEditMode6();
                selectedVdcForEdit6 = vdc;
                document.getElementById('vdc-id').value = vdc.Vdc;
                document.getElementById('vdc-alias').value = vdc.Alias;
                vdcListDiv.style.display = 'none';  // Hide the list after selection
            };

            vdcListDiv.appendChild(div);
        });
    } else {
        const noResult = document.createElement('div');
        noResult.textContent = 'No VDCs found';
        noResult.style.color = 'gray';
        vdcListDiv.appendChild(noResult);
    }
}

