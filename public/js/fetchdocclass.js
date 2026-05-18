
  let allDocClassesForLogin = [];  // Store both DocClassName and DocClassAlias fetched from the server for login
let filteredDocClassesForLogin = [];  // Store filtered DocClassNames and DocClassAliases for login based on user input
let selectedRow = '';  // Store the selected row

// Function to fetch DocClassNames and DocClassAliases for login from the server and display them in a table
function fetchDocClassesForLogin(isInitialFocus) {
  const docClassesTableBody = document.getElementById('docClassesTableBody');
  docClassesTableBody.innerHTML = '';  // Clear any existing rows in the table

  if (allDocClassesForLogin.length === 0 || isInitialFocus) {
    // Fetch DocClassNames and DocClassAliases for login from the backend if not already fetched
    fetch('/fetchDocClassesForLogin')
      .then(response => response.json())
      .then(data => {
        if (data.docClasses && data.docClasses.length > 0) {
          allDocClassesForLogin = data.docClasses;  // Store fetched DocClassNames and DocClassAliases
          filteredDocClassesForLogin = [...allDocClassesForLogin];  // Initially show all DocClassNames
          displayDocClassesForLogin(filteredDocClassesForLogin);  // Display the full list in the table
        } else {
          const noResult = document.createElement('tr');
          const noResultCell = document.createElement('td');
          noResultCell.colSpan = 2;
          noResultCell.textContent = 'No DocClassNames found';
          noResultCell.style.color = 'gray';
          noResult.appendChild(noResultCell);
          docClassesTableBody.appendChild(noResult);
        }
      })
      .catch(error => {
        console.error('Error fetching DocClassNames:', error);
        const errorMessageRow = document.createElement('tr');
        const errorMessageCell = document.createElement('td');
        errorMessageCell.colSpan = 2;
        errorMessageCell.textContent = 'Error fetching DocClassNames';
        errorMessageCell.style.color = 'red';
        errorMessageRow.appendChild(errorMessageCell);
        docClassesTableBody.appendChild(errorMessageRow);
      });
  } else {
    displayDocClassesForLogin(filteredDocClassesForLogin);  // Display the filtered list in the table
  }
}

// Function to filter DocClassNames and DocClassAliases based on user input for login
function filterDocClassesForLogin() {
  const input = document.getElementById('docClassForLogin').value.toLowerCase();
  if (input === '') {
    filteredDocClassesForLogin = [...allDocClassesForLogin];  // Show the full list when input is empty
  } else {
    filteredDocClassesForLogin = allDocClassesForLogin.filter(item =>
      item.DocClassName.toLowerCase().includes(input) || item.DocClassAlias.toLowerCase().includes(input)
    );
  }
  displayDocClassesForLogin(filteredDocClassesForLogin);
}

// Function to display DocClassNames and DocClassAliases in the table
function displayDocClassesForLogin(names) {
  const docClassesTableBody = document.getElementById('docClassesTableBody');
  docClassesTableBody.innerHTML = '';  // Clear previous rows

  if (names.length > 0) {
    names.forEach(item => {
      const row = document.createElement('tr');
      
      // Create and append the cells for DocClassName and DocClassAlias
      const docClassCell = document.createElement('td');
      docClassCell.textContent = item.DocClassName;
      row.appendChild(docClassCell);

      const aliasCell = document.createElement('td');
      aliasCell.textContent = item.DocClassAlias;
      row.appendChild(aliasCell);

      // Add click event to select the row
      row.onclick = function () {
        selectRowFromTable(row, item.DocClassName);
      };

      docClassesTableBody.appendChild(row);
    });
  } else {
    // If no matches, show a "No results" message in the table
    const noResultRow = document.createElement('tr');
    const noResultCell = document.createElement('td');
    noResultCell.colSpan = 2;
    noResultCell.textContent = 'No matching DocClassNames found';
    noResultCell.style.color = 'gray';
    noResultRow.appendChild(noResultCell);
    docClassesTableBody.appendChild(noResultRow);
  }
}

// Function to select a row from the table and store the selected DocClass in sessionStorage
function selectRowFromTable(row, docClassName) {
    // If there is already a selected row, remove the selection
    if (selectedRow) {
      selectedRow.classList.remove('selected');  // Reset selection of previously selected row
    }
  
    // Set the new selected row
    selectedRow = row;
    selectedRow.classList.add('selected');  // Highlight selected row
  
    // Store the selected Document Class in sessionStorage
    sessionStorage.setItem('selectedDocClass', docClassName);
  
    // Populate all input fields with the selected Document Class
    const selectedFields = document.querySelectorAll('.selectedDocClass');
    selectedFields.forEach(field => {
      field.value = docClassName;  // Set the value of each input field
    });
  }

// Function to confirm the selection of the row (OK button)
// Removed alert confirmation, simply store the selected value and continue.
function selectRow() {

  window.location.href = '/index'

}

// Function to cancel the selection (Cancel button)
function cancelSelection() {
  if (selectedRow) {
    selectedRow.classList.remove('selected');  // Remove highlight from the selected row
    selectedRow = '';  // Clear the selected row
  }
  // Clear the selected document class in the input fields
  const selectedFields = document.querySelectorAll('.selectedDocClass');
  selectedFields.forEach(field => {
    field.value = '';  // Clear the value of each input field
  });
    window.location.href = '/index'
  sessionStorage.removeItem('selectedDocClass');
}

// Load the selected document class from sessionStorage when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Clear the selected document class from sessionStorage on page refresh
  sessionStorage.removeItem('selectedDocClass');
  
  // Make sure the input fields are cleared
  const selectedFields = document.querySelectorAll('.selectedDocClass');
  selectedFields.forEach(field => {
    field.value = '';  // Clear the value of each input field
  });

  fetchDocClassesForLogin(true);  // Fetch data on page load
});

