
        // Shared cache for all Ledger Group fields
        const LgrGrpCache = [];
        let LgrGrpDataFetched = false;

        // Store filtered results separately per input
        const LgrGrpFiltered = {};

        // Fetch Ledger Groups only once
        function fetchLgrGrp(fetchUrl, callback) {
            if (LgrGrpDataFetched) {
                callback(LgrGrpCache);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.ledgerGroups && data.ledgerGroups.length > 0) {
                        // Sort alphabetically by GrpName before caching
                        data.ledgerGroups.sort((a, b) => a.GrpName.localeCompare(b.GrpName));
                        LgrGrpCache.push(...data.ledgerGroups);
                        LgrGrpDataFetched = true;
                        callback(LgrGrpCache);
                    } else {
                        callback([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching Ledger Groups:", err);
                    callback([]);
                });
        }

        // Handle focus
        function handleLgrGrpFocus(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrGrp(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrGrpFiltered[inputId] = [...data];
                    displayLgrGrpSuggestions(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Groups found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrGrpInput(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrGrpFiltered[inputId] = [...LgrGrpCache];
            } else {
                LgrGrpFiltered[inputId] = LgrGrpCache.filter(item =>
                    item.GrpName.toLowerCase().includes(inputVal) ||
                    item.GrpAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrGrpSuggestions(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrGrpSuggestions(inputId, listId) {
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

            const suggestions = LgrGrpFiltered[inputId] || [];
            if (suggestions.length > 0) {
                listElement.style.display = 'block';
                suggestions.forEach(item => {
                    const div = document.createElement('div');
                    div.textContent = `${item.GrpName} - ${item.GrpAlias}`;
                    div.onclick = function () {
                        document.getElementById(inputId).value = item.GrpName;
                        listElement.style.display = 'none';
                    };
                    listElement.appendChild(div);
                });
            } else {
                listElement.innerHTML += '<div>No matching Ledger Groups found</div>';
                listElement.style.display = 'block';
            }
        }

        // Attach autocomplete to multiple fields easily
        function attachLgrGrpAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrGrpFocus(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrGrpInput(inputId, listId);
            });
        }

        // List of all Ledger Group fields
        const lgrGrpFields = [
            { inputId: 'ledger-under', listId: 'parentGroupsList' },
            { inputId: 'LedgerGroup2', listId: 'LedgerGroups2List' },
            { inputId: 'LedgerGroup3', listId: 'LedgerGroups3List' },
            { inputId: 'LedgerGroup4', listId: 'LedgerGroups4List' },
            { inputId: 'LedgerGroup5', listId: 'LedgerGroups5List' },
            { inputId: 'LedgerGroup6', listId: 'LedgerGroups6List' },
            { inputId: 'LedgerGroup7', listId: 'LedgerGroups7List' },
            { inputId: 'LedgerGroup1Copy', listId: 'LedgerGroups1ListCopyDIV' },
            { inputId: 'LedgerGroup1Edit', listId: 'LedgerGroups1ListEditDIV' },
            { inputId: 'LedgerGroup1', listId: 'LedgerGroups1List' },
        ];

        // Attach events for all fields (single fetch for all)
        lgrGrpFields.forEach(field => {
            attachLgrGrpAutocomplete(field.inputId, field.listId, '/fetchLgrGrps');
        });

  