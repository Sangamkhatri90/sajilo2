document.addEventListener('keydown', async function(event) {
    const itemsTable = document.getElementById('itemsTable');

    if (event.key === 'F2') {
        event.preventDefault();

        if (itemsTable.style.display === 'none' || !itemsTable.style.display) {
            try {
                const response = await fetch('http://localhost/items'); // Ensure this matches the correct path
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched items:', data);

                displayItemsInTable(data);
                itemsTable.style.display = 'block'; // Show the table
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        } else {
            itemsTable.style.display = 'none'; // Hide the table if it's already shown
        }
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        itemsTable.style.display = 'none'; // Hide the table when Escape is pressed
    }

    if(event.ctrlKey && event.key === 'o' || event.key === 'O'){
        event.preventDefault();
        window.location.href = '/organizationMaster.html';
    }
    if(event.ctrlKey && event.key === 'h' || event.key === 'H'){
        event.preventDefault();
        window.location.href = '/change-password';
    }
    if(event.key === 'F1'){
        event.preventDefault();
        window.location.href = 'content.html'
    }
    if(event.key === 'F7'){
        event.preventDefault();
        window.location.href = '/calculator.html'
    }
    if(event.key === 'F8'){
        event.preventDefault();
        window.location.href = '/shortcutkeys.html'
    }
    if(event.ctrlKey && event.key === 'u' || event.key === 'U'){
        event.preventDefault();
        window.location.href = 'userMaste.html'
    }
    if(event.ctrlKey && event.key === 'm' || event.key === 'M'){
        event.preventDefault();
        window.location.href = 'maturedAc.html'
    }
    if(event.ctrlKey && event.key === 'j' || event.key === 'J'){
        event.preventDefault();
        window.location.href = '/journalVoucher.html'
    }
    if(event.ctrlKey && event.key === 'F1'){
        event.preventDefault();
        window.location.href = '/transaction.html'
    }
    if(event.ctrlKey && event.key === 'F2'){
        event.preventDefault();
        window.location.href = '/receiptVoucher.html'
    }
    if(event.ctrlKey && event.key === 'F3'){
        event.preventDefault();
        window.location.href = '/paymentVoucher.html'
    }
    if(event.ctrlKey && event.key === 'F4'){
        event.preventDefault();
        window.location.href = '/collection.html'
    }
    if(event.ctrlKey && event.key === 'F5'){
        event.preventDefault();
        window.location.href = '/distribution.html'
    }
    if(event.ctrlKey && event.key === 'F6'){
        event.preventDefault();
        window.location.href = '/interestPosting.html'
    }
    if(event.ctrlKey && event.key === 'F7'){
        event.preventDefault();
        window.location.href = '/multipleTransactionVoucher.html'
    }
    if(event.ctrlKey && event.key === 'q'){
        event.preventDefault();
        if(showCustomConfirm('Do you want to exit sajilo')){
            window.location.href='index.html';
        }
    }
});

// Function to display items in a table with dynamic headers
function displayItemsInTable(items) {
    const table = document.getElementById('itemsTable');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    
    // Clear existing table content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Create table headers
    const headers = ['Account ID', 'Account Name', 'Account Type', 'Balance'];
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create table rows
    items.forEach(item => {
        const row = document.createElement('tr');
        const cells = [
            item.id,
            item.accName,
            item.acctype,
            item.balance
        ];

        cells.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });
}
