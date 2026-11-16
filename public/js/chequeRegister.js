
                //Cheque Register
                document.addEventListener('DOMContentLoaded', () => {
                    const mainChequeRegister = document.getElementById('myForm14');
                    const mainCashNNonCashDiv = document.getElementById('mainCashNNonCashDiv');
                    const formatDate = (dateStr) => {
                        if (!dateStr) return "";
                        const date = new Date(dateStr);
                        return Number.isNaN(date.getTime()) ? dateStr : date.toISOString().split("T")[0];
                    };
                    const renderChequeRows = (data) => {
                        const tableBody = document.querySelector("#closeallCashNNonCashTab tbody");
                        console.log("[Cheque Register] Rendering final table rows:", data.length, data);
                        tableBody.innerHTML = "";

                        data.forEach((row, index) => {
                            tableBody.insertAdjacentHTML("beforeend", `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${row.ChequeNo || ""}</td>
                                    <td>${row.SlAlias || ""}</td>
                                    <td>${row.SLName || ""}</td>
                                    <td>${formatDate(row.IssueDate)}</td>
                                    <td>${formatDate(row.JournalDate || row.JVMiti)}</td>
                                    <td>${row.VoucherNo || ""}</td>
                                    <td>${row.DrAmount ? Number(row.DrAmount).toLocaleString() : ""}</td>
                                </tr>
                            `);
                        });
                    };
                    const closeButtons = [

                        { buttonId: 'closeallCashNNonCashDiv', div: mainCashNNonCashDiv },
                        { buttonId: 'cancelallCashNNonCashDiv', div: mainCashNNonCashDiv },
                        { buttonId: 'okCashNNonCashDiv', div: mainCashNNonCashDiv },


                    ];

                    closeButtons.forEach(({ buttonId, div }) => {
                        document.getElementById(buttonId).addEventListener('click', function (e) {
                            e.preventDefault();
                            div.style.display = 'none';
                        });
                    });

                    let highestZIndex = 3;

                    // Function to bring the div to the front by updating the z-index
                    function bringToFront(element) {
                        highestZIndex++;
                        element.style.zIndex = highestZIndex;
                    }

                    // Make div movable
                    function makeDivMovable(div) {
                        let isDragging = false;
                        let offsetX, offsetY;

                        div.addEventListener('mousedown', (e) => {
                            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
                                return; // Allow interaction with input fields and buttons
                            }
                            e.preventDefault();
                            bringToFront(div);

                            const rect = div.getBoundingClientRect();
                            offsetX = e.clientX - rect.left;
                            offsetY = e.clientY - rect.top;

                            isDragging = true;
                        });



                        document.addEventListener('mousemove', (e) => {
                            if (isDragging) {
                                div.style.left = `${e.pageX - offsetX}px`;
                                div.style.top = `${e.pageY - offsetY}px`;
                                div.style.position = 'absolute';
                            }
                        });

                        document.addEventListener('mouseup', () => {
                            isDragging = false;
                        });
                    }


                    makeDivMovable(mainCashNNonCashDiv);


                    mainChequeRegister.addEventListener("submit", async (event) => {
                        event.preventDefault();
                        console.log('[Cheque Register] Form submitted');

                        const dateFromChequeR = document.getElementById("CRIssueDateFrom").value;
                        const dateToChequeR = document.getElementById("CRIssueDateTo").value;

                        const CRSelectAllType = document.getElementById("CRSelectAllType");
                        const CRSelectAllAccount = document.getElementById("CRSelectAllAccount");
                        const CRCashedCB = document.getElementById("CRCashed");
                        const CRNonCashedCB = document.getElementById("CRNonCashed");
                        const CRmemSelectTypeDiv = document.getElementById("CRmemSelectTypeDiv");
                        const CRlgrSelectTypeDiv = document.getElementById("CRaccountSelectTypeDiv");
                        const CRmemListForm = document.getElementById("CRmemListForm");
                        const CRlgrListForm = document.getElementById("CRlgrListForm");
                        console.log("[Cheque Register] Filters:", {
                            dateFromChequeR,
                            dateToChequeR,
                            selectAllType: CRSelectAllType.checked,
                            selectAllAccount: CRSelectAllAccount.checked,
                            cashed: CRCashedCB.checked,
                            nonCashed: CRNonCashedCB.checked
                        });
                        const closeButtonsListsForCR = [

                            { buttonId: 'CRmemlistCancelButton', div: CRmemSelectTypeDiv },
                            { buttonId: 'CRmemlistcloseButton', div: CRmemSelectTypeDiv },
                            { buttonId: 'CRlgrlistCancelButton', div: CRlgrSelectTypeDiv },
                            { buttonId: 'CRlgrlistcloseButton', div: CRlgrSelectTypeDiv },


                        ];

                        closeButtonsListsForCR.forEach(({ buttonId, div }) => {
                            document.getElementById(buttonId).addEventListener('click', function (e) {
                                e.preventDefault();
                                div.style.display = 'none';
                            });
                        });
                        let highestZIndex = 3;

                        // Function to bring the div to the front by updating the z-index
                        function bringToFront(element) {
                            highestZIndex++;
                            element.style.zIndex = highestZIndex;
                        }

                        // Make div movable
                        function makeDivMovable(div) {
                            let isDragging = false;
                            let offsetX, offsetY;

                            div.addEventListener('mousedown', (e) => {
                                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
                                    return; // Allow interaction with input fields and buttons
                                }
                                e.preventDefault();
                                bringToFront(div);

                                const rect = div.getBoundingClientRect();
                                offsetX = e.clientX - rect.left;
                                offsetY = e.clientY - rect.top;

                                isDragging = true;
                            });



                            document.addEventListener('mousemove', (e) => {
                                if (isDragging) {
                                    div.style.left = `${e.pageX - offsetX}px`;
                                    div.style.top = `${e.pageY - offsetY}px`;
                                    div.style.position = 'absolute';
                                }
                            });

                            document.addEventListener('mouseup', () => {
                                isDragging = false;
                            });
                        }


                        makeDivMovable(CRmemSelectTypeDiv);
                        makeDivMovable(CRlgrSelectTypeDiv);

                        if (!CRCashedCB.checked && !CRNonCashedCB.checked) {
                            showCustomAlert("Select either Cashed or Notcashed")
                            return;
                        }


                        if (CRSelectAllType.checked && CRSelectAllAccount.checked && CRCashedCB.checked && CRNonCashedCB.checked) {
                            try {
                                console.log("[Cheque Register] Requesting all cashed and non-cashed cheques");
                                const response = await fetch("/fetch-chequeCashNNonCash-data", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR })
                                });
                                console.log("[Cheque Register] Response received:", response.status, response.statusText);

                                const result = await response.json();
                                const data = result.data || result;


                                renderChequeRows(data);

                                mainCashNNonCashDiv.style.display = 'block';

                            } catch (error) {
                                console.error("Error fetching loan & acc name data:", error);
                            }
                        }

                        if (CRSelectAllType.checked && CRSelectAllAccount.checked && CRCashedCB.checked && !CRNonCashedCB.checked) {
                            try {
                                console.log("[Cheque Register] Requesting cashed cheques");
                                const response = await fetch("/fetch-chequeCashNNonCashUC-data", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR })
                                });
                                console.log("[Cheque Register] Response received:", response.status, response.statusText);

                                const result = await response.json();
                                const data = result.data || result;


                                renderChequeRows(data);

                                mainCashNNonCashDiv.style.display = 'block';

                            } catch (error) {
                                console.error("Error fetching loan & acc name data:", error);
                            }
                        }

                        if (CRSelectAllType.checked && CRSelectAllAccount.checked && !CRCashedCB.checked && CRNonCashedCB.checked) {
                            try {
                                console.log("[Cheque Register] Requesting non-cashed cheques");
                                const response = await fetch("/fetch-chequeCashUCNNonCash-data", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR })
                                });
                                console.log("[Cheque Register] Response received:", response.status, response.statusText);

                                const result = await response.json();
                                const data = result.data || result;


                                renderChequeRows(data);

                                mainCashNNonCashDiv.style.display = 'block';

                            } catch (error) {
                                console.error("Error fetching loan & acc name data:", error);
                            }
                        }

                        if (CRSelectAllType.checked && CRCashedCB.checked && !CRSelectAllAccount.checked && !CRNonCashedCB.checked) {
                            // 1️⃣ Fetch Member List
                            console.log("[Cheque Register] Loading account-name selection list for cashed cheques");
                            const response = await fetch('/fetchmemberListforPandR');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }
                            const data = await response.json();
                            const tableBody = document.querySelector('#CRmemlistTable tbody');
                            tableBody.innerHTML = '';
                            // 2️⃣ Populate Member List Table
                            data.AccName.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
            <td><input type="checkbox" class="CRmemlistDiv-CR" value="${row.SLID}"></td>
            <td>${index + 1}</td>
            <td>${row.SLName}</td>
            <td>${row.SlAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            console.log("[Cheque Register] Account-name selection list loaded:", data.AccName.length);
                            // Show selection screen
                            CRmemSelectTypeDiv.style.display = 'block';
                            //allTypeNaccNameMainDiv.style.display = 'none';

                            // 3️⃣ Select All / Unselect All buttons
                            document.getElementById("CRmemlistselectallButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRmemlistDiv-CR").forEach(c => c.checked = true);
                            };

                            document.getElementById("CRmemlistunselectButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRmemlistDiv-CR").forEach(c => c.checked = false);
                            };

                            document.getElementById("CRmemlistCancelButton").onclick = (e) => {
                                e.preventDefault();
                                const CRmemSelectTypeDiv = document.getElementById("CRmemSelectTypeDiv");
                                CRmemSelectTypeDiv.style.display = 'none';
                            };
                            // 3️⃣ Handle form submit
                            CRmemListForm.onsubmit = async (e) => {
                                e.preventDefault();

                                const checkedCRmemValuesCR = Array.from(
                                    document.querySelectorAll('.CRmemlistDiv-CR:checked')
                                ).map(c => ({ SLID: c.value }));

                                if (checkedCRmemValuesCR.length === 0) {
                                    showCustomAlert('No values selected');
                                    return;
                                }

                                // 4️⃣ Fetch filtered  data (SLID version)
                                console.log("[Cheque Register] Requesting selected cashed accounts:", checkedCRmemValuesCR);
                                const response2 = await fetch('/fetch-chequeCashNNonCashUC-filterdata', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR, checkedCRmemValuesCR }),
                                });

                                if (!response2.ok) {
                                    console.error('[Cheque Register] Selected cashed-account request failed:', response2.status, await response2.text());
                                    return;
                                }

                                const result = await response2.json();
                                const fetchedData = result.data || result;

                                console.log("[Cheque Register] Selected cashed-account response:", fetchedData.length, fetchedData);

                                // 5️⃣ Populate main table
                                renderChequeRows(fetchedData);

                                // 6️⃣ Show the main table now that data is ready
                                mainCashNNonCashDiv.style.display = 'block';
                                CRmemSelectTypeDiv.style.display = 'none';
                            };

                        }
                        if (CRSelectAllType.checked && CRNonCashedCB.checked && !CRSelectAllAccount.checked && !CRCashedCB.checked) {
                            // 1️⃣ Fetch Member List
                            console.log("[Cheque Register] Loading account-name selection list for non-cashed cheques");
                            const response = await fetch('/fetchmemberListforPandR');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }
                            const data = await response.json();
                            const tableBody = document.querySelector('#CRmemlistTable tbody');
                            tableBody.innerHTML = '';
                            // 2️⃣ Populate Member List Table
                            data.AccName.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
            <td><input type="checkbox" class="CRmemlistDiv-CR" value="${row.SLID}"></td>
            <td>${index + 1}</td>
            <td>${row.SLName}</td>
            <td>${row.SlAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            console.log("[Cheque Register] Account-name selection list loaded:", data.AccName.length);
                            // Show selection screen
                            CRmemSelectTypeDiv.style.display = 'block';
                            //allTypeNaccNameMainDiv.style.display = 'none';

                            // 3️⃣ Select All / Unselect All buttons
                            document.getElementById("CRmemlistselectallButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRmemlistDiv-CR").forEach(c => c.checked = true);
                            };

                            document.getElementById("CRmemlistunselectButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRmemlistDiv-CR").forEach(c => c.checked = false);
                            };

                            document.getElementById("CRmemlistCancelButton").onclick = (e) => {
                                e.preventDefault();
                                const CRmemSelectTypeDiv = document.getElementById("CRmemSelectTypeDiv");
                                CRmemSelectTypeDiv.style.display = 'none';
                            };
                            // 3️⃣ Handle form submit
                            CRmemListForm.onsubmit = async (e) => {
                                e.preventDefault();

                                const checkedCRmemValuesCR = Array.from(
                                    document.querySelectorAll('.CRmemlistDiv-CR:checked')
                                ).map(c => ({ SLID: c.value }));

                                if (checkedCRmemValuesCR.length === 0) {
                                    showCustomAlert('No values selected');
                                    return;
                                }

                                // 4️⃣ Fetch filtered  data (SLID version)
                                console.log("[Cheque Register] Requesting selected non-cashed accounts:", checkedCRmemValuesCR);
                                const response2 = await fetch('/fetch-chequeCashUCNNonCash-filterdata', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR, checkedCRmemValuesCR }),
                                });

                                if (!response2.ok) {
                                    console.error('[Cheque Register] Selected non-cashed-account request failed:', response2.status, await response2.text());
                                    return;
                                }

                                const result = await response2.json();
                                const fetchedData = result.data || result;

                                console.log("[Cheque Register] Selected non-cashed-account response:", fetchedData.length, fetchedData);

                                // 5️⃣ Populate main table
                                renderChequeRows(fetchedData);

                                // 6️⃣ Show the main table now that data is ready
                                mainCashNNonCashDiv.style.display = 'block';
                                CRmemSelectTypeDiv.style.display = 'none';
                            };

                        }

                        if (!CRSelectAllType.checked && CRCashedCB.checked && CRSelectAllAccount.checked && !CRNonCashedCB.checked) {
                            // 1️⃣ Fetch Member List
                            console.log("[Cheque Register] Loading account-type selection list for cashed cheques");
                            const response = await fetch('/fetchLedgerListforPandR');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }
                            const data = await response.json();
                            const tableBody = document.querySelector('#CRlgrlistTable tbody');
                            tableBody.innerHTML = '';
                            // 2️⃣ Populate Member List Table
                            data.postingLedgers.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
            <td><input type="checkbox" class="CRlgrlistDiv-CR" value="${row.GLID}"></td>
            <td>${index + 1}</td>
            <td>${row.GLName}</td>
            <td>${row.GLAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            console.log("[Cheque Register] Account-type selection list loaded:", data.postingLedgers.length);
                            // Show selection screen
                            CRlgrSelectTypeDiv.style.display = 'block';
                            //allTypeNaccNameMainDiv.style.display = 'none';

                            // 3️⃣ Select All / Unselect All buttons
                            document.getElementById("CRlgrlistselectallButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRlgrlistDiv-CR").forEach(c => c.checked = true);
                            };

                            document.getElementById("CRlgrlistunselectButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRlgrlistDiv-CR").forEach(c => c.checked = false);
                            };

                            // 3️⃣ Handle form submit
                            CRlgrListForm.onsubmit = async (e) => {
                                e.preventDefault();

                                const checkedCRlgrValuesCR = Array.from(
                                    document.querySelectorAll('.CRlgrlistDiv-CR:checked')
                                ).map(c => ({ GLID: c.value }));

                                if (checkedCRlgrValuesCR.length === 0) {
                                    showCustomAlert('No values selected');
                                    return;
                                }

                                // 4️⃣ Fetch filtered  data (GLID version)
                                console.log("[Cheque Register] Requesting selected cashed account types:", checkedCRlgrValuesCR);
                                const response2 = await fetch('/fetch-chequeCashNNonCashUC-filterdata2', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR, checkedCRlgrValuesCR }),
                                });

                                if (!response2.ok) {
                                    console.error('[Cheque Register] Selected cashed account-type request failed:', response2.status, await response2.text());
                                    return;
                                }

                                const result = await response2.json();
                                const fetchedData = result.data || result;

                                console.log("[Cheque Register] Selected cashed account-type response:", fetchedData.length, fetchedData);

                                // 5️⃣ Populate main table
                                renderChequeRows(fetchedData);

                                // 6️⃣ Show the main table now that data is ready
                                mainCashNNonCashDiv.style.display = 'block';
                                CRmemSelectTypeDiv.style.display = 'none';
                            };

                        }

                        if (!CRSelectAllType.checked && !CRCashedCB.checked && CRSelectAllAccount.checked && CRNonCashedCB.checked) {
                            // 1️⃣ Fetch Member List
                            console.log("[Cheque Register] Loading account-type selection list for non-cashed cheques");
                            const response = await fetch('/fetchLedgerListforPandR');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }
                            const data = await response.json();
                            const tableBody = document.querySelector('#CRlgrlistTable tbody');
                            tableBody.innerHTML = '';
                            // 2️⃣ Populate Member List Table
                            data.postingLedgers.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
            <td><input type="checkbox" class="CRlgrlistDiv-CR" value="${row.GLID}"></td>
            <td>${index + 1}</td>
            <td>${row.GLName}</td>
            <td>${row.GLAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            console.log("[Cheque Register] Account-type selection list loaded:", data.postingLedgers.length);
                            // Show selection screen
                            CRlgrSelectTypeDiv.style.display = 'block';
                            //allTypeNaccNameMainDiv.style.display = 'none';

                            // 3️⃣ Select All / Unselect All buttons
                            document.getElementById("CRlgrlistselectallButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRlgrlistDiv-CR").forEach(c => c.checked = true);
                            };

                            document.getElementById("CRlgrlistunselectButton").onclick = (e) => {
                                e.preventDefault();
                                document.querySelectorAll(".CRlgrlistDiv-CR").forEach(c => c.checked = false);
                            };

                            // 3️⃣ Handle form submit
                            CRlgrListForm.onsubmit = async (e) => {
                                e.preventDefault();

                                const checkedCRlgrValuesCR = Array.from(
                                    document.querySelectorAll('.CRlgrlistDiv-CR:checked')
                                ).map(c => ({ GLID: c.value }));

                                if (checkedCRlgrValuesCR.length === 0) {
                                    showCustomAlert('No values selected');
                                    return;
                                }

                                // 4️⃣ Fetch filtered  data (SLID version)
                                console.log("[Cheque Register] Requesting selected non-cashed account types:", checkedCRlgrValuesCR);
                                const response2 = await fetch('/fetch-chequeCashNNonCashUC-data', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ dateFromChequeR, dateToChequeR, checkedCRlgrValuesCR }),
                                });

                                if (!response2.ok) {
                                    console.error('[Cheque Register] Selected non-cashed account-type request failed:', response2.status, await response2.text());
                                    return;
                                }

                                const result = await response2.json();
                                const fetchedData = result.data || result;

                                console.log("[Cheque Register] Selected non-cashed account-type response:", fetchedData.length, fetchedData);

                                // 5️⃣ Populate main table
                                renderChequeRows(fetchedData);

                                // 6️⃣ Show the main table now that data is ready
                                mainCashNNonCashDiv.style.display = 'block';
                                CRmemSelectTypeDiv.style.display = 'none';
                            };

                        }


                    });
                });
