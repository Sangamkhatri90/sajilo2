               // Shared cache for all vdc fields
                const vdcCache = [];
                let vdcDataFetched = false;

                // Store filtered results separately per input
                const vdcFiltered = {};

                // Fetch vdcs only once
                function fetchVdcs(fetchUrl, callback) {
                    if (vdcDataFetched) {
                        callback(vdcCache);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.vdc && data.vdc.length > 0) {
                                // Sort alphabetically by Vdc before caching
                                data.vdc.sort((a, b) => a.Vdc.localeCompare(b.Vdc));
                                vdcCache.push(...data.vdc);
                                vdcDataFetched = true;
                                callback(vdcCache);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching vdcs:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleVdcFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchVdcs(fetchUrl, (data) => {
                        if (data.length > 0) {
                            vdcFiltered[inputId] = [...data];
                            displayVdcSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No VDCs found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleVdcInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        vdcFiltered[inputId] = [...vdcCache];
                    } else {
                        vdcFiltered[inputId] = vdcCache.filter(item =>
                            item.Vdc.toLowerCase().includes(inputVal) ||
                            item.Alias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayVdcSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayVdcSuggestions(inputId, listId) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    // positionJournalVoucherSearchList(inputId, listId, listElement);

                    // Close button
                    const closeButton = document.createElement('button');
                    closeButton.textContent = 'X';
                    closeButton.onclick = function (e) {
                        e.preventDefault();
                        listElement.style.display = 'none';
                    };
                    listElement.appendChild(closeButton);

                    const suggestions = vdcFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.Vdc} - ${item.Alias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.Vdc;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching VDCs found</div>';
                        listElement.style.display = 'block';
                    }
                }

                // Display the suggestions list below the input field, adjusting for the search panel's position
                // function positionJournalVoucherSearchList(inputId, listId, listElement) {
                //     if (listId === 'ProfessionsListForDEJVMsearchDIV') return;
                //     const input = document.getElementById(inputId);
                //     const searchPanel = document.getElementById('jv-search');
                //     if (!input || !searchPanel) return;
                //     const inputRect = input.getBoundingClientRect();
                //     const panelRect = searchPanel.getBoundingClientRect();
                //     listElement.style.setProperty('left', `${inputRect.left - panelRect.left}px`, 'important');
                //     listElement.style.setProperty('top', `${inputRect.bottom - panelRect.top}px`, 'important');
                //     listElement.style.setProperty('width', `${inputRect.width}px`, 'important');
                // }

                // Attach autocomplete to multiple fields easily
                function attachVdcAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleVdcFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleVdcInput(inputId, listId);
                    });
                }

                // List of all VDC fields
                const vdcFields = [
                    { inputId: 'VDCInput1', listId: 'VDCList1fornewMember' },
                    { inputId: 'VDCInput2', listId: 'VDCList2forNewMember' },
                    
                   
                    
                ];

                // Attach events for all fields (single fetch for all)
                vdcFields.forEach(field => {
                    attachVdcAutocomplete(field.inputId, field.listId, '/fetchVdc');
                });
