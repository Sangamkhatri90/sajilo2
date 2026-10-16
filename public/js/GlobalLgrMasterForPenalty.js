
        // Shared cache for all Ledger Master fields
        const LgrMasCacheForPenalty = [];
        let LgrMasDataFetchedForPenalty = false;

        // Store filtered results separately per input
        const LgrMasFilteredForPenalty = {};

        // Fetch Ledger Groups only once
        function fetchLgrMasForPenalty(fetchUrl, callback) {
            if (LgrMasDataFetchedForPenalty) {
                callback(LgrMasCacheForPenalty);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.PenaltyList && data.PenaltyList.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.PenaltyList.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCacheForPenalty.push(...data.PenaltyList);
                        LgrMasDataFetchedForPenalty = true;
                        callback(LgrMasCacheForPenalty);
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
        function handleLgrMasFocusForPenalty(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMasForPenalty(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFilteredForPenalty[inputId] = [...data];
                    displayLgrMasSuggestionsForPenalty(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInputForPenalty(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFilteredForPenalty[inputId] = [...LgrMasCacheForPenalty];
            } else {
                LgrMasFilteredForPenalty[inputId] = LgrMasCacheForPenalty.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GlAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestionsForPenalty(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestionsForPenalty(inputId, listId) {
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

            const suggestions = LgrMasFilteredForPenalty[inputId] || [];
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
        function attachLgrMasForPenaltyAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocusForPenalty(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInputForPenalty(inputId, listId);
            });
        }

        // List of all Ledger Master ForPenalty fields
        const lgrMasForPenaltyFields = [
            { inputId: 'PenaltyMasterNew', listId: 'PenaltyMasterNewlistDiv' },
            { inputId: 'EditAccTypePenaltySetAT', listId: 'PenaltyMasterEditlistDiv' },
            { inputId: 'CopyAccTypePenaltySetAT', listId: 'PenaltyMasterCopylistDiv' }
           

        ];

        // Attach events for all fields (single fetch for all)
        lgrMasForPenaltyFields.forEach(field => {
            attachLgrMasForPenaltyAutocomplete(field.inputId, field.listId, '/fetchGlobalListsForPenalty');
        });

  