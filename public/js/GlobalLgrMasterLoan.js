
                // Shared cache for all Ledger of loan acc type  fields
                const LedgerCacheForLoanAcc = [];
                let LedgerDataFetchedForLoanAcc = false;

                // Store filtered results separately per input
                const LedgerFilteredForLoanAcc = {};

                // Fetch Ledgers only once
                function fetchLedgersForLoanAcc(fetchUrl, callback) {
                    if (LedgerDataFetchedForLoanAcc) {
                        callback(LedgerCacheForLoanAcc);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.postingLedgers && data.postingLedgers.length > 0) {
                                // Sort alphabetically by GLName before caching
                                data.postingLedgers.sort((a, b) => a.GLName.localeCompare(b.GLName));
                                LedgerCacheForLoanAcc.push(...data.postingLedgers);
                                LedgerDataFetchedForLoanAcc = true;
                                callback(LedgerCacheForLoanAcc);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching Ledgers:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleLedgerFocusForLoanAcc(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchLedgersForLoanAcc(fetchUrl, (data) => {
                        if (data.length > 0) {
                            LedgerFilteredForLoanAcc[inputId] = [...data];
                            displayLedgerSuggestionsForLoanAcc(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Ledgers found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleLedgerInputForLoanAcc(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        LedgerFilteredForLoanAcc[inputId] = [...LedgerCacheForLoanAcc];
                    } else {
                        LedgerFilteredForLoanAcc[inputId] = LedgerCacheForLoanAcc.filter(item =>
                            item.GLName.toLowerCase().includes(inputVal) ||
                            item.GLAlias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayLedgerSuggestionsForLoanAcc(inputId, listId);
                }

                // Display dropdown suggestions
                function displayLedgerSuggestionsForLoanAcc(inputId, listId) {
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

                    const suggestions = LedgerFilteredForLoanAcc[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.GLName} - ${item.GLAlias}`;
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
                function attachLedgerAutocompleteForLoanAcc(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleLedgerFocusForLoanAcc(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleLedgerInputForLoanAcc(inputId, listId);
                    });
                }

                // List of all Ledger fields
                const ledgerFieldsForLoanAcc = [

                    { inputId: 'STLT-loanacc-type', listId: 'STLT-loan-acclists' },


                    // Add more here if needed
                ];

                // Attach events for all fields (single fetch for all)
                ledgerFieldsForLoanAcc.forEach(field => {
                    attachLedgerAutocompleteForLoanAcc(field.inputId, field.listId, '/fetchLgrMasterLoanAcc');
                });
