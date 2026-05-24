
                document.getElementById('executeBtn').addEventListener('click', () => {
                    const query = document.getElementById('queryTextarea').value;
                    const result = document.getElementById('results');
                    result.style.display = 'block';
                    // Send AJAX request to the server
                    fetch('/execute-query', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query }),
                    })
                        .then(response => response.text())
                        .then(data => {
                            document.getElementById('results').innerHTML = data;
                        })
                        .catch(err => {
                            document.getElementById('results').innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
                        });
                });
 
                
            
                document.addEventListener('DOMContentLoaded', () => {
                    const dropdown = document.getElementById('tablesDropdown');
                    const columnDropdown = document.getElementById('columnsDropdown');
                    const textarea = document.getElementById('queryTextarea');
                    const resetButton = document.getElementById('resetButton');
                    const result = document.getElementById('results');

                    // Function to fetch tables
                    async function loadTables() {
                        try {
                            const response = await fetch('/get-tables');

                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }

                            const tables = await response.json();

                            tables.forEach((table, index) => {
                                const option = document.createElement('option');
                                option.value = table.TABLE_NAME;
                                option.textContent = table.TABLE_NAME;
                                dropdown.appendChild(option);

                                // Automatically select the first table and load its columns
                                if (index === 0) {
                                    dropdown.value = table.TABLE_NAME;
                                    updateQueryAndColumns(table.TABLE_NAME);
                                }
                            });

                            // Add change event listener to load columns for the selected table
                            dropdown.addEventListener('change', () => {
                                const selectedTable = dropdown.value;
                                if (selectedTable) {
                                    updateQueryAndColumns(selectedTable);
                                }
                            });
                        } catch (error) {
                            console.error('Error loading tables:', error);

                        }
                    }

                    // Function to fetch columns of a specific table
                    async function loadColumns(tableName) {
                        try {
                            const response = await fetch(`/get-columns?table=${encodeURIComponent(tableName)}`);

                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }

                            const columns = await response.json();
                            columnDropdown.innerHTML = ''; // Clear existing columns

                            columns.forEach(column => {
                                const option = document.createElement('option');
                                option.value = column.COLUMN_NAME;
                                option.textContent = column.COLUMN_NAME;
                                columnDropdown.appendChild(option);
                            });
                        } catch (error) {
                            console.error('Error loading columns:', error);

                        }
                    }

                    // Function to update the query and load columns for the selected table
                    function updateQueryAndColumns(tableName) {
                        textarea.value = `SELECT * FROM ${tableName};`;
                        loadColumns(tableName);
                    }

                    // Reset the textarea when the reset button is clicked
                    resetButton.addEventListener('click', () => {
                        textarea.value = ''; // Clear the textarea
                        dropdown.selectedIndex = 0; // Reset the table dropdown to the default (disabled) option
                        result.style.display = 'none';

                    });

                    // Load tables when the DOM is fully loaded
                    loadTables();
                });
