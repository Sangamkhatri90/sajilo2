               // Shared cache for all collector fields
                  const collectorCache = [];
                let collectorDataFetched = false;

                // Store filtered results separately per input
                const collectorFiltered = {};

                // Fetch collectors only once
                function fetchCollectors(fetchUrl, callback) {
                    if (collectorDataFetched) {
                        callback(collectorCache);
                        return;
                    }
                    fetch(fetchUrl)
                        .then(res => res.json())
                        .then(data => {
                            if (data.collectors && data.collectors.length > 0) {
                                // Sort alphabetically by CollectorName before caching
                                data.collectors.sort((a, b) => a.CollectorName.localeCompare(b.CollectorName));
                                collectorCache.push(...data.collectors);
                                collectorDataFetched = true;
                                callback(collectorCache);
                            } else {
                                callback([]);
                            }
                        })
                        .catch(err => {
                            console.error("Error fetching collectors:", err);
                            callback([]);
                        });
                }

                // Handle focus
                function handleCollectorFocus(inputId, listId, fetchUrl) {
                    const listElement = document.getElementById(listId);
                    listElement.innerHTML = '';
                    listElement.style.display = 'none';

                    fetchCollectors(fetchUrl, (data) => {
                        if (data.length > 0) {
                            collectorFiltered[inputId] = [...data];
                            displayCollectorSuggestions(inputId, listId);
                        } else {
                            listElement.innerHTML = '<div>No Collectors found</div>';
                            listElement.style.display = 'block';
                        }
                    });
                }

                // Handle typing
                function handleCollectorInput(inputId, listId) {
                    const inputVal = document.getElementById(inputId).value.toLowerCase();

                    if (inputVal === '') {
                        collectorFiltered[inputId] = [...collectorCache];
                    } else {
                        collectorFiltered[inputId] = collectorCache.filter(item =>
                            item.CollectorName.toLowerCase().includes(inputVal) ||
                            item.CollectorAlias.toLowerCase().includes(inputVal)
                        );
                    }
                    displayCollectorSuggestions(inputId, listId);
                }

                // Display dropdown suggestions
                function displayCollectorSuggestions(inputId, listId) {
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

                    const suggestions = collectorFiltered[inputId] || [];
                    if (suggestions.length > 0) {
                        listElement.style.display = 'block';
                        suggestions.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = `${item.CollectorName} - ${item.CollectorAlias}`;
                            div.onclick = function () {
                                document.getElementById(inputId).value = item.CollectorName;
                                listElement.style.display = 'none';
                            };
                            listElement.appendChild(div);
                        });
                    } else {
                        listElement.innerHTML += '<div>No matching Collectors found</div>';
                        listElement.style.display = 'block';
                    }
                }

                // Attach autocomplete to multiple fields easily
                function attachCollectorAutocomplete(inputId, listId, fetchUrl) {
                    const inputEl = document.getElementById(inputId);
                    if (!inputEl) return;

                    inputEl.addEventListener('focus', function () {
                        handleCollectorFocus(inputId, listId, fetchUrl);
                    });

                    inputEl.addEventListener('input', function () {
                        handleCollectorInput(inputId, listId);
                    });
                }

                // List of all collector fields
                const collectorFields = [
                    { inputId: 'DEJVnewCollector', listId: 'collectorClassDEJVMnew' },
                    { inputId: 'DEJVeditCollector', listId: 'collectorClassDEJVMedit' },
                    { inputId: 'DECMnewCollector', listId: 'collectorClassDECMnew' },
                    { inputId: 'DERVMnewCollector', listId: 'collectorClassDERVMnew' },
                    { inputId: 'DEPVnewCollector', listId: 'collectorClassDEPVMnew' },
                    { inputId: 'DEDMnewCollector', listId: 'collectorClassDEDMnew' },
                    { inputId: 'DEIPnewCollector', listId: 'collectorClassDEIPnew' },
                    { inputId: 'DEMBVnewCollector', listId: 'collectorClassDEMBVnew' },
                    { inputId: 'DEMBVsearchCollector', listId: 'collectorClassDEMBVsearch' },
                    { inputId: 'ccaccedit-vd-Collector', listId: 'ccaccedit-vd-Collectordiv' },
                    { inputId: 'cc-apBillPCollector', listId: 'cc-apBillPCollectorsList' },
                    { inputId: 'de-jvm-coll-searchinput', listId: 'CollectorsListForDEJVMsearchDIV' },
                    { inputId: 'collmastersearchcollector', listId: 'collmastersearchcollectordiv' },
                ];

                // Attach events for all fields (single fetch for all)
                collectorFields.forEach(field => {
                    attachCollectorAutocomplete(field.inputId, field.listId, '/fetchCollectors');
                });
