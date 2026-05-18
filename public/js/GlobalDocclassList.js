
        // Shared cache for all Doc Class fields
        const DocClassCache = [];
        let DocClassDataFetched = false;

        // Store filtered results separately per input
        const DocClassFiltered = {};

        // Fetch Doc Classes only once
        function fetchDocClasses(fetchUrl, callback) {
            if (DocClassDataFetched) {
                callback(DocClassCache);
                return;
            }
            fetch(fetchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.docClasses && data.docClasses.length > 0) {
                        // Sort alphabetically by DocClassName before caching
                        data.docClasses.sort((a, b) => a.DocClassName.localeCompare(b.DocClassName));
                        DocClassCache.push(...data.docClasses);
                        DocClassDataFetched = true;
                        callback(DocClassCache);
                    } else {
                        callback([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching Doc Classes:", err);
                    callback([]);
                });
        }

        // Handle focus
        function handleDocClassFocus(inputId, listId, fetchUrl) {
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            listElement.style.display = 'none';

            fetchDocClasses(fetchUrl, (data) => {
                if (data.length > 0) {
                    DocClassFiltered[inputId] = [...data];
                    displayDocClassSuggestions(inputId, listId);
                } else {
                    listElement.innerHTML = '<div>No Doc Classes found</div>';
                    listElement.style.display = 'block';
                }
            });
        }

        // Handle typing
        function handleDocClassInput(inputId, listId) {
            const inputVal = document.getElementById(inputId).value.toLowerCase();

            if (inputVal === '') {
                DocClassFiltered[inputId] = [...DocClassCache];
            } else {
                DocClassFiltered[inputId] = DocClassCache.filter(item =>
                    item.DocClassName.toLowerCase().includes(inputVal) ||
                    item.DocClassAlias.toLowerCase().includes(inputVal)
                );
            }
            displayDocClassSuggestions(inputId, listId);
        }

        // Display dropdown suggestions
        function displayDocClassSuggestions(inputId, listId) {
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

            const suggestions = DocClassFiltered[inputId] || [];
            if (suggestions.length > 0) {
                listElement.style.display = 'block';
                suggestions.forEach(item => {
                    const div = document.createElement('div');
                    div.textContent = `${item.DocClassName} - ${item.DocClassAlias}`;
                    div.onclick = function () {
                        document.getElementById(inputId).value = item.DocClassName;
                        listElement.style.display = 'none';
                    };
                    listElement.appendChild(div);
                });
            } else {
                listElement.innerHTML += '<div>No matching Doc Classes found</div>';
                listElement.style.display = 'block';
            }
        }

        // Attach autocomplete to multiple fields easily
        function attachDocClassAutocomplete(inputId, listId, fetchUrl) {
            const inputEl = document.getElementById(inputId);
            if (!inputEl) return;

            inputEl.addEventListener('focus', function () {
                handleDocClassFocus(inputId, listId, fetchUrl);
            });

            inputEl.addEventListener('input', function () {
                handleDocClassInput(inputId, listId);
            });
        }

        // List of all Doc Class fields
        const docClassFields = [
            { inputId: 'DEPVnewDocclass', listId: 'DocClassDEPVMnew' },
            { inputId: 'DECnewDocclass', listId: 'DocClassDECMnew' },
            { inputId: 'DEDMnewDocclass', listId: 'DocClassDEDMnew' },
            { inputId: 'DEIPnewDocclass', listId: 'DocClassDEIPnew' },
            { inputId: 'DEMBVnewDocclass', listId: 'DocClassDEMBVnew' },
            { inputId: 'DEMBVsearchDocclass', listId: 'DocClassDEMBVsearch' },
            { inputId: 'DEJVMeditDocclass', listId: 'DocClassDEJVMedit' },
            { inputId: 'acceditDocclass', listId: 'DocClassaccedit' },
            { inputId: 'cc-apBilldocClassInput', listId: 'cc-apBill-docClassList' },
            { inputId: 'ccApmemedit', listId: 'ccApmemeditlistdiv' },
            { inputId: 'ccapeditmemotherdoc', listId: 'ccapeditmemotherdoclist' },
            { inputId: 'MaintransDocclass', listId: 'DocClassMaintrans' },
            { inputId: 'DEJVMNewDocclass', listId: 'DocClassDEJVMNew' },
            { inputId: 'doc-class-journal-voucher-search', listId: 'docClassesListforJournalVoucherSearch' },
            { inputId: 'doc-class-transaction-master-search', listId: 'docClassesListforTransactionMasterSearch' },
             { inputId: 'doc-class-receipt-voucher-search', listId: 'DocClassDdocClassesListforReceiptVoucherSearchEJVMNew' },
            
        ];

        // Attach events for all fields (single fetch for all)
        docClassFields.forEach(field => {
            attachDocClassAutocomplete(field.inputId, field.listId, '/fetchDocClasses');
        });

  