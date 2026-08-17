
        // Shared cache for all Ledger Master fields
        const LgrMasCacheC = [];
        let LgrMasDataFetchedC = false;

        // Store filtered results separately per input
        const LgrMasFilteredC = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasC(fetchUrl, callback) {
            if (LgrMasDataFetchedC) {
                callback(LgrMasCacheC);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmasterc && data.lgrmasterc.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmasterc.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheC.push(...data.lgrmasterc);
                        LgrMasDataFetchedC = true;
                        callback(LgrMasCacheC);
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
        function handleLgrMasFocusC(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasC(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredC[inputId] = [...data];
                    displayLgrMasSuggestionsC(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputC(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredC[inputId] = [...LgrMasCacheC];
            } else {
                LgrMasFilteredC[inputId] = LgrMasCacheC.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsC(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsC(inputId, listId) {
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

            const suggestions = LgrMasFilteredC[inputId] || [];
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
        function attachLgrMasCAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusC(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputC(inputId, listId);
            });
        }

        // List of all Ledger Master C fields
        const lgrMasCFields = [
            { inputId: 'SSACCashBook', listId: 'SSACCashBookDiv' },
           
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasCFields.forEach(field => {
            attachLgrMasCAutocomplete(field.inputId, field.listId, '/fetchLgrMasterC');
        });

  