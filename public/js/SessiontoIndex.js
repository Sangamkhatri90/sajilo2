

                document.addEventListener('DOMContentLoaded', () => {
                    const username = localStorage.getItem('selectedusername');
                    if (username) {
                        document.getElementById('username-p').innerText = `User: ${username}`;
                        document.getElementById('username-pr').value = `${username}`;
                    }

                    // Retrieve the latest selected values from localStorage
                    const orgName = localStorage.getItem('selectedOrgName') || 'N/A';
                    const savedStartDateLocal = localStorage.getItem('selectedStartDateLocal');
                    const savedEndDateLocal = localStorage.getItem('selectedEndDateLocal');
                    const address1 = localStorage.getItem('selectedAddress1') || 'N/A';
                    const phone1 = localStorage.getItem('selectedPhone1') || 'N/A';
                    const dbName = localStorage.getItem('selectedDBName') || 'N/A';
                    const remarks = localStorage.getItem('selectedOrgRemarks') || 'N/A';


                    // A date input only accepts an ISO value (YYYY-MM-DD). Fiscal
                    // dates may also be stored as YYYY/MM/DD or DD/MM/YYYY.
                    const toDateInputValue = (date) => {
                        if (!date) return '';

                        const value = date.trim();
                        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

                        let match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
                        if (match) {
                            const [, year, month, day] = match;
                            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }

                        match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
                        if (match) {
                            const [, day, month, year] = match;
                            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }

                        return '';
                    };

                    const startDateLocal = toDateInputValue(savedStartDateLocal);
                    const endDateLocal = toDateInputValue(savedEndDateLocal);

                    console.log('values', orgName, startDateLocal)
                    // Display values in indicators
                    document.getElementById('organization-name').innerText = `${orgName}`;
                    document.getElementById('organization-address1').innerText = `${address1}`;
                    document.getElementById('organization-phone1').innerText = `${phone1}`;
                    document.getElementById('dbNameInputs').value = `${dbName}`;
                    document.getElementById('startDateInput').textContent = `Fiscal Start Date: ${savedStartDateLocal || 'No date found'}`;
                    document.getElementById('endDateInput').textContent = `Fiscal End Date: ${savedEndDateLocal || 'No date found'}`;

                    document.getElementById('setfiscalstartyear').innerText = `Fiscal Year : ${startDateLocal}`;
                    document.getElementById('setfiscalendyear').innerText = `To : ${endDateLocal}`;
                    document.getElementById('orgarnizationremarkmp').innerText = `${remarks}`;


                    // Update all elements with the class "start-date-local"
                    document.querySelectorAll('.start-date-local').forEach(element => {
                        if (element.tagName === 'INPUT') {
                            element.value = startDateLocal;
                        } else {
                            element.innerText = savedStartDateLocal || '';
                        }
                    });



                    // Update all elements with the class "end-date-local"
                    document.querySelectorAll('.end-date-local').forEach(element => {
                        if (element.tagName === 'INPUT') {
                            element.value = endDateLocal;
                        } else {
                            element.innerText = savedEndDateLocal || '';
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
