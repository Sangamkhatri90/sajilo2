document.getElementById('aa-ok-button').addEventListener('click', async function(event) {
    event.preventDefault();  // Prevent form submission

    // Get the states of the checkboxes
    const selectAllChecked = document.getElementById('select-all').checked;
    const summaryOnlyChecked = document.getElementById('summary-only').checked;
    const memberDetailsChecked = document.getElementById('show-zero-balance').checked;

    // Clear previous results (if any)
    const tableBody = document.querySelector('#member-details-table tbody');
    tableBody.innerHTML = '';
    const professionTableBody = document.querySelector('#professionTable tbody');
    professionTableBody.innerHTML = '';
    const qualificationTableBody = document.querySelector('#qualificationTable tbody');
    qualificationTableBody.innerHTML = '';

    // If "Member Details" is checked, show the separate div for results (accountanalysisresult)
    if (memberDetailsChecked) {
        document.getElementById('accountanalysisresult').style.display = 'block';

        // Sample data for Member Details (replace with dynamic data)
        const data = [
            { sn: 1, particulars: 'Account A', number: '12345' },
            { sn: 2, particulars: 'Account B', number: '67890' },
            { sn: 3, particulars: 'Account C', number: '54321' }
        ];

        // Populate Member Details Table
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.sn}</td><td>${item.particulars}</td><td>${item.number}</td>`;
            tableBody.appendChild(row);
        });

        document.getElementById('action-buttons').style.display = 'block';
    } else {
        document.getElementById('accountanalysisresult').style.display = 'none';
    }

    // If "Summary" checkbox is checked, show the summary data tables (Profession & Qualification)
    if (summaryOnlyChecked) {
        document.getElementById('summary-data').style.display = 'block';

        // Get the date range values
        const startDate = document.getElementById('nepali-date').value;
        const endDate = document.getElementById('nepali-date1').value;

        try {
            // Fetch data for profession and qualification (replace with your API endpoint)
            const response = await fetch('/fetch-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const { professions, qualifications } = await response.json();

            // Populate Profession Table
            professionTableBody.innerHTML = professions.map(prof => `
                <tr>
                    <td>${prof.Profession}</td>
                    <td>${prof.TotalCount}</td>
                    <td>${prof.MaleCount}</td>
                    <td>${prof.FemaleCount}</td>
                </tr>
            `).join('');

            // Populate Qualification Table
            qualificationTableBody.innerHTML = qualifications.map(qual => `
                <tr>
                    <td>${qual.Qualification}</td>
                    <td>${qual.TotalCount}</td>
                    <td>${qual.MaleCount}</td>
                    <td>${qual.FemaleCount}</td>
                </tr>
            `).join('');

        } catch (error) {
            console.error(error);
            showCustomAlert('An error occurred while fetching data.');
        }

    } else {
        document.getElementById('summary-data').style.display = 'none';
    }
});

// Cancel button action (for movableDiv1)
document.getElementById('cancelButton1').addEventListener('click', function() {
    document.getElementById('myForm1').reset();
    document.getElementById('accountanalysisresult').style.display = 'none';
    document.getElementById('summary-data').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'none';
});

// Close button for accountanalysisresult
document.getElementById('accountanalysisclosebutton').addEventListener('click', function() {
    document.getElementById('accountanalysisresult').style.display = 'none';
    document.getElementById('summary-data').style.display = 'none';
});
