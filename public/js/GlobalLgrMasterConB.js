
        // Shared cache for all Ledger Master fields
        const LgrMasCacheB = [];
        let LgrMasDataFetchedB = false;

        // Store filtered results separately per input
        const LgrMasFilteredB = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasB(fetchUrl, callback) {
            if (LgrMasDataFetchedB) {
                callback(LgrMasCacheB);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmasterb && data.lgrmasterb.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmasterb.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheB.push(...data.lgrmasterb);
                        LgrMasDataFetchedB = true;
                        callback(LgrMasCacheB);
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
        function handleLgrMasFocusB(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasB(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredB[inputId] = [...data];
                    displayLgrMasSuggestionsB(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputB(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredB[inputId] = [...LgrMasCacheB];
            } else {
                LgrMasFilteredB[inputId] = LgrMasCacheB.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsB(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsB(inputId, listId) {
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

            const suggestions = LgrMasFilteredB[inputId] || [];
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
        function attachLgrMasBAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusB(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputB(inputId, listId);
            });
        }

        // List of all Ledger Master B fields
        const lgrMasBFields = [
            { inputId: 'CollChequeBanknameSearchfield', listId: 'banknameListforCollchequesearch' },
            { inputId: 'bank-name-input', listId: 'bankNamesList' },
            { inputId: 'cashbook-bank-input', listId: 'bankNamesListCFS' },
            { inputId: 'DEbank-name-input', listId: 'bankNamesListofDEBR' },
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasBFields.forEach(field => {
            attachLgrMasBAutocomplete(field.inputId, field.listId, '/fetchLgrMasterB');
        });

  