// Add event listener to each row for selecting data to edit
document.querySelector('#resultsTable tbody').addEventListener('click', function (e) {
    const row = e.target.closest('tr');
    if (row) {
        // Assuming your table structure follows the same order as your SQL columns
        const cells = row.getElementsByTagName('td');
        const docClassData = {
            name: cells[0].innerText,
            alias: cells[1].innerText,
            address1: cells[2].innerText.split('/')[0],
            address2: cells[2].innerText.split('/')[1],
            phone1: cells[3].innerText.split('/')[0],
            phone2: cells[3].innerText.split('/')[1],
            fax: cells[4].innerText,
            email: cells[5].innerText,
            pan: cells[6].innerText,
            incomeTaxNo: cells[7].innerText
        };

        // Fill the form fields with the selected data
        document.querySelector('#myForm30 input[name="name"]').value = docClassData.name;
        document.querySelector('#myForm30 input[name="alias"]').value = docClassData.alias;
        document.querySelector('#myForm30 input[name="address1"]').value = docClassData.address1;
        document.querySelector('#myForm30 input[name="address2"]').value = docClassData.address2;
        document.querySelector('#myForm30 input[name="phone1"]').value = docClassData.phone1;
        document.querySelector('#myForm30 input[name="phone2"]').value = docClassData.phone2;
        document.querySelector('#myForm30 input[name="fax"]').value = docClassData.fax;
        document.querySelector('#myForm30 input[name="email"]').value = docClassData.email;
        document.querySelector('#myForm30 input[name="panNo"]').value = docClassData.pan;
        document.querySelector('#myForm30 input[name="income"]').value = docClassData.incomeTaxNo;

        // Show the form with populated values for editing
        document.getElementById('movableDiv30').style.display = 'block';
    }
});

// Add event listener for submitting the edited form
document.getElementById('#toggleButton80').addEventListener('click', function () {
    const formData = new FormData(document.querySelector('#myForm30'));
    fetch('/edit-doc-class', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        showCustomAlert('Data updated successfully');
        // Optionally refresh the table or update the UI
    })
    .catch(err => {
        console.error('Error:', err);
    });
});
