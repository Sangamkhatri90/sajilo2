let selectedRowIndex = 0;
// Highlight selected row and update values in localStorage
function highlightRow(row) {
    const rows = document.querySelectorAll('#orgTableBody-p tr');
    rows.forEach((r) => r.classList.remove('highlight'));
    row.classList.add('highlight');
}
// Select row by index, highlight it, and store its data in localStorage
function selectRow(rowIndex) {
    const rows = document.querySelectorAll('#orgTableBody-p tr');
    if (rows[rowIndex]) {
        highlightRow(rows[rowIndex]);
        selectedRowIndex = rowIndex;
        const cells = rows[rowIndex].querySelectorAll('td');
        const orgName = cells[1].textContent;
        const startDate = cells[3].textContent;
        const endDate = cells[4].textContent;
        const address1 = rows[rowIndex].getAttribute('data-address1');
        const phone1 = rows[rowIndex].getAttribute('data-phone1');
        const dbName = rows[rowIndex].getAttribute('data-dbname');
        const orgID = rows[rowIndex].getAttribute('data-orgID');
        const Remarks = rows[rowIndex].getAttribute('data-remarks');
        console.log('SEEEE',orgID);
        // Store selected values in localStorage
        localStorage.setItem('selectedOrgName', orgName);
        localStorage.setItem('selectedStartDateLocal', startDate);
        localStorage.setItem('selectedEndDateLocal', endDate);
        localStorage.setItem('selectedAddress1', address1);
        localStorage.setItem('selectedPhone1', phone1);
        localStorage.setItem('selectedDBName', dbName); // Save DBName locally
        localStorage.setItem('selectedOrgID', orgID);
        localStorage.setItem('selectedOrgRemarks',Remarks)

        // Update input fields, if present
        
        document.getElementById('organization-name').value = orgName;
        
        
        document.getElementById('organization-name1').value = orgName;
        document.getElementById('startDateInput').value = startDate;
        document.getElementById('endDateInput').value = endDate;
        document.getElementById('dbNameInputs').value = dbName;
        document.getElementById('orgID').value = orgID;
        document.getElementById('orgarnizationremarkmp').value = Remarks;
    }
}
async function fetchOrgData() {
    try {
        const response = await fetch('/fetch-fiscal-data');
        const data = await response.json();

        const tableBody = document.getElementById('orgTableBody-p');
        tableBody.innerHTML = ''; // Clear the table

        data.forEach((item, index) => {
            // Ensure the date fields exist
            const startDate = item.startDate || 'No date found';
            const endDate = item.endDate || 'No date found';

            let startYear = 'Unknown';
            let endYear = 'Unknown';

            // Extract the year from the date strings if they are valid
            if (startDate.includes('-')) {
                startYear = startDate.split('-')[0]; // Get the first part of the date
            }
            if (endDate.includes('-')) {
                endYear = endDate.split('-')[0]; // Get the first part of the date
            }

            const fiscalYear = `${startYear}-${endYear}`; // Combine extracted years

            const row = document.createElement('tr');
            row.setAttribute('data-address1', item.orgAddress || 'N/A');
            row.setAttribute('data-phone1', item.orgPhone || 'N/A');
            row.setAttribute('data-dbname', item.orgDb || 'N/A');
            row.setAttribute('data-orgID', item.orgid);
            row.setAttribute('data-remarks',item.remarks || '');

            // Generate table row content
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.orgName || 'N/A'}</td>
                <td>${fiscalYear}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                
            `;

            tableBody.appendChild(row);
        });

        // Optionally auto-select the first row
        
    } catch (error) {
        console.error('Error fetching organization data:', error);
    }
}

function closetable(){
    document.getElementById('movableDiv81').style.display = 'none'; // Hide the table if it's already shown
}








// Row click event to update selected row data in localStorage
document.getElementById('orgTableBody-p').addEventListener('click', (event) => {
    if (event.target && event.target.nodeName === 'TD') {
        const row = event.target.parentNode;
        highlightRow(row);
        const cells = row.querySelectorAll('td');
        const orgName = cells[1].textContent;
        const startDate = cells[3].textContent;
        const endDate = cells[4].textContent;
        const address1 = row.getAttribute('data-address1');
        const phone1 = row.getAttribute('data-phone1');
        const dbName = row.getAttribute('data-dbname');
        const orgID = row.getAttribute('data-orgID');
        const Remarks = row.getAttribute('data-remarks');

        // Store the selected values in localStorage
        localStorage.setItem('selectedOrgName', orgName);
        localStorage.setItem('selectedStartDateLocal', startDate);
        localStorage.setItem('selectedEndDateLocal', endDate);
        localStorage.setItem('selectedAddress1', address1);
        localStorage.setItem('selectedPhone1', phone1);
        localStorage.setItem('selectedDBName', dbName); // Save DBName locally
        localStorage.setItem('selectedOrgID', orgID);
        localStorage.setItem('selectedOrgRemarks',Remarks)
        // Update input fields, if present
        
        document.getElementById('organization-name').value = orgName;
        document.getElementById('dbNameInputs').value = dbName;
        document.getElementById('organization-name1').value = orgName;
        document.getElementById('startDateInput').value = startDate;
        document.getElementById('endDateInput').value = endDate;
        document.getElementById('dbNameInputs').value = dbName;
        document.getElementById('orgID').value = orgID;
        document.getElementById('orgarnizationremarkmp').value = Remarks;

    }
});
// Fetch organization data when the page load
window.onload = () => {
    fetchOrgData();

    // Load saved data from localStorage, if available
    const savedOrgName = localStorage.getItem('selectedOrgName');
    const savedStartDateLocal = localStorage.getItem('selectedStartDateLocal');
    const savedEndDateLocal = localStorage.getItem('selectedEndDateLocal');

    if (savedOrgName && savedStartDate && savedEndDate) {
         document.getElementById('organization-name').value = savedOrgName;
        document.getElementById('organization-name1').value = savedOrgName;
        document.getElementById('startDateInput').value = savedStartDateLocal;
        document.getElementById('endDateInput').value = savedEndDateLocal;
    }
};

document.getElementById('cancelButton1454').addEventListener('click',function(){
    document.getElementById("movableDiv81").style.display='none'
})
document.getElementById('okyaaa').addEventListener('click',function(){
    document.getElementById("movableDiv81").style.display='none'
})

document.getElementById('login').addEventListener('click',function(){
   const login = document.getElementById('username-login').value;

   document.getElementById('username-login').value = login;
   localStorage.setItem('selectedusername', login);


});

const fiscalYearForm = document.querySelector('form[action="/clone-database-set-fiscal"]');
if (fiscalYearForm) {
    fiscalYearForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(fiscalYearForm);
        const fiscalYearStart = formData.get('fiscalYearStart');
        const fiscalYearEnd = formData.get('fiscalYearEnd');
        const orgID = formData.get('orgID');

        if (!orgID) {
            return showCustomAlert('Please select a database before saving fiscal year.');
        }

        try {
            const response = await fetch(fiscalYearForm.action, {
                method: fiscalYearForm.method,
                body: formData,
            });

            const result = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));

            if (!response.ok || !result.success) {
                return showCustomAlert(result.message || 'Unable to save fiscal year.');
            }

            // Update the hidden login fields so the site can continue without refresh
            document.getElementById('startDateInput').value = fiscalYearStart;
            document.getElementById('endDateInput').value = fiscalYearEnd;
            localStorage.setItem('selectedStartDateLocal', fiscalYearStart);
            localStorage.setItem('selectedEndDateLocal', fiscalYearEnd);

            document.getElementById('movableDivfiscalyear').style.display = 'none';
            fetchOrgData();
            showCustomAlert('Fiscal year saved. Please continue login.');
        } catch (error) {
            console.error('Fiscal year submit failed:', error);
            showCustomAlert('Unable to save fiscal year. Please try again.');
        }
    });
}


