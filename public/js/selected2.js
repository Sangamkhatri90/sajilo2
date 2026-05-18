document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    let selectedRow = -1;

    // Helper function to select a row
    function selectRow(index) {
        const rows = tableBody.getElementsByTagName('tr'); // Fetch rows dynamically
        if (rows.length === 0) return; // Do nothing if there are no rows

        // Remove selection from all rows
        for (let i = 0; i < rows.length; i++) {
            rows[i].classList.remove('highlighted');
        }
        // Add selection to the current row
        if (index >= 0 && index < rows.length) {
            rows[index].classList.add('highlighted');
        }
    }

    // Function to handle arrow key navigation and looping
    function handleArrowNavigation(event) {
       
        const rows = tableBody.getElementsByTagName('tr'); // Fetch rows dynamically
        if (rows.length === 0) return; // Do nothing if there are no rows

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedRow = (selectedRow + 1) % rows.length; // Loop back to top when reaching the end
            selectRow(selectedRow);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedRow = (selectedRow - 1 + rows.length) % rows.length; // Loop back to bottom when reaching the top
            selectRow(selectedRow);
        }
    }



    // Attach keydown listener for arrow navigation
    document.addEventListener('keydown', handleArrowNavigation);

    // Attach search event to an input field or button (replace with your actual search event trigger)
    const searchButton = document.getElementById('dcm-searchFor'); // Assuming a search button exists
    searchButton.addEventListener('click', function() {
        const searchQuery = document.getElementById('searchInput').value; // Assuming an input field for search
        if (searchQuery) {
            searchDocClass(searchQuery); // Trigger search
        }
    });


 



});


    