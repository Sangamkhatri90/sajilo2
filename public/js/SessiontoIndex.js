

                document.addEventListener('DOMContentLoaded', () => {
                    const username = localStorage.getItem('selectedusername');
                    if (username) {
                        document.getElementById('username-p').innerText = `User: ${username}`;
                        document.getElementById('username-pr').value = `${username}`;
                    }

                    // Retrieve the latest selected values from localStorage
                    const orgName = localStorage.getItem('selectedOrgName') || 'N/A';
                    const startDateLocal = localStorage.getItem('selectedStartDateLocal') || 'No date found';
                    const endDateLocal = localStorage.getItem('selectedEndDateLocal') || 'No date found';
                    const address1 = localStorage.getItem('selectedAddress1') || 'N/A';
                    const phone1 = localStorage.getItem('selectedPhone1') || 'N/A';
                    const dbName = localStorage.getItem('selectedDBName') || 'N/A';
                    const remarks = localStorage.getItem('selectedOrgRemarks') || 'N/A';


                    console.log('values', orgName, startDateLocal)
                    // Display values in indicators
                    document.getElementById('organization-name').innerText = `${orgName}`;
                    document.getElementById('organization-address1').innerText = `${address1}`;
                    document.getElementById('organization-phone1').innerText = `${phone1}`;
                    document.getElementById('dbNameInputs').value = `${dbName}`;
                    document.getElementById('startDateInput').innerText = `Fiscal Start Date: ${startDateLocal}`;
                    document.getElementById('endDateInput').innerText = `Fiscal End Date: ${endDateLocal}`;

                    document.getElementById('setfiscalstartyear').innerText = `Fiscal Year : ${startDateLocal}`;
                    document.getElementById('setfiscalendyear').innerText = `To : ${endDateLocal}`;
                    document.getElementById('orgarnizationremarkmp').innerText = `${remarks}`;


                    // Update all elements with the class "start-date-local"
                    document.querySelectorAll('.start-date-local').forEach(element => {
                        if (element.tagName === 'INPUT') {
                            element.value = `${startDateLocal}`;
                        } else {
                            element.innerText = `${startDateLocal}`;
                        }
                    });



                    // Update all elements with the class "end-date-local"
                    document.querySelectorAll('.end-date-local').forEach(element => {
                        if (element.tagName === 'INPUT') {
                            element.value = `${endDateLocal}`;
                        } else {
                            element.innerText = `${endDateLocal}`;
                        }
                    });




                    // Update all elements with the class "start-date-local"
                    document.querySelectorAll('.org-user-master').forEach(element => {
                        if (element.tagName === 'INPUT') {
                            element.value = `${username}`;
                        } else {
                            element.innerText = `${username}`;
                        }
                    });
                });
