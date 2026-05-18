
    let selectedRoute = null;  // To store the currently selected route

// Function to fetch routes from the server and display the list
function showRouteList() {
    const routeListDiv = document.getElementById('routeList');
    routeListDiv.innerHTML = ''; // Clear any existing data
    routeListDiv.style.display = 'none'; // Hide the list initially

    // Fetch route data from the server
    fetch('/fetchRoute')
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                allRoutes = data.routes;  // Store the fetched routes
                displayRoutes(allRoutes); // Display the fetched routes
            } else {
                const noResult = document.createElement('div');
                noResult.textContent = 'No routes found';
                noResult.style.color = 'gray';
                routeListDiv.appendChild(noResult);
            }
        })
        .catch(error => {
            console.error('Error fetching routes:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error fetching routes';
            errorMessage.style.color = 'red';
            routeListDiv.appendChild(errorMessage);
        });
}

// Function to display routes in the suggestions list
function displayRoutes(routes) {
    const routeListDiv = document.getElementById('routeList');
    routeListDiv.innerHTML = ''; // Clear previous suggestions

    // Create an "X" button to close the list
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button'; // Add a class for styling
    closeButton.onclick = function (event) {
        event.preventDefault();  // Prevent default action like form submission
        routeListDiv.style.display = 'none';  // Hide the route list
    };

    routeListDiv.appendChild(closeButton); // Add the close button to the list

    // Sort the routes alphabetically
    routes.sort((a, b) => a.Route.localeCompare(b.Route));

    if (routes.length > 0) {
        routeListDiv.style.display = 'block'; // Show the suggestions list
        routes.forEach(route => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${route.Route} - ${route.Alias}`; // Show both Route and Alias

            // When a route is clicked, fill the input fields and store it
            div.onclick = function () {
                document.getElementById('routem-id').value = route.Route;
                document.getElementById('routem-alias').value = route.Alias;
                selectedRoute = route;  // Store the selected route
                routeListDiv.style.display = 'none'; // Hide the suggestions list
            };
            routeListDiv.appendChild(div);
        });
    }
}

// Function to delete the selected route
function deleteRoute() {
    // Get route input elements
    const routeIdElement = document.getElementById('routem-id');
    const routeAliasElement = document.getElementById('routem-alias');

    // Check if the elements are found
    if (!routeIdElement || !routeAliasElement) {
        showCustomAlert("Required elements not found.");
        return;  // Prevent further actions if the elements don't exist
    }

    const routeId = routeIdElement.value.trim();
    const routeAlias = routeAliasElement.value.trim();

    // If no route is selected, show the list of routes
    if (!selectedRoute && !routeId) {
        showRouteList();  // Show the list of routes to choose from
        return; // Prevent further actions until a route is selected
    }

    // If a route is selected, proceed with deletion
    const routeToDelete = selectedRoute ? selectedRoute.Route : routeId;

    // If a route is still not selected, show error and prevent deletion
    if (!routeToDelete) {
        showCustomAlert("Route and Alias are required.");
        return;  // Prevent further actions
    }

   

    if(confirm(`Are you sure you want to delete the route "${routeToDelete}"?`)) {
        // Send a request to delete the route
        fetch('/deleteRoute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ routeName: routeToDelete })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Delete response:', data);  // Log for debugging

                if (data.success) {
                    showCustomAlert(`Route "${routeToDelete}" deleted successfully.`);
                    removeFromList(routeToDelete);  // Remove the deleted route from the list
                    resetSelection4();  // Reset selection and inputs after successful deletion
                } else {
                    showCustomAlert(data.message || "Failed to delete the route.");
                    resetSelection4();  // Reset selection even if deletion failed
                }
            })
            .catch(error => {
                console.error('Error deleting route:', error);
                showCustomAlert("Error deleting route.");
                resetSelection4();  // Ensure we reset even in case of error
            });

    } else {
      // On cancel
      resetSelection4();
    }

}

// Function to reset the route selection and input fields
function resetSelection4() {
    selectedRoute = null;  // Clear the selected route

    // Clear input fields
    document.getElementById('routem-id').value = '';  // Clear the route input field
    document.getElementById('routem-alias').value = '';  // Clear the alias input field

    // Optionally clear any other UI elements like the displayed route list
    const routeListDiv = document.getElementById('routeList');
    routeListDiv.innerHTML = '';  // Clear any remaining suggestions
    routeListDiv.style.display = 'none';  // Hide the route list if needed
}

// Function to remove the deleted route from the displayed list
function removeFromList(routeName) {
    const routeListDiv = document.getElementById('routeList');
    const items = routeListDiv.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        if (item.textContent.includes(routeName)) {
            item.remove(); // Remove the route from the displayed list
        }
    });
}

