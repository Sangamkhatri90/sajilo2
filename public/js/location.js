// script.js
function togglePasswordVisibility() {
    const passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
    } else {
      passwordField.type = "password";
    }
  }
  
  // Function to get the user's current location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
  
    // Use OpenStreetMap's Nominatim API to reverse geocode the coordinates into a readable address
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Extract the location values in your desired format (without labels)
        const locationString = `${data.address.road || ''}, ${data.address.village || data.address.suburb || ''}, ${data.address.city || data.address.town || data.address.municipality || ''}, ${data.address.state || data.address.county || ''}`;
  
        // Display the location string directly on the page
        document.getElementById('locationDisplay').innerText = locationString;
      })
      .catch(error => {
        console.error('Error fetching location:', error);
      });
  }
  
  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  }
  
  // Call the function to get the location when the page loads
  window.onload = getLocation;
  