
        // Shared cache for all Ledger Master fields
        const LgrMasCacheO = [];
        let LgrMasDataFetchedO = false;

        // Store filtered results separately per input
        const LgrMasFilteredO = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasO(fetchUrl, callback) {
            if (LgrMasDataFetchedO) {
                callback(LgrMasCacheO);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmastero && data.lgrmastero.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmastero.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheO.push(...data.lgrmastero);
                        LgrMasDataFetchedO = true;
                        callback(LgrMasCacheO);
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
        function handleLgrMasFocusO(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasO(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredO[inputId] = [...data];
                    displayLgrMasSuggestionsO(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputO(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredO[inputId] = [...LgrMasCacheO];
            } else {
                LgrMasFilteredO[inputId] = LgrMasCacheO.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsO(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsO(inputId, listId) {
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

            const suggestions = LgrMasFilteredO[inputId] || [];
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
        function attachLgrMasOAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusO(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputO(inputId, listId);
            });
        }

        // List of all Ledger Master O fields
        const lgrMasOFields = [
            { inputId: 'PostingLedger7', listId: 'PostingLedgerList7' },
            { inputId: 'PostingLedger8', listId: 'PostingLedgerList8' },
            { inputId: 'PostingLedger10', listId: 'PostingLedgerList10' },
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasOFields.forEach(field => {
            attachLgrMasOAutocomplete(field.inputId, field.listId, '/fetchLgrMasterO');
        });

  