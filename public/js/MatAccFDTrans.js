
                //Maturity Account FD Transfer
                document.addEventListener("DOMContentLoaded", async () => {
                    try {
                        const response = await fetch("/subledger-maturity");
                        if (!response.ok) throw new Error("Failed to fetch data");

                        const data = await response.json();

                        if (!Array.isArray(data) || data.length === 0) {
                            console.log("No recordsmpp found");
                            return;
                        }

                        const tableBody = document.querySelector("#maturityFDTransTab tbody");
                        tableBody.innerHTML = "";

                        data.forEach((row, index) => {
                            const tr = document.createElement("tr");
                            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.GLName || ""}</td>
                <td>${row.SlAlias || ""}</td>
                <td>${row.SLName || ""}</td>
                <td>${row.MemberAlias || ""}</td>
                <td>${row.Address1 || ""}</td>
                <td>${row.Phone1 || ""}</td>
                <td>${row.Mobile || ""}</td>
                <td><input type="checkbox" ${row.Mobile ? "checked" : ""}></td>
                <td>${row.MaturityDate ? new Date(row.MaturityDate).toLocaleDateString() : ""}</td>
                <td>${row.TransferSlAlias || ""}</td>
                <td>${row.TransferSLName || ""}</td>
            `;
                            tableBody.appendChild(tr);
                        });
                    } catch (err) {
                        console.error("Fetch Error:", err);
                    }
                });

 