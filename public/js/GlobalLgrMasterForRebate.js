
        // Shared cache for all Ledger Master fields
        const LgrMasCacheForRebate = [];
        let LgrMasDataFetchedForRebate = false;

        // Store filtered results separately per input
        const LgrMasFilteredForRebate = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasForRebate(fetchUrl, callback) {
            if (LgrMasDataFetchedForRebate) {
                callback(LgrMasCacheForRebate);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.RebateList && data.RebateList.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.RebateList.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheForRebate.push(...data.RebateList);
                        LgrMasDataFetchedForRebate = true;
                        callback(LgrMasCacheForRebate);
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
        function handleLgrMasFocusForRebate(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasForRebate(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredForRebate[inputId] = [...data];
                    displayLgrMasSuggestionsForRebate(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputForRebate(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredForRebate[inputId] = [...LgrMasCacheForRebate];
            } else {
                LgrMasFilteredForRebate[inputId] = LgrMasCacheForRebate.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GlAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsForRebate(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsForRebate(inputId, listId) {
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

            const suggestions = LgrMasFilteredForRebate[inputId] || [];
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
        function attachLgrMasForRebateAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusForRebate(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputForRebate(inputId, listId);
            });
        }

        // List of all Ledger Master ForRebate fields
        const lgrMasForRebateFields = [
            { inputId: 'RebateMasterInputNew', listId: 'RebateMasterNewlistDiv' },
            { inputId: 'EditAccTypeRebateSetAT', listId: 'RebateMasterEditlistDiv' },
            { inputId: 'CopyAccTypeRebateSetAT', listId: 'RebateMasterCopylistDiv' }
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasForRebateFields.forEach(field => {
            attachLgrMasForRebateAutocomplete(field.inputId, field.listId, '/fetchGlobalListsForRebate');
        });

  