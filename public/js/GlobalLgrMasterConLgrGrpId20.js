
        // Shared cache for all Ledger Master fields
        const LgrMasCacheLgrGrpId20 = [];
        let LgrMasDataFetchedLgrGrpId20 = false;

        // Store filtered results separately per input
        const LgrMasFilteredLgrGrpId20 = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasLgrGrpId20(fetchUrl, callback) {
            if (LgrMasDataFetchedLgrGrpId20) {
                callback(LgrMasCacheLgrGrpId20);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.ledgers && data.ledgers.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.ledgers.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheLgrGrpId20.push(...data.ledgers);
                        LgrMasDataFetchedLgrGrpId20 = true;
                        callback(LgrMasCacheLgrGrpId20);
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
        function handleLgrMasFocusLgrGrpId20(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasLgrGrpId20(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredLgrGrpId20[inputId] = [...data];
                    displayLgrMasSuggestionsLgrGrpId20(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputLgrGrpId20(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredLgrGrpId20[inputId] = [...LgrMasCacheLgrGrpId20];
            } else {
                LgrMasFilteredLgrGrpId20[inputId] = LgrMasCacheLgrGrpId20.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GlAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsLgrGrpId20(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsLgrGrpId20(inputId, listId) {
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

            const suggestions = LgrMasFilteredLgrGrpId20[inputId] || [];
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
                listElement.innerHTML += '<div>No matching Ledger Master found</div>';
                listElement.style.display = 'block';
            }
        }

        // Attach autocomplete to multiple fields easily
        function attachLgrMasLgrGrpId20Autocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusLgrGrpId20(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputLgrGrpId20(inputId, listId);
            });
        }

        // List of all Ledger Master C fields
        const lgrMasLgrGrpId20Fields = [
            { inputId: 'SSACInterestIncomeAc', listId: 'SSACInterestIncomeAcList' },
           
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasLgrGrpId20Fields.forEach(field => {
            attachLgrMasLgrGrpId20Autocomplete(field.inputId, field.listId, '/fetchLedgersForSystem');
        });

  