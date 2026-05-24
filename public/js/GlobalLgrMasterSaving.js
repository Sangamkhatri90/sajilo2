
        // Shared cache for all Ledger Master fields
        const LgrMasCacheSave = [];
        let LgrMasDataFetchedSave = false;

        // Store filtered results separately per input
        const LgrMasFilteredSave = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasSave(fetchUrl, callback) {
            if (LgrMasDataFetchedSave) {
                callback(LgrMasCacheSave);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmastersaving && data.lgrmastersaving.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmastersaving.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheSave.push(...data.lgrmastersaving);
                        LgrMasDataFetchedSave = true;
                        callback(LgrMasCacheSave);
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
        function handleLgrMasFocusSave(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasSave(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredSave[inputId] = [...data];
                    displayLgrMasSuggestionsSave(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputSave(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredSave[inputId] = [...LgrMasCacheSave];
            } else {
                LgrMasFilteredSave[inputId] = LgrMasCacheSave.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsSave(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsSave(inputId, listId) {
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

            const suggestions = LgrMasFilteredSave[inputId] || [];
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
        function attachLgrMasSaveAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusSave(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputSave(inputId, listId);
            });
        }

        // List of all Ledger Master Saving fields
        const lgrMasSaveFields = [
            { inputId: 'PostingLedger9', listId: 'PostingLedgerList9' },
            { inputId: 'PostingLedger11', listId: 'PostingLedgerList11' },
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasSaveFields.forEach(field => {
            attachLgrMasSaveAutocomplete(field.inputId, field.listId, '/fetchLgrMasterSaving');
        });

  