
        // Shared cache for all Ledger Master fields
        const LgrMasCacheLgrGrpId19 = [];
        let LgrMasDataFetchedLgrGrpId19 = false;

        // Store filtered results separately per input
        const LgrMasFilteredLgrGrpId19 = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasLgrGrpId19(fetchUrl, callback) {
            if (LgrMasDataFetchedLgrGrpId19) {
                callback(LgrMasCacheLgrGrpId19);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.ledgers && data.ledgers.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.ledgers.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheLgrGrpId19.push(...data.ledgers);
                        LgrMasDataFetchedLgrGrpId19 = true;
                        callback(LgrMasCacheLgrGrpId19);
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
        function handleLgrMasFocusLgrGrpId19(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasLgrGrpId19(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredLgrGrpId19[inputId] = [...data];
                    displayLgrMasSuggestionsLgrGrpId19(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputLgrGrpId19(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredLgrGrpId19[inputId] = [...LgrMasCacheLgrGrpId19];
            } else {
                LgrMasFilteredLgrGrpId19[inputId] = LgrMasCacheLgrGrpId19.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GlAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsLgrGrpId19(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsLgrGrpId19(inputId, listId) {
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

            const suggestions = LgrMasFilteredLgrGrpId19[inputId] || [];
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
        function attachLgrMasLgrGrpId19Autocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusLgrGrpId19(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputLgrGrpId19(inputId, listId);
            });
        }

        // List of all Ledger Master C fields
        const lgrMasLgrGrpId19Fields = [
            
            { inputId: 'SSACInterestExpenseAc', listId: 'SSACInterestExpenseAcList' }
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasLgrGrpId19Fields.forEach(field => {
            attachLgrMasLgrGrpId19Autocomplete(field.inputId, field.listId, '/fetchLedgersForSystem19');
        });

  