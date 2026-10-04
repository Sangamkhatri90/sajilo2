
        // Shared cache for all Ledger Master fields
        const LgrMasCache = [];
        let LgrMasDataFetched = false;

        // Store filtered results separately per input
        const LgrMasFiltered = {};

        // Fetch Ledger Groups only once
        function fetchLgrMas(fetchUrl, callback) {
            if (LgrMasDataFetched) {
                callback(LgrMasCache);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.lgrmaster && data.lgrmaster.length > 0) {
                        // Sort alphabetically by GLName before caching
                        data.lgrmaster.sort((a, b) => a.GLName.localeCompare(b.GLName));
                        LgrMasCache.push(...data.lgrmaster);
                        LgrMasDataFetched = true;
                        callback(LgrMasCache);
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
        function handleLgrMasFocus(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchLgrMas(fetchUrl, (data) => {
                if (data.length > 0) {
                    LgrMasFiltered[inputId] = [...data];
                    displayLgrMasSuggestions(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Ledger Master found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleLgrMasInput(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                LgrMasFiltered[inputId] = [...LgrMasCache];
            } else {
                LgrMasFiltered[inputId] = LgrMasCache.filter(item =>
                    item.GLName.toLowerCase().includes(inputVal) ||
                    item.GLAlias.toLowerCase().includes(inputVal)
                );
            }
            displayLgrMasSuggestions(inputId, listId);
        }

        // Display dropdown suggestions
        function displayLgrMasSuggestions(inputId, listId) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            positionJournalVoucherSearchList(inputId, listId, listElement);

            // Close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.onclick = function (e) {
                e.preventDefault();
                listElement.style.display = 'none';
            };
            listElement.appendChild(closeButton);

            const suggestions = LgrMasFiltered[inputId] || [];
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

        function positionJournalVoucherSearchList(inputId, listId, listElement) {
            if (listId !== 'LedgerListForDEJVMsearchDIV') return;
            const input = document.getElementById(inputId);
            const searchPanel = document.getElementById('jv-search');
            if (!input || !searchPanel) return;
            const inputRect = input.getBoundingClientRect();
            const panelRect = searchPanel.getBoundingClientRect();
            listElement.style.setProperty('left', `${inputRect.left - panelRect.left}px`, 'important');
            listElement.style.setProperty('top', `${inputRect.bottom - panelRect.top}px`, 'important');
            listElement.style.setProperty('width', `${inputRect.width}px`, 'important');
        }

        // Attach autocomplete to multiple fields easily
        function attachLgrMasAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleLgrMasFocus(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleLgrMasInput(inputId, listId);
            });
        }

        // List of all Ledger Master fields
        const lgrMasFields = [
            { inputId: 'PostingLedgerForNew', listId: 'PostingLedgerListNewDIV' },
            { inputId: 'PostingLedgerForEdit', listId: 'PostingLedgerListEditDIV' },
            { inputId: 'PostingLedgerForCopy', listId: 'PostingLedgerListCopyDIV' },
            { inputId: 'PostingLedgerForSubGrpEdit', listId: 'PostingLedgerListSubGrpEditDIV' },
            { inputId: 'PostingLedgerForSubLgrCopy', listId: 'PostingLedgerListSubLgrCopyDIV' },
            { inputId: 'AccTypeIntSetEdit', listId: 'PostingLedgerListIntSetEdit' },
            { inputId: 'AccTypeIntSetCopy', listId: 'PostingLedgerListIntSetCopy' },
            { inputId: 'AccTypeIntSetSubGrpEdit', listId: 'PostingLedgerListIntSetSubGrpEdit' },
            { inputId: 'PostingLedger1', listId: 'PostingLedgerList1' },
            { inputId: 'PostingLedger2', listId: 'PostingLedgerList2' },
            { inputId: 'PostingLedger4', listId: 'PostingLedgerList4' },
            { inputId: 'DE-JVM-searchledger', listId: 'LedgerListForDEJVMsearchDIV' },
            { inputId: 'DE-TVM-searchledger', listId: 'LedgerListForDETVMsearchDIV' },
            { inputId: 'DE-RPVM-searchledger', listId: 'LedgerListForDERPVMsearchDIV' },
            { inputId: 'VPNUPledgergrp', listId: 'voucherpostingsuggestionDIV' },
        ];

        // Attach events for all fields (single fetch for all)
        lgrMasFields.forEach(field => {
            attachLgrMasAutocomplete(field.inputId, field.listId, '/fetchLgrMaster');
        });


