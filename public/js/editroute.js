let mode3 = null;  // Mode will be 'new3' for adding and 'edit3' for editing
let selectedRouteForEdit3 = null;  // Store the currently selected route for editing

// Prevent the traditional form submission and handle it with fetch
const myFormRoute = document.getElementById('myForm92');  // Form ID for routes
myFormRoute.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent traditional form submission
    saveRoute();  // Call the save function for route
});

// Route 'New3' button click event
document.getElementById('routem-new-button').addEventListener('click', function () {
    setMode3('new3');  // Set the mode to "new3" for route
});

// Route 'Edit3' button click event
document.getElementById('routem-edit-button').addEventListener('click', function () {
    setMode3('edit3');  // Set the mode to "edit3" for route
    showRoutesListForEdit3();  // Show routes list for editing
});

// Route save button click event
document.getElementById('routem-save-button').addEventListener('click', function () {
    saveRoute();  // Trigger save operation for route
});

// Save route function
function saveRoute() {
    const route = document.getElementById('routem-id').value.trim();
    const routeAlias = document.getElementById('routem-alias').value.trim();

    let data;

    // For "new3" mode, send the new route data
    if (mode3 === 'new3') {
        data = {
            route: route,
            routealias: routeAlias
        };
    }
    // For "edit3" mode, send the updated route data
    else if (mode3 === 'edit3') {
        data = {
            routeName: selectedRouteForEdit3.Route,
            routeAlias: selectedRouteForEdit3.Alias,
            newRouteName: route,
            newRouteAlias: routeAlias
        };
    }

    const url = mode3 === 'edit3' ? '/edit-route' : '/add-routemaster';

    // Disable the save button to prevent double submission
    document.getElementById('routem-save-button').disabled = true;

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
        document.getElementById('routem-save-button').disabled = false;

        if (data.success) {
            showCustomAlert(data.message);
            resetRouteForme(); // Clear the form after successful submission
        } else {
            showCustomAlert(data.message); // Show failure message
            
        }
    })
    .catch(error => {
        document.getElementById('routem-save-button').disabled = false;
        console.error('Error:', error);
    
        showCustomAlert('An error occurred while saving the route. Please try again.');
        
    });
}

// Set mode for route (either "new3" or "edit3")
function setMode3(newMode) {
    mode3 = newMode;
    if (mode3 === 'new3') {
        setNewMode3();  // Set to New Mode for route
    } else if (mode3 === 'edit3') {
        setEditMode3();  // Set to Edit Mode for route
    }
}

// Set form to "New Mode"
function setNewMode3() {
    document.getElementById('routem-id').value = '';  // Clear route input
    document.getElementById('routem-alias').value = '';  // Clear alias input
    document.getElementById('routem-id').disabled = false;  // Enable route input
    document.getElementById('routem-alias').disabled = false;  // Enable alias input
    document.getElementById('routem-save-button').disabled = false;  // Enable Save button
}

// Set form to "Edit Mode"
function setEditMode3() {
    document.getElementById('routem-id').disabled = false;  // Enable route input
    document.getElementById('routem-alias').disabled = false;  // Enable alias input
    document.getElementById('routem-save-button').disabled = false;  // Enable Save button
}

// Reset the route form after successful save or cancellation
function resetRouteForme() {
    
    document.getElementById('routem-id').value = '';  // Clear route input
    document.getElementById('routem-alias').value = '';  // Clear alias input
    document.getElementById('routem-save-button').disabled = true;  // Disable Save button
    document.getElementById('routem-id').disabled = true;  // Disable route input
    document.getElementById('routem-alias').disabled = true;  // Disable alias input
    mode3 = null;  // Reset mode to null
}

// Fetch routes list for editing
function showRoutesListForEdit3() {
    const routeListDiv = document.getElementById('routeList');
    routeListDiv.innerHTML = '';  // Clear previous suggestions
    routeListDiv.style.display = 'none';  // Hide the list initially

    fetch('/fetchRoutesForEdit')
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                displayRoutesForEdit3(data.routes);
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No routes found';
                noResult.style.color = 'gray';
                routeListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching routes for edit:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching routes';
            errorMessage.style.color = 'red';
            routeListDiv.appendChild(errorMessage);
        });
}

// Display routes for edit
function displayRoutesForEdit3(routes) {
    const routeListDiv = document.getElementById('routeList');
    routeListDiv.innerHTML = '';  // Clear previous suggestions

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function (event) {
        event.preventDefault();
        routeListDiv.style.display = 'none';  // Hide the list
    };
    routeListDiv.appendChild(closeButton);

    // Sort routes alphabetically
    routes.sort((a, b) => a.Route.localeCompare(b.Route));

    if (routes.length > 0) {
        routeListDiv.style.display = 'block';
        routes.forEach(route => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${route.Route} - ${route.Alias}`;

            // When clicked, set route for editing
            div.onclick = function () {
                setEditMode3();
                selectedRouteForEdit3 = route;
                document.getElementById('routem-id').value = route.Route;
                document.getElementById('routem-alias').value = route.Alias;
                routeListDiv.style.display = 'none';  // Hide the list after selection
            };

            routeListDiv.appendChild(div);
        });
    }
}
