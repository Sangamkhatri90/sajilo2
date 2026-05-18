 // Function to sort the table when a header is clicked
 function sortTable(table, n) {
    var rows = Array.from(table.querySelectorAll('tbody tr'));
    var dir = table.querySelectorAll('th.sortable')[n].classList.contains('asc') ? 'asc' : 'desc';

    // Reset all arrows
    table.querySelectorAll('th.sortable').forEach(header => {
      header.classList.remove('asc', 'desc');
    });

    // Sort the rows
    rows.sort(function(a, b) {
      var x = a.cells[n].textContent.trim().toLowerCase();
      var y = b.cells[n].textContent.trim().toLowerCase();

      if (dir === 'asc') {
        return x > y ? 1 : (x < y ? -1 : 0);
      } else {
        return x < y ? 1 : (x > y ? -1 : 0);
      }
    });

    // Apply the sorted rows to the table with requestAnimationFrame for smooth updates
    function applySortedRows() {
      rows.forEach(row => table.querySelector('tbody').appendChild(row));
      // Update the arrow direction
      table.querySelectorAll('th.sortable')[n].classList.add(dir === 'asc' ? 'asc' : 'desc');
    }

    requestAnimationFrame(applySortedRows);
  }

  // Attach event listeners to tables with the 'sortable-table' class
  document.querySelectorAll('.sortable-table').forEach(function(table) {
    const headers = table.querySelectorAll('th.sortable');
    headers.forEach(function(header, index) {
      header.addEventListener('click', function() {
        sortTable(table, index);
      });
    });
  });