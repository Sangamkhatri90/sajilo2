               // Shared cache for all district fields
                  const districtCache = [];
                let districtDataFetched = false;

                // Store filtered results separately per input
                const districtFiltered = {};

                // Fetch districts only once
                function fetchDistricts(fetchUrl, callback) {
                    if (districtDataFetched) {
                        callback(districtCache);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.districts && data.districts.length > 0) {
                                // Sort alphabetically by District before caching
                                data.districts.sort((a, b) => a.District.localeCompare(b.District));
                                districtCache.push(...data.districts);
                                districtDataFetched = true;
                                callback(districtCache);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching districts:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleDistrictFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchDistricts(fetchUrl, (data) => {
                        if (data.length > 0) {
                            districtFiltered[inputId] = [...data];
                            displayDistrictSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Districts found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleDistrictInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        districtFiltered[inputId] = [...districtCache];
                    } else {
                        districtFiltered[inputId] = districtCache.filter(item =>
                            item.District.toLowerCase().includes(inputVal) ||
                            item.Alias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayDistrictSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayDistrictSuggestions(inputId, listId) {
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

                    const suggestions = districtFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.District} - ${item.Alias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.District;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching Districts found</div>';
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
                function attachDistrictAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleDistrictFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleDistrictInput(inputId, listId);
                    });
                }

                // List of all district fields
                const districtFields = [
                    { inputId: 'districtInput', listId: 'districtsList2forNewMember' },
                    { inputId: 'PDistrict', listId: 'PDistrictsListForNewMember' },
                    
                   
                    
                ];

                // Attach events for all fields (single fetch for all)
                districtFields.forEach(field => {
                    attachDistrictAutocomplete(field.inputId, field.listId, '/fetchDistricts');
                });
