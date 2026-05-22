
                document.addEventListener('DOMContentLoaded', () => {
                    const mainFormCostOfFund = document.getElementById('myForm16');
                    const SavingorLoan = document.getElementById('SavingorLoanForm');
                    const Savingledger = document.getElementById('savingLedgerCOF');
                    const Loanledger = document.getElementById('loanLedgerCOF');
                    const ASavingNCLoan = document.getElementById('allSavingNchoosenLoan');
                    const ALoanNCSaving = document.getElementById('allLoanNchoosenSaving');
                    const UCLoanLedgerDiv = document.getElementById('unCheckedloanLedgerCOF');
                    const UCSavingLedgerDiv = document.getElementById('unCheckedsavingLedgerCOF');
                    const ASavingALoan = document.getElementById('UCSavingorLoanForm');
                    const UCCOFSearchPattern = document.getElementById('UCCOFSearchPattern');
                    const UCLCOFSearchPattern = document.getElementById('UCLCOFSearchPattern');
                    const LCOFSearchPattern = document.getElementById('LCOFSearchPattern');
                    const SCOFSearchPattern = document.getElementById('SCOFSearchPattern');



                    const closeButtons = [
                        { buttonId: 'COFCloseButton', div: SavingorLoan },
                        { buttonId: 'COFOkButton', div: SavingorLoan },
                        { buttonId: 'savingCOFcloseButton', div: Savingledger },
                        { buttonId: 'loanCOFcloseButton', div: Loanledger },
                        { buttonId: 'allSavingNchooseLoanCloseBtn', div: ASavingNCLoan },
                        { buttonId: 'allSavingNchooseLoanOkButton', div: ASavingNCLoan },
                        { buttonId: 'allLoanNchooseSavingCloseBtn', div: ALoanNCSaving },
                        { buttonId: 'allLoanNchooseSavingOkButton', div: ALoanNCSaving },
                        { buttonId: 'unCheckedsavingCOFcloseButton', div: UCSavingLedgerDiv },
                        { buttonId: 'unCheckedloanCOFcloseButton', div: UCLoanLedgerDiv },
                        { buttonId: 'UCCOFCloseButton', div: ASavingALoan },
                        { buttonId: 'UNCOFSearchPatternCancelSec', div: UCCOFSearchPattern },
                        { buttonId: 'UNCOFPatternCloseButton', div: UCCOFSearchPattern },
                        { buttonId: 'UCLCOFSearchPatternCancelSec', div: UCLCOFSearchPattern },
                        { buttonId: 'UCLCOFPatternCloseButton', div: UCLCOFSearchPattern },
                        { buttonId: 'LCOFSearchPatternCancelSec', div: LCOFSearchPattern },
                        { buttonId: 'LCOFPatternCloseButton', div: LCOFSearchPattern },
                        { buttonId: 'SCOFSearchPatternCancelSec', div: SCOFSearchPattern },
                        { buttonId: 'SCOFPatternCloseButton', div: SCOFSearchPattern }


                    ];

                    closeButtons.forEach(({ buttonId, div }) => {
                        document.getElementById(buttonId).addEventListener('click', function (e) {
                            e.preventDefault();
                            div.style.display = 'none';
                        });
                    });

                    document.getElementById("SCOFselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".Savingledger-COF").forEach(checkbox => {
                            checkbox.checked = true;
                        });
                    });

                    document.getElementById("SCOFunselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".Savingledger-COF").forEach(checkbox => {
                            checkbox.checked = false;
                        });
                    });

                    document.getElementById("LCOFselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".Loanledger-COF").forEach(checkbox => {
                            checkbox.checked = true;
                        });
                    });

                    document.getElementById("LCOFunselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".Loanledger-COF").forEach(checkbox => {
                            checkbox.checked = false;
                        });
                    });

                    document.getElementById("UCSCOFselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".UCSavingledger-COF").forEach(checkbox => {
                            checkbox.checked = true;
                        });
                    });

                    document.getElementById("UCSCOFunselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".UCSavingledger-COF").forEach(checkbox => {
                            checkbox.checked = false;
                        });
                    });

                    document.getElementById("UCLCOFselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".UCLoanledger-COF").forEach(checkbox => {
                            checkbox.checked = true;
                        });
                    });

                    document.getElementById("UCLCOFunselectAll").addEventListener("click", function (e) {
                        e.preventDefault();
                        document.querySelectorAll(".UCLoanledger-COF").forEach(checkbox => {
                            checkbox.checked = false;
                        });
                    });


                    document.getElementById('UCSCOFPattern').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('UCCOFSearchPattern').style.display = 'block';
                    });
                    document.getElementById("UCCOFSearchPatternForm").addEventListener("submit", function (e) {
                        e.preventDefault(); // Prevent form submission


                        // Get the input pattern
                        const inputPattern = document.getElementById("UNCOFpatternInputSec").value.trim();


                        // Uncheck all checkboxes before applying the new search
                        document.querySelectorAll(".UCSavingledger-COF").forEach(checkbox => {
                            checkbox.checked = false; // Reset all checkboxes
                        });
                        // Loop through checkboxes and check those matching the pattern
                        document.querySelectorAll(".UCSavingledger-COF").forEach(checkbox => {
                            const valueParts = checkbox.value.split("|")[0]; // Extract part before '|'
                            const firstWord = valueParts.split(" ")[0]; // Extract the first word

                            // Check if the first word matches the pattern
                            if (firstWord.toLowerCase().startsWith(inputPattern.toLowerCase())) {
                                checkbox.checked = true;
                            }
                        });
                    });

                    document.getElementById("UCCOFSearchPatternForm").addEventListener("submit", function (event) {
                        event.preventDefault(); // Prevent form submission
                        document.getElementById('UCCOFSearchPattern').style.display = 'none';
                        document.getElementById('UNCOFpatternInputSec').value = '';
                    });


                    document.getElementById('UCLCOFPattern').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('UCLCOFSearchPattern').style.display = 'block';
                    });
                    document.getElementById("UCLCOFSearchPatternForm").addEventListener("submit", function (e) {
                        e.preventDefault(); // Prevent form submission


                        // Get the input pattern
                        const inputPattern = document.getElementById("UNLCOFpatternInputSec").value.trim();


                        // Uncheck all checkboxes before applying the new search
                        document.querySelectorAll(".UCLoanledger-COF").forEach(checkbox => {
                            checkbox.checked = false; // Reset all checkboxes
                        });
                        // Loop through checkboxes and check those matching the pattern
                        document.querySelectorAll(".UCLoanledger-COF").forEach(checkbox => {
                            const valueParts = checkbox.value.split("|")[0]; // Extract part before '|'
                            const firstWord = valueParts.split(" ")[0]; // Extract the first word

                            // Check if the first word matches the pattern
                            if (firstWord.toLowerCase().startsWith(inputPattern.toLowerCase())) {
                                checkbox.checked = true;
                            }
                        });
                    });

                    document.getElementById("UCLCOFSearchPatternForm").addEventListener("submit", function (event) {
                        event.preventDefault(); // Prevent form submission
                        document.getElementById('UCLCOFSearchPattern').style.display = 'none';
                        document.getElementById('UNLCOFpatternInputSec').value = '';
                    });

                    document.getElementById('UCLOFcancelButton').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('unCheckedloanLedgerCOF').style.display = 'none';
                    });

                    document.getElementById('LCOFcancelButton').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('loanLedgerCOF').style.display = 'none';
                    });


                    document.getElementById('LCOFPattern').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('LCOFSearchPattern').style.display = 'block';
                    });
                    document.getElementById("LCOFSearchPatternForm").addEventListener("submit", function (e) {
                        e.preventDefault(); // Prevent form submission


                        // Get the input pattern
                        const inputPattern = document.getElementById("LCOFpatternInputSec").value.trim();


                        // Uncheck all checkboxes before applying the new search
                        document.querySelectorAll(".Loanledger-COF").forEach(checkbox => {
                            checkbox.checked = false; // Reset all checkboxes
                        });
                        // Loop through checkboxes and check those matching the pattern
                        document.querySelectorAll(".Loanledger-COF").forEach(checkbox => {
                            const valueParts = checkbox.value.split("|")[0]; // Extract part before '|'
                            const firstWord = valueParts.split(" ")[0]; // Extract the first word

                            // Check if the first word matches the pattern
                            if (firstWord.toLowerCase().startsWith(inputPattern.toLowerCase())) {
                                checkbox.checked = true;
                            }
                        });
                    });

                    document.getElementById("LCOFSearchPatternForm").addEventListener("submit", function (event) {
                        event.preventDefault(); // Prevent form submission
                        document.getElementById('LCOFSearchPattern').style.display = 'none';
                        document.getElementById('LCOFpatternInputSec').value = '';
                    });

                    document.getElementById("SCOFSearchPatternForm").addEventListener("submit", function (event) {
                        event.preventDefault(); // Prevent form submission
                        document.getElementById('SCOFSearchPattern').style.display = 'none';
                        document.getElementById('SCOFpatternInputSec').value = '';
                    });

                    document.getElementById('SCOFcancelButton').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('savingLedgerCOF').style.display = 'none';
                    });



                    document.getElementById('SCOFPattern').addEventListener('click', function (e) {
                        e.preventDefault();
                        document.getElementById('SCOFSearchPattern').style.display = 'block';
                    });
                    document.getElementById("SCOFSearchPatternForm").addEventListener("submit", function (e) {
                        e.preventDefault(); // Prevent form submission


                        // Get the input pattern
                        const inputPattern = document.getElementById("SCOFpatternInputSec").value.trim();


                        // Uncheck all checkboxes before applying the new search
                        document.querySelectorAll(".Savingledger-COF").forEach(checkbox => {
                            checkbox.checked = false; // Reset all checkboxes
                        });
                        // Loop through checkboxes and check those matching the pattern
                        document.querySelectorAll(".Savingledger-COF").forEach(checkbox => {
                            const valueParts = checkbox.value.split("|")[0]; // Extract part before '|'
                            const firstWord = valueParts.split(" ")[0]; // Extract the first word

                            // Check if the first word matches the pattern
                            if (firstWord.toLowerCase().startsWith(inputPattern.toLowerCase())) {
                                checkbox.checked = true;
                            }
                        });
                    });

                    document.getElementById("SCOFSearchPatternForm").addEventListener("submit", function (event) {
                        event.preventDefault(); // Prevent form submission
                        document.getElementById('SCOFSearchPattern').style.display = 'none';
                        document.getElementById('SCOFpatternInputSec').value = '';
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

                    makeDivMovable(SavingorLoan);
                    makeDivMovable(Savingledger);
                    makeDivMovable(Loanledger);
                    makeDivMovable(ASavingNCLoan);
                    makeDivMovable(ALoanNCSaving);
                    makeDivMovable(UCLoanLedgerDiv);
                    makeDivMovable(UCSavingLedgerDiv);
                    makeDivMovable(ASavingALoan); //
                    makeDivMovable(UCCOFSearchPattern);
                    makeDivMovable(UCLCOFSearchPattern);
                    makeDivMovable(LCOFSearchPattern);
                    makeDivMovable(SCOFSearchPattern); //

                    mainFormCostOfFund.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        const startDate = document.getElementById('startDate').value;
                        const endDate = document.getElementById('endDate').value;
                        const savingCheckbox = document.getElementById('select-all-saving');
                        const loanCheckBox = document.getElementById('select-all-loan');

                        SavingorLoan.style.display = 'none';




                        if (savingCheckbox.checked && loanCheckBox.checked) {
                            // Fetch data and populate the table

                            const response = await fetch('/fetch-savingloanandBank-data');
                            const data = await response.json();

                            const savingSection = document.getElementById('saving-section');
                            const loanSection = document.getElementById('loan-section');

                            savingSection.innerHTML = '<tr><th colspan="5">Saving A/c</th></tr>'; // Clear existing rows and add header
                            loanSection.innerHTML = '<tr><th colspan="5">Loan A/c</th></tr>';     // Clear existing rows and add header

                            let savingIndex = 1;
                            let loanIndex = 1;

                            let totalSavingCount = 0;
                            let totalSavingAmount = 0;
                            let totalLoanCount = 0;
                            let totalLoanAmount = 0;

                            data.forEach(row => {
                                const tableRow = `
            <tr>
                <td>${row.SavingorLoan === 'Saving' ? savingIndex++ : loanIndex++}</td>
                <td>${row.GLName}</td>
                <td>${row.GLAlias}</td>
                <td>${row.GLID_Count}</td>
                <td>${row.Net_Amount.toFixed(2)}</td>
            </tr>
        `;

                                if (row.SavingorLoan === 'Saving') {
                                    savingSection.innerHTML += tableRow;
                                    totalSavingCount += row.GLID_Count;
                                    totalSavingAmount += row.Net_Amount;
                                } else if (row.SavingorLoan === 'Loan') {
                                    loanSection.innerHTML += tableRow;
                                    totalLoanCount += row.GLID_Count;
                                    totalLoanAmount += row.Net_Amount;
                                }
                            });

                            // Add totals row for Saving
                            savingSection.innerHTML += `
        <tr>
            <td colspan="3" style="font-weight: bold;">Total</td>
            <td style="font-weight: bold;">${totalSavingCount}</td>
            <td style="font-weight: bold;">${totalSavingAmount.toFixed(2)}</td>
        </tr>
    `;

                            // Add totals row for Loan
                            loanSection.innerHTML += `
        <tr>
            <td colspan="3" style="font-weight: bold;">Total</td>
            <td style="font-weight: bold;">${totalLoanCount}</td>
            <td style="font-weight: bold;">${totalLoanAmount.toFixed(2)}</td>
        </tr>
    `;
                            SavingorLoan.style.display = 'block';
                            Loanledger.style.display = 'none';
                            Savingledger.style.display = 'none';
                        }



                        const includeBankCheckbox = document.getElementById('include-bank');
                        const bankSection = document.getElementById('bank-section');
                        const UCbanksection = document.getElementById('UCbank-section');
                        const allSavingbanksection = document.getElementById('allSaving-bank-section');
                        const allBankSection = document.getElementById('all-bank-section');

                        includeBankCheckbox.addEventListener('change', async (event) => {
                            if (event.target.checked) {
                                try {
                                    const response = await fetch('/get-bank-cost-of-fund');
                                    const data = await response.json();

                                    // Clear previous data
                                    const sections = [bankSection, UCbanksection, allSavingbanksection, allBankSection];
                                    sections.forEach(section => {
                                        section.innerHTML = '<tr><th colspan="5">Bank A/c</th></tr>';
                                    });

                                    let bankIndex = 1;
                                    let totalBankAmount = 0;
                                    let totalBankCount = data.length; // Corrected count

                                    data.forEach(row => {
                                        const tableRow = `
                    <tr>
                        <td>${bankIndex++}</td>
                        <td>${row.GLName}</td>
                        <td>${row.GLAlias}</td>
                        <td></td>
                        <td>${row.NetAmount}</td>
                    </tr>
                `;
                                        sections.forEach(section => section.innerHTML += tableRow);
                                        totalBankAmount += row.NetAmount;
                                    });

                                    // Add totals row for all sections
                                    sections.forEach(section => {
                                        section.innerHTML += `
                    <tr>
                        <td colspan="3" style="font-weight: bold;">Total</td>
                        <td style="font-weight: bold;">${totalBankCount}</td>
                        <td style="font-weight: bold;">${totalBankAmount.toFixed(2)}</td>
                    </tr>
                `;
                                        section.style.display = 'block'; // Show sections when data is available
                                    });

                                } catch (error) {
                                    console.error('Error fetching bank data:', error);
                                }
                            } else {
                                // Hide all sections when unchecked
                                [bankSection, UCbanksection, allSavingbanksection, allBankSection].forEach(section => {
                                    section.style.display = 'none';
                                });
                            }
                        });


                        if (!savingCheckbox.checked) {


                            const response = await fetch('/get-savingledger-cost-of-fund');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }

                            const data = await response.json();
                            const tableBody = document.querySelector('#costofFundsavingLedger tbody');
                            tableBody.innerHTML = ''; // Clear existing rows

                            data.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                    <td> <input type="checkbox" class="Savingledger-COF" value="${row.GLName}|${row.GLAlias}"></td>
        <td>${index + 1}</td>
            <td>${row.GLName}</td>
            <td>${row.GLAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            Savingledger.style.display = 'block';
                            Loanledger.style.display = 'none';
                            SavingorLoan.style.display = 'none';
                        }

                        if (!loanCheckBox.checked) {
                            const response = await fetch('/get-loanledger-cost-of-fund');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }

                            const data = await response.json();
                            const tableBody = document.querySelector('#costofFundloanLedger tbody');
                            tableBody.innerHTML = ''; // Clear existing rows

                            data.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                <td> <input type="checkbox" class="Loanledger-COF" value="${row.GLName}|${row.GLAlias}"></td>
        <td>${index + 1}</td>
            <td>${row.GLName}</td>
            <td>${row.GLAlias}</td>
        `;
                                tableBody.appendChild(tr);
                            });
                            Loanledger.style.display = 'block';
                            Savingledger.style.display = 'none';
                            SavingorLoan.style.display = 'none';
                        }


                        // if saving is checked andloan is unchecked
                        document.getElementById('loanCOFForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const checkedLoanValues = Array.from(document.querySelectorAll('.Loanledger-COF:checked'))
                                .map(checkbox => {
                                    const [GLName, GLAlias] = checkbox.value.split('|');
                                    return { GLName, GLAlias };
                                });


                            if (checkedLoanValues.length > 0) {
                                const response = await fetch('/checked-loan-values', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ checkedLoanValues }),
                                });

                                if (response.ok) {

                                    document.getElementById('loanOkButton').addEventListener('click', () => {
                                        ASavingNCLoan.style.display = 'block';
                                        Loanledger.style.display = 'none';

                                    });
                                    const data = await response.json();
                                    renderloanTable(data);
                                } else {
                                    console.error('Failed to fetch data');
                                }
                            } else {
                                showCustomAlert('No values selected');
                            }
                        });

                        function renderloanTable(data) {
                            const table = document.getElementById('choosen-loan-section');
                            table.innerHTML = ''; // Clear previous table data

                            let totalGLIDCount = 0;
                            let totalNetAmount = 0;

                            data.forEach((item, index) => {
                                totalGLIDCount += item.GLID_Count; // Accumulate GLID_Count
                                totalNetAmount += item.Net_Amount; // Accumulate Net_Amount

                                const row = `
    <tr>
        <td>${index + 1}</td>
        <td>${item.GLName}</td>
        <td>${item.GLAlias}</td>
        <td>${item.GLID_Count}</td>
        <td>${item.Net_Amount.toFixed(2)}</td>
    </tr>
  `;
                                table.insertAdjacentHTML('beforeend', row);
                            });

                            // Append totals row
                            const totalsRow = `
  <tr>
    <td colspan="3" style="font-weight: bold; text-align: right;">Total:</td>
    <td style="font-weight: bold;">${totalGLIDCount}</td>
    <td style="font-weight: bold;">${totalNetAmount.toFixed(2)}</td>
  </tr>
  `;
                            table.insertAdjacentHTML('beforeend', totalsRow);
                        }

                        // if Loan is checked and Saving is unchecked
                        document.getElementById('savingCOFForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const checkedSavingValues = Array.from(document.querySelectorAll('.Savingledger-COF:checked'))
                                .map(checkbox => {
                                    const [GLName, GLAlias] = checkbox.value.split('|');
                                    return { GLName, GLAlias };
                                });


                            if (checkedSavingValues.length > 0) {
                                const response = await fetch('/checked-saving-values', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ checkedSavingValues }),
                                });

                                if (response.ok) {

                                    document.getElementById('savingCOFOkButton').addEventListener('click', () => {
                                        ALoanNCSaving.style.display = 'block';
                                        Savingledger.style.display = 'none';

                                    });
                                    const data = await response.json();
                                    rendersavingTable(data);
                                } else {
                                    console.error('Failed to fetch data');
                                }
                            } else {
                                showCustomAlert('No values selected');
                            }
                        });

                        function rendersavingTable(data) {
                            const table = document.getElementById('choosen-saving-section');
                            table.innerHTML = ''; // Clear previous table data

                            let totalGLIDCount = 0;
                            let totalNetAmount = 0;

                            data.forEach((item, index) => {
                                totalGLIDCount += item.GLID_Count; // Accumulate GLID_Count
                                totalNetAmount += item.Net_Amount; // Accumulate Net_Amount

                                const row = `
    <tr>
        <td>${index + 1}</td>
        <td>${item.GLName}</td>
        <td>${item.GLAlias}</td>
        <td>${item.GLID_Count}</td>
        <td>${item.Net_Amount.toFixed(2)}</td>
    </tr>
  `;
                                table.insertAdjacentHTML('beforeend', row);
                            });

                            // Append totals row
                            const totalsRow = `
  <tr>
    <td colspan="3" style="font-weight: bold; text-align: right;">Total:</td>
    <td style="font-weight: bold;">${totalGLIDCount}</td>
    <td style="font-weight: bold;">${totalNetAmount.toFixed(2)}</td>
  </tr>
  `;
                            table.insertAdjacentHTML('beforeend', totalsRow);
                        }


                        if (!savingCheckbox.checked && !loanCheckBox.checked) {

                            // Fetch Savings Ledger Data
                            const response = await fetch('/get-UCsavingledger-cost-of-fund');
                            if (!response.ok) {
                                throw new Error('Failed to fetch data');
                            }

                            const data = await response.json();
                            const tableBody = document.querySelector('#unCheckedcostofFundsavingLedger tbody');
                            tableBody.innerHTML = ''; // Clear existing rows

                            data.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                <td> <input type="checkbox" class="UCSavingledger-COF" value="${row.GLName}|${row.GLAlias}"></td>
                <td>${index + 1}</td>
                <td>${row.GLName}</td>
                <td>${row.GLAlias}</td>
            `;
                                tableBody.appendChild(tr);
                            });

                            // Fetch Loan Ledger Data
                            const response1 = await fetch('/get-UCloanledger-cost-of-fund');
                            if (!response1.ok) {
                                throw new Error('Failed to fetch data');
                            }

                            const data1 = await response1.json();
                            const tableBody1 = document.querySelector('#unCheckedcostofFundloanLedger tbody');
                            tableBody1.innerHTML = ''; // Clear existing rows

                            data1.forEach((row, index) => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                <td> <input type="checkbox" class="UCLoanledger-COF" value="${row.GLName}|${row.GLAlias}"></td>
                <td>${index + 1}</td>
                <td>${row.GLName}</td>
                <td>${row.GLAlias}</td>
            `;
                                tableBody1.appendChild(tr);
                            });

                            // Show and Hide Elements
                            UCSavingLedgerDiv.style.display = 'block';
                            UCLoanLedgerDiv.style.display = 'none';
                            Savingledger.style.display = 'none';
                            Loanledger.style.display = 'none';
                            SavingorLoan.style.display = 'none';

                        }


                        document.getElementById('unCheckedsavingCOFForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            console.log('Form Submitted')
                            const checkedSavingValues = Array.from(document.querySelectorAll('.UCSavingledger-COF:checked'))
                                .map(checkbox => {
                                    const [GLName, GLAlias] = checkbox.value.split('|');
                                    return { GLName, GLAlias };
                                });

                            if (checkedSavingValues.length > 0) {
                                const response = await fetch('/unchecked-saving-values', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ checkedSavingValues }),
                                });

                                if (response.ok) {
                                    const data = await response.json();
                                    renderSavingTable(data);
                                } else {
                                    console.error('Failed to fetch data');
                                }
                            } else {
                                showCustomAlert('No values selected');
                            }

                        });

                        function renderSavingTable(data) {
                            const table = document.getElementById('UCsaving-section');
                            table.innerHTML = '<th colspan=5>Saving A/c</th>'; // Correct title

                            let totalGLIDCount = 0;
                            let totalNetAmount = 0;

                            data.forEach((item, index) => {
                                totalGLIDCount += item.GLID_Count; // Accumulate GLID_Count
                                totalNetAmount += item.Net_Amount; // Accumulate Net_Amount

                                const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.GLName}</td>
                <td>${item.GLAlias}</td>
                <td>${item.GLID_Count}</td>
                <td>${item.Net_Amount.toFixed(2)}</td>
            </tr>
        `;
                                table.insertAdjacentHTML('beforeend', row);
                            });

                            // Append totals row
                            const totalsRow = `
        <tr>
            <td colspan="3" style="font-weight: bold; text-align: right;">Total:</td>
            <td style="font-weight: bold;">${totalGLIDCount}</td>
            <td style="font-weight: bold;">${totalNetAmount.toFixed(2)}</td>
        </tr>
    `;
                            table.insertAdjacentHTML('beforeend', totalsRow);
                        }

                        document.getElementById('unCheckedsavingOkButton').addEventListener('click', function () {

                            UCSavingLedgerDiv.style.display = 'none';
                            UCLoanLedgerDiv.style.display = 'block';
                        });
                        document.getElementById('UCSCOFCloseButton').addEventListener('click', function (e) {
                            e.preventDefault();
                            UCSavingLedgerDiv.style.display = 'none';
                        });

                        // Loan Form Submission
                        document.getElementById('unCheckedloanCOFForm').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const checkedLoanValues = Array.from(document.querySelectorAll('.UCLoanledger-COF:checked'))
                                .map(checkbox => {
                                    const [GLName, GLAlias] = checkbox.value.split('|');
                                    return { GLName, GLAlias };
                                });

                            if (checkedLoanValues.length > 0) {
                                const response = await fetch('/unchecked-loan-values', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ checkedLoanValues }),
                                });

                                if (response.ok) {
                                    const data = await response.json();
                                    renderLoanTable(data);
                                } else {
                                    console.error('Failed to fetch data');
                                }
                            } else {
                                showCustomAlert('No values selected');
                            }
                        });

                        // Loan Table Rendering
                        function renderLoanTable(data) {
                            const table = document.getElementById('UCloan-section');
                            table.innerHTML = '<th colspan=5>Loan A/c</th>'; // Correct title

                            let totalGLIDCount = 0;
                            let totalNetAmount = 0;

                            data.forEach((item, index) => {
                                totalGLIDCount += item.GLID_Count; // Accumulate GLID_Count
                                totalNetAmount += item.Net_Amount; // Accumulate Net_Amount

                                const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.GLName}</td>
                <td>${item.GLAlias}</td>
                <td>${item.GLID_Count}</td>
                <td>${item.Net_Amount.toFixed(2)}</td>
            </tr>
        `;
                                table.insertAdjacentHTML('beforeend', row);
                            });

                            // Append totals row
                            const totalsRow = `
        <tr>
            <td colspan="3" style="font-weight: bold; text-align: right;">Total:</td>
            <td style="font-weight: bold;">${totalGLIDCount}</td>
            <td style="font-weight: bold;">${totalNetAmount.toFixed(2)}</td>
        </tr>
    `;
                            table.insertAdjacentHTML('beforeend', totalsRow);
                        }
                        if (!savingCheckbox.checked && loanCheckBox.checked) {
                            // Fetch data and populate the table

                            const response = await fetch('/fetch-ALoanNCSaving-data');
                            const data = await response.json();

                            const LoanSection = document.getElementById('all-selected-loan-section');


                            LoanSection.innerHTML = '<tr><th colspan="5">Loan A/c</th></tr>'; // Clear existing rows and add header

                            let totalLoanCount = 0;
                            let totalLoanAmount = 0;

                            data.forEach((row, index) => {
                                const tableRow = `
            <tr>
                <td>${index + 1}</td>
                <td>${row.GLName}</td>
                <td>${row.GLAlias}</td>
                <td>${row.GLID_Count}</td>
                <td>${row.Net_Amount.toFixed(2)}</td>
            </tr>
        `;
                                LoanSection.innerHTML += tableRow;
                                totalLoanCount += row.GLID_Count;
                                totalLoanAmount += row.Net_Amount;

                            });

                            // Add totals row for Saving
                            LoanSection.innerHTML += `
        <tr>
            <td colspan="3" style="font-weight: bold;">Total</td>
            <td style="font-weight: bold;">${totalLoanCount}</td>
            <td style="font-weight: bold;">${totalLoanAmount.toFixed(2)}</td>
        </tr>
    `;
                            SavingorLoan.style.display = 'none';
                            Loanledger.style.display = 'none';
                            Savingledger.style.display = 'block';
                            UCSavingLedgerDiv.style.display = 'none';
                        }

                        if (savingCheckbox.checked && !loanCheckBox.checked) {
                            // Fetch data and populate the table

                            const response = await fetch('/fetch-ASavingNCLoan-data');
                            const data = await response.json();

                            const savingSection = document.getElementById('all-selected-saving-section');


                            savingSection.innerHTML = '<tr><th colspan="5">Saving A/c</th></tr>'; // Clear existing rows and add header
                            let savingIndex = 1;
                            let totalSavingCount = 0;
                            let totalSavingAmount = 0;

                            data.forEach(row => {
                                const tableRow = `
            <tr>
                <td>${row.SavingorLoan === 'Saving' ? savingIndex++ : loanIndex++}</td>
                <td>${row.GLName}</td>
                <td>${row.GLAlias}</td>
                <td>${row.GLID_Count}</td>
                <td>${row.Net_Amount.toFixed(2)}</td>
            </tr>
        `;
                                savingSection.innerHTML += tableRow;
                                totalSavingCount += row.GLID_Count;
                                totalSavingAmount += row.Net_Amount;

                            });

                            // Add totals row for Saving
                            savingSection.innerHTML += `
        <tr>
            <td colspan="3" style="font-weight: bold;">Total</td>
            <td style="font-weight: bold;">${totalSavingCount}</td>
            <td style="font-weight: bold;">${totalSavingAmount.toFixed(2)}</td>
        </tr>
    `;
                            SavingorLoan.style.display = 'none';
                            Loanledger.style.display = 'block';
                            Savingledger.style.display = 'none';
                            UCSavingLedgerDiv.style.display = 'none';


                        }



                        // Move 'unCheckedloanOkButton' event listener outside so it only attaches once
                        document.getElementById('unCheckedloanOkButton').addEventListener('click', () => {
                            ASavingALoan.style.display = 'block';
                            UCLoanLedgerDiv.style.display = 'none';

                        });

                    });
                });
