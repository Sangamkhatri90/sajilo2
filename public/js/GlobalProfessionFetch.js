               // Shared cache for all profession fields
                  const professionCache = [];
                let professionDataFetched = false;

                // Store filtered results separately per input
                const professionFiltered = {};

                // Fetch professions only once
                function fetchProfessions(fetchUrl, callback) {
                    if (professionDataFetched) {
                        callback(professionCache);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.professions && data.professions.length > 0) {
                                // Sort alphabetically by ProfessionName before caching
                                data.professions.sort((a, b) => a.ProfessionName.localeCompare(b.ProfessionName));
                                professionCache.push(...data.professions);
                                professionDataFetched = true;
                                callback(professionCache);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching professions:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleProfessionFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchProfessions(fetchUrl, (data) => {
                        if (data.length > 0) {
                            professionFiltered[inputId] = [...data];
                            displayProfessionSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Professions found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleProfessionInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        professionFiltered[inputId] = [...professionCache];
                    } else {
                        professionFiltered[inputId] = professionCache.filter(item =>
                            item.ProfessionName.toLowerCase().includes(inputVal) ||
                            item.ProfessionAlias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayProfessionSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayProfessionSuggestions(inputId, listId) {
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

                    const suggestions = professionFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.ProfessionName} - ${item.ProfessionAlias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.ProfessionName;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching Professions found</div>';
                        listElement.style.display = 'block';
                    }
                }

                function positionJournalVoucherSearchList(inputId, listId, listElement) {
                    if (listId === 'ProfessionsListForDEJVMsearchDIV') return;
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
                function attachProfessionAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleProfessionFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleProfessionInput(inputId, listId);
                    });
                }

                // List of all profession fields
                const professionFields = [
                    { inputId: 'Profession', listId: 'professionlistfornewmemeber' }
                   
                    
                ];

                // Attach events for all fields (single fetch for all)
                professionFields.forEach(field => {
                    attachProfessionAutocomplete(field.inputId, field.listId, '/fetchProfessions');
                });
