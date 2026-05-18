
let selectedDistrict = null;
let allDistricts = []; // Keep districts here

// Fetch and show districts
function showDistrictsList() {
    const districtListDiv = document.getElementById('districtList');
    districtListDiv.innerHTML = '';
    districtListDiv.style.display = 'none';

    fetch('/fetchDistricts')
        .then(response => response.json())
        .then(data => {
            if (data.districts && data.districts.length > 0) {
                allDistricts = data.districts;
                displayDistricts(allDistricts);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No districts found';
                noResult.style.color = 'gray';
                districtListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching districts:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching districts';
            errorMessage.style.color = 'red';
            districtListDiv.appendChild(errorMessage);
        });
}

// Display districts
function displayDistricts(districts) {
    const districtListDiv = document.getElementById('districtList');
    districtListDiv.innerHTML = '';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();
        districtListDiv.style.display = 'none';
    };
    districtListDiv.appendChild(closeButton);

    districts.sort((a, b) => a.District.localeCompare(b.District));

    if (districts.length > 0) {
        districtListDiv.style.display = 'block';

        districts.forEach(district => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${district.District} - ${district.Alias}`;

            div.onclick = function () {
                document.getElementById('district-id').value = district.District;
                document.getElementById('district-alias').value = district.Alias;
                selectedDistrict = district;
                districtListDiv.style.display = 'none';
            };

            districtListDiv.appendChild(div);
        });
    }
}

// Delete district (FULLY FIXED)
function deleteDistrict() {
    const districtId = document.getElementById('district-id').value.trim();

    if (!selectedDistrict && !districtId) {
        showDistrictsList();
        return;
    }

    const districtToDelete = selectedDistrict ? selectedDistrict.District : districtId;

    if (!districtToDelete) {
        showCustomAlert("District is required.");
        return;
    }

    // FIXED confirm() usage
    if (confirm(`Are you sure you want to delete the district "${districtToDelete}"?`)) {

        fetch('/deleteDistrict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ districtName: districtToDelete })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showCustomAlert(`District "${districtToDelete}" deleted successfully.`);
                removeFromList(districtToDelete);
                resetSelection();
            } else {
                showCustomAlert(data.message || "Failed to delete the district.");
                resetSelection();
            }
        })
        .catch(error => {
            console.error('Error deleting district:', error);
            showCustomAlert("Error deleting district. Please try again.");
            resetSelection();
        });

    } else {
        resetSelection(); // Cancel clicked
    }
}

// Reset selection
function resetSelection() {
    selectedDistrict = null;
    document.getElementById('district-id').value = '';
    document.getElementById('district-alias').value = '';

    const districtListDiv = document.getElementById('districtList');
    districtListDiv.innerHTML = '';
    districtListDiv.style.display = 'none';
}

// Remove deleted item from suggestions list
function removeFromList(districtName) {
    const districtListDiv = document.getElementById('districtList');
    const items = districtListDiv.querySelectorAll('.suggestion-item');

    items.forEach(item => {
        if (item.textContent.includes(districtName)) {
            item.remove();
        }
    });
}

