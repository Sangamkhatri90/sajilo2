
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
            { inputId: 'MainMultitransDocclass', listId: 'DocClassMainMultitrans' },
            { inputId: 'DEJVMNewDocclass', listId: 'DocClassDEJVMNew' },
            { inputId: 'doc-class-journal-voucher-search', listId: 'docClassesListforJournalVoucherSearch' },
            { inputId: 'doc-class-transaction-master-search', listId: 'docClassesListforTransactionMasterSearch' },
            { inputId: 'doc-class-receipt-voucher-search', listId: 'DocClassDdocClassesListforReceiptVoucherSearchEJVMNew' },
            { inputId: 'doc-class-payment-voucher-search', listId: 'docClassesListforPaymentVoucherSearch' },
            { inputId: 'collmastersearchdocclass', listId: 'collmastersearchdocdiv' },
            { inputId: 'docclasslistforsearchdvm', listId: 'docclasslistforsearchdvmdiv' },
            { inputId: 'CollChequeSearchfield', listId: 'docClassesListforCollchequesearch' },
            { inputId: 'docClass', listId: 'docClassesList' },
            { inputId: 'DocClassForCollchequeEdit', listId: 'DocClassForCollchequeListEdit' },
            { inputId: 'DocClassForCollchequeCopy', listId: 'DocClassForCollchequeListCopy' },
            { inputId: 'openbalancemasternewdocclass', listId: 'openbalancemasternewdocclassDiv' },
            { inputId: 'doc-class-books-cbb', listId: 'docClassesListforBooksCBB' },
            { inputId: 'doc-class-books-day-b', listId: 'docClassesListforBooksDayB' },
            { inputId: 'doc-class-books-jb', listId: 'docClassesListforBooksJB' },
            { inputId: 'doc-class-books-gen-lgr', listId: 'docClassesListforBooksGenLgr' },
            { inputId: 'doc-class-books-sub-lgr', listId: 'docClassesListforBooksSubLgr' },
            { inputId: 'BooksintcalcDocclass', listId: 'BooksintcalcDocclassDiv' },
            { inputId: 'doc-class-books-charkhata', listId: 'docClassesListforBooksCharkhata' },
            { inputId: 'doc-class-books-dtrans', listId: 'docClassesListforBooksDTrans' },
            { inputId: 'doc-class-books-memtrans', listId: 'docClassesListforBooksMemTrans' },
            { inputId: 'doc-class-fin-rep-tri-bal', listId: 'docClassesListforFinRepTriBal' },
            { inputId: 'doc-class-fin-rep-rapr', listId: 'docClassesListforFinRepRAPR' },
            { inputId: 'doc-class-fin-rep-grp-sum', listId: 'docClassesListforFinRepGrpSum' },
            { inputId: 'doc-class-fin-rep-fin-acc-IS', listId: 'docClassesList-fin-rep-fin-acc-IS' },
            { inputId: 'doc-class-fin-rep-fin-acc-FA', listId: 'docClassesList-fin-rep-fin-acc-FA' },
            { inputId: 'doc-class-fin-rep-pearls', listId: 'docClassesListforFinRepPearls' },
            { inputId: 'doc-class-fin-rep-div-rep', listId: 'docClassesListforFinRepDivRep' },
            { inputId: 'doc-class-fin-rep-mat-ac', listId: 'docClassesListforFinRepMatAc' },
            { inputId: 'doc-class-acc-als-malgr', listId: 'docClassesListforAccAlsMALgr' },
            { inputId: 'doc-class-acc-als-age-rep', listId: 'docClassesListforAccAlsAgeRep' },
            { inputId: 'doc-class-acc-analysis', listId: 'docClassesListforaccanalysis' },
            { inputId: 'doc-class-cost-of-funds', listId: 'docClassesListforCostOfFunds' },
            { inputId: 'doc-class-acc-als-tna', listId: 'docClassesListforAccAlsTNA' },
            { inputId: 'doc-class-acc-als-ttr', listId: 'docClassesListforAccAlsTTR' },
        ];

        // Attach events for all fields (single fetch for all)
        docClassFields.forEach(field => {
            attachDocClassAutocomplete(field.inputId, field.listId, '/fetchDocClasses');
        });

  