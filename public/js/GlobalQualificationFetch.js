               // Shared cache for all qualification fields
                  const qualificationCache = [];
                let qualificationDataFetched = false;

                // Store filtered results separately per input
                const qualificationFiltered = {};

                // Fetch qualifications only once
                function fetchQualifications(fetchUrl, callback) {
                    if (qualificationDataFetched) {
                        callback(qualificationCache);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.qualifications && data.qualifications.length > 0) {
                                // Sort alphabetically by Qualification before caching
                                data.qualifications.sort((a, b) => a.Qualification.localeCompare(b.Qualification));
                                qualificationCache.push(...data.qualifications);
                                qualificationDataFetched = true;
                                callback(qualificationCache);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching qualifications:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleQualificationFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchQualifications(fetchUrl, (data) => {
                        if (data.length > 0) {
                            qualificationFiltered[inputId] = [...data];
                            displayQualificationSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Qualifications found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleQualificationInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        qualificationFiltered[inputId] = [...qualificationCache];
                    } else {
                        qualificationFiltered[inputId] = qualificationCache.filter(item =>
                            item.Qualification.toLowerCase().includes(inputVal) ||
                            item.Alias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayQualificationSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayQualificationSuggestions(inputId, listId) {
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

                    const suggestions = qualificationFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.Qualification} - ${item.Alias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.Qualification;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching Qualifications found</div>';
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
                function attachQualificationAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleQualificationFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleQualificationInput(inputId, listId);
                    });
                }

                // List of all qualification fields
                const qualificationFields = [
                    { inputId: 'Qualification', listId: 'qualificationlistfornewmember' }
                   
                    
                ];

                // Attach events for all fields (single fetch for all)
                qualificationFields.forEach(field => {
                    attachQualificationAutocomplete(field.inputId, field.listId, '/fetchQualifications');
                });
