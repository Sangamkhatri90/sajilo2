
    document.querySelector('.toggle-link').addEventListener('click', function (event) {
        event.preventDefault();
        var targetId = event.target.getAttribute('data-target');
        var targetElement = document.getElementById(targetId);
        targetElement.classList.toggle('active');
    });

    document.getElementById('reset-button').addEventListener('click', function () {
        document.getElementById('searchButton').classList.remove('active');
    });
//color updown javascript 

    document.addEventListener('DOMContentLoaded', function() {
        let tableRows = document.querySelectorAll('#resultsTable tbody tr');
        let currentRowIndex = -1;
    
        document.addEventListener('keydown', function(e) {
           
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                // Remove highlight from the current row
                if (currentRowIndex >= 0 && tableRows[currentRowIndex]) {
                    tableRows[currentRowIndex].classList.remove('highlighted');
                }
                
                // Move to the next row
                currentRowIndex = Math.min(currentRowIndex + 1, tableRows.length - 1);
                
                // Highlight the new row
                if (tableRows[currentRowIndex]) {
                    tableRows[currentRowIndex].classList.add('highlighted');
                }
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                // Remove highlight from the current row
                if (currentRowIndex >= 0 && tableRows[currentRowIndex]) {
                    tableRows[currentRowIndex].classList.remove('highlighted');
                }
                
                // Move to the previous row
                currentRowIndex = Math.max(currentRowIndex - 1, 0);
                
                // Highlight the new row
                if (tableRows[currentRowIndex]) {
                    tableRows[currentRowIndex].classList.add('highlighted');
                }
            }
        });
    });
    