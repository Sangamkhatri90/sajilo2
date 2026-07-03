
                document.addEventListener("DOMContentLoaded", () => {
                    const form = document.getElementById("myForm11");
                    let ExcelData = null;

                    // 👉 Define all checkboxes
                    const SOCB = document.getElementById("books-cbb-SOCB"); // Summary Only
                    const SNT = document.getElementById("books-cbb-SNT");   // Show Narration (Transaction)
                    const SNM = document.getElementById("books-cbb-SNM");   // Show Narration (Master)
                    const SA = document.getElementById("books-cbb-SA");    // Show Alias
                    const SSL = document.getElementById("books-cbb-SSL");   // Show Sub Ledger
                    const STB = document.getElementById("books-cbb-STB");   // Show Transaction Balance
                    const SDB = document.getElementById("books-cbb-SDB");   // Show Day Balance
                    const SCD = document.getElementById("books-cbb-SCD");   // Show Cheque Details
                    const STC = document.getElementById("books-cbb-STC");   // Show TA Code
                    const FFU = document.getElementById("books-cbb-FFU");   // Filter For User

                    const allCheckboxes = [SOCB, SNT, SNM, SA, SSL, STB, SDB, SCD, STC, FFU];

                    /* ---------- Excelfile input ---------- */
                    const selectFileBtn = document.getElementById("cbb-fileselectbtn");
                    const excelFileInput = document.getElementById("cbb-fileselectinput");

                    selectFileBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        excelFileInput.click();
                    });

                    excelFileInput.addEventListener("change", function (e) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const workbook = XLSX.read(e.target.result, { type: 'binary' });
                            const sheet1 = workbook.Sheets['TbLedgderMaster'];
                            const sheet2 = workbook.Sheets['TbSubledgerMaster'];

                            if (!sheet1 || !sheet2) return showCustomAlert("Sheet not found.");

                            // Assign ExcelData directly
                            ExcelData = XLSX.utils.sheet_to_json(sheet1).map(row => ({
                                particular: row.GLName || '',
                                alias: row.GlAlias || '',
                                openingDebit: parseFloat(row.OpeningBalanceDr || 0),
                                openingCredit: parseFloat(row.OpeningBalanceCr || 0)
                            }));

                            ExcelData2 = XLSX.utils.sheet_to_json(sheet2).map(row => ({
                                particular: row.SLName || '',
                                alias: row.SlAlias || '',
                                openingDebit: parseFloat(row.OpeningBalanceDr || 0),
                                openingCredit: parseFloat(row.OpeningBalanceCr || 0)
                            }));

                            showCustomAlert("Excel file loaded. Click OK to load the table.");
                        };
                        reader.readAsBinaryString(file);
                    });


                    // 🧭 Define backend route map
                    const routeMap = [
                        {
                            name: "Summary Only",
                            condition: () => SOCB.checked,
                            route: "/api/cbbSummaryOnly"
                        },
                        {
                            name: "Subledger + Alias",
                            condition: () => SSL.checked && SA.checked,
                            route: "/api/cbbSubledgerAlias"
                        },
                        {
                            name: "Day Wise Balance",
                            condition: () => SDB.checked,
                            route: "/api/cbbDayWiseBalance"
                        },
                        {
                            name: "Transaction Wise Balance",
                            condition: () => STB.checked,
                            route: "/api/cbbTransactionWiseBalance"
                        },
                        {
                            name: "Cheque Details",
                            condition: () => SCD.checked,
                            route: "/api/cbbChequeDetails"
                        },
                        {
                            name: "Default",
                            condition: () => true, // always matches if others don't
                            route: "/api/cbbDefault"
                        }
                    ];

                    // 🧩 1️⃣ Disable/Enable logic when "Summary Only" is checked
                    SOCB.addEventListener("change", () => {
                        if (SOCB.checked) {
                            allCheckboxes.forEach(cb => {
                                if (cb !== SOCB && cb !== FFU) {
                                    cb.disabled = true;
                                    cb.checked = false;
                                }
                            });
                        } else {
                            allCheckboxes.forEach(cb => (cb.disabled = false));
                        }
                    });

                    // 🧩 2️⃣ Handle form submission
                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();

                        // 🗓️ Collect input values
                        const bankBook = document.getElementById("bookscashbank-bank-input").value.trim();
                        const docClass = document.getElementById("doc-class-books-cbb").value.trim();
                        const fromDate = document.getElementById("books-cbb-datefrom").value;
                        const toDate = document.getElementById("books-cbb-dateto").value;

                        if (!bankBook) {
                            return showCustomAlert("Please enter the CashBankBook value!")
                        }

                        if (!fromDate || !toDate) {
                            return showCustomAlert("Please select both From and To dates.");
                        }
                        if (!excelFileInput) {
                            return showCustomAlert("Please select excel file.");
                        }

                        // 🧠 Determine which boxes are checked
                        const anyChecked = allCheckboxes.some(cb => cb.checked);
                        let matched;

                        if (!anyChecked) {
                            matched = routeMap.find(r => r.name === "Default");
                            console.log("⚙️ No checkbox selected → Using default route");
                        } else {
                            // Match the first route that fits the condition
                            matched = routeMap.find(r => r.condition());
                        }

                        console.log("Matched route:", matched?.name || "None");

                        // 📦 Prepare payload
                        const payload = {
                            bankBook,
                            docClass,
                            fromDate,
                            toDate,
                            excelData: ExcelData,
                            options: {
                                summaryOnly: SOCB.checked,
                                showNarrationTransaction: SNT.checked,
                                showNarrationMaster: SNM.checked,
                                showAlias: SA.checked,
                                showSubLedger: SSL.checked,
                                showTransactionWiseBalance: STB.checked,
                                showDayWiseBalance: SDB.checked,
                                showChequeDetails: SCD.checked,
                                showTACode: STC.checked,
                                filterForUser: FFU.checked
                            }
                        };

                        try {
                            const response = await fetch(matched.route, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });

                            if (!response.ok) throw new Error("Failed to fetch data from backend.");

                            const data = await response.json();
                            console.log("✅ Received data:", data);

                            // Render table depending on checkbox state
                            if (SOCB.checked) {
                                renderSummaryOnlyTable(data);
                            } else {
                                renderNormalTable(data);
                            }

                        } catch (err) {
                            console.error("❌ Error:", err);
                            showCustomAlert("An error occurred while fetching data.");
                        }
                    });

                    // ⚠️ Custom alert placeholder
                    function showCustomAlert(msg) {
                        alert(msg);
                    }

                    // 📋 Render Normal Table
                    function renderNormalTable(data) {
                        const normalDiv = document.getElementById("cbb-data-normal1div");
                        const summaryDiv = document.getElementById("cbb-data-summaryonlydiv1");
                        const tableBody = document.querySelector("#cbb-data-normaltable tbody");

                        // hide summary table
                        summaryDiv.style.display = "none";
                        // show normal table
                        normalDiv.style.display = "block";

                        // Clear previous data
                        tableBody.innerHTML = "";

                        if (!data || data.length === 0) {
                            tableBody.innerHTML = `<tr><td colspan="7">No records found.</td></tr>`;
                            return;
                        }

                        data.forEach((row, i) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${row.Date || ""}</td>
        <td>${row.VoucherNo || ""}</td>
        <td>${row.Particular || ""}</td>
        <td>${row.Receipt || 0}</td>
        <td>${row.Payment || 0}</td>
        <td>${row.Balance || 0}</td>
      `;
                            tableBody.appendChild(tr);
                        });
                    }

                    // 📋 Render Summary-Only Table
                    function renderSummaryOnlyTable(data) {
                        const normalDiv = document.getElementById("cbb-data-normal1div");
                        const summaryDiv = document.getElementById("cbb-data-summaryonlydiv1");
                        const tableBody = document.querySelector("#cbb-data-summaryonlytable tbody");

                        // hide normal table
                        normalDiv.style.display = "none";
                        // show summary table
                        summaryDiv.style.display = "block";

                        // Clear previous data
                        tableBody.innerHTML = "";

                        if (!data || data.length === 0) {
                            tableBody.innerHTML = `<tr><td colspan="6">No records found.</td></tr>`;
                            return;
                        }

                        data.forEach((row, i) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${row.Date || ""}</td>
        <td>${row.OpeningBalance || 0}</td>
        <td>${row.Receipt || 0}</td>
        <td>${row.Payment || 0}</td>
        <td>${row.Balance || 0}</td>
      `;
                            tableBody.appendChild(tr);
                        });
                    }
                });
     