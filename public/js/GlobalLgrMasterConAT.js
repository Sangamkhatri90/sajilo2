
        // Shared cache for all Ledger Master fields
        const LgrMasCacheAT = [];
        let LgrMasDataFetchedAT = false;

        // Store filtered results separately per input
        const LgrMasFilteredAT = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasAT(fetchUrl, callback) {
            if (LgrMasDataFetchedAT) {
                callback(LgrMasCacheAT);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmasterat && data.lgrmasterat.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmasterat.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheAT.push(...data.lgrmasterat);
                        LgrMasDataFetchedAT = true;
                        callback(LgrMasCacheAT);
                    } else {
                        callback([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching Ledger Master:", err);
                    callback([]);
                });
        }

        // Handle focus
        function handleLgrMasFocusAT(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasAT(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredAT[inputId] = [...data];
                    displayLgrMasSuggestionsAT(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputAT(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredAT[inputId] = [...LgrMasCacheAT];
            } else {
                LgrMasFilteredAT[inputId] = LgrMasCacheAT.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsAT(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsAT(inputId, listId) {
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

            const suggestions = LgrMasFilteredAT[inputId] || [];
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
                listElement.innerHTML += '<div>No matching Ledger Master found</div>';
                listElement.style.display = 'block';
            }
        }

        // Attach autocomplete to multiple fields easily
        function attachLgrMasATAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusAT(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputAT(inputId, listId);
            });
        }

        // List of all Ledger Master AT fields
        const lgrMasATFields = [
            { inputId: 'PostingLedger5', listId: 'PostingLedgerList5' },
            { inputId: 'PostingLedger6', listId: 'PostingLedgerList6' },
            { inputId: 'PostingLedgerForBooksAS', listId: 'PostingLedgerListForBooksAS' },
            { inputId: 'gl-name-route-wise-acc', listId: 'glNamesListForRouteWiseacc' },
            { inputId: 'gl-name-mobile-alert', listId: 'glNamesListForMobileAlert' },
            { inputId: 'gl-name-acc-lock-unlock', listId: 'glNamesListForAccLockUnLock' },
            { inputId: 'accountType', listId: 'PostingLedgerList3' },

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasATFields.forEach(field => {
            attachLgrMasATAutocomplete(field.inputId, field.listId, '/fetchLgrMasterAT');
        });

  