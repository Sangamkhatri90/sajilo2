
                // Shared cache for all Ledger of bank and cash   fields
                const ledgerCacheforBandC = [];
                let ledgerforBandCDataFetched = false;

                // Store filtered results separately per input
                const ledgerforBandCFiltered = {};

                // Fetch GLNames only once
                function fetchLedgersforBandC(fetchUrl, callback) {
                    if (ledgerforBandCDataFetched) {
                        callback(ledgerCacheforBandC);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.glNames && data.glNames.length > 0) {
                                // Sort alphabetically by GLName before caching
                                data.glNames.sort((a, b) => a.GLName.localeCompare(b.GLName));
                                ledgerCacheforBandC.push(...data.glNames);
                                ledgerforBandCDataFetched = true;
                                callback(ledgerCacheforBandC);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching GLNames:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleLedgersforBandCFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchLedgersforBandC(fetchUrl, (data) => {
                        if (data.length > 0) {
                            ledgerforBandCFiltered[inputId] = [...data];
                            displayLedgersforBandCSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Ledgers found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleLedgersforBandCInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        ledgerforBandCFiltered[inputId] = [...ledgerCacheforBandC];
                    } else {
                        ledgerforBandCFiltered[inputId] = ledgerCacheforBandC.filter(item =>
                            item.GLName.toLowerCase().includes(inputVal) ||
                            item.GLAlias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayLedgersforBandCSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayLedgersforBandCSuggestions(inputId, listId) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';

                    // Close button
                    const closeButton = document.createElement('button');
                    closeButton.textContent = 'X';
                    closeButton.onclick = function (e) {
                        e.preventDefault();
                        listElement.style.display = 'none';
                    };
                    listElement.appendChild(closeButton);

                    const suggestions = ledgerforBandCFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.GLName} - ${item.GlAlias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.GLName;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching Ledgers found</div>';
                        listElement.style.display = 'block';
                    }
                }

                // Attach autocomplete to multiple fields easily
                function attachLedgerforBandCAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleLedgersforBandCFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleLedgersforBandCInput(inputId, listId);
                    });
                }

                // List of all collector fields
                const ledgersforBandCFields = [

                    { inputId: 'DERVMnewLedger', listId: 'ledgerClassDERVMnew' },
                    { inputId: 'DEPVMnewLedger', listId: 'ledgerClassDEPVMnew' },
                    { inputId: 'DECMnewLedger', listId: 'ledgerClassDECMnew' },
                    { inputId: 'DEDMnewLedger', listId: 'ledgerClassDEDMnew' },
                    { inputId: 'DEIPnewLedger', listId: 'ledgerClassDEIPnew' },
                    { inputId: 'DEMBVnewLedger', listId: 'ledgerClassDEMBVnew' },
                    { inputId: 'ccaccedit-GLName', listId: 'ccaccedit-glNamesList' },
                    { inputId: 'cc-apBillsLedger', listId: 'cc-apBillsledgerList' },
                    { inputId: 'cc-apRenewLedger', listId: 'cc-apRenewledgerList' },
                    { inputId: 'MaintransGLName', listId: 'MaintransglNamesList' },
                    { inputId: 'MainMultitransGLName', listId: 'MainMultitransglNamesList' },
                    // Add more here if needed
                ];

                // Attach events for all fields (single fetch for all)
                ledgersforBandCFields.forEach(field => {
                    attachLedgerforBandCAutocomplete(field.inputId, field.listId, '/fetchGLNames');
                });
