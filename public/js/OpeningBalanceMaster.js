
                document.getElementById("myForm123").addEventListener("submit", async (e) => {
                    try {
                        e.preventDefault();

                        const response = await fetch("/get-openingBalance-MasterEntry", {
                            method: "POST"
                        });

                        const data = await response.json();

                        const tbody = document.querySelector("#openingBalanceMETable tbody");
                        tbody.innerHTML = ""; // clear table

                        data.forEach((row, index) => {
                            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${row.VoucherNo}</td>
                    <td>${Number(row.TotalCrAmount).toLocaleString()}</td>
                    <td>${row.UserName}</td>
                    <td>${row.CreatedDate}</td>
                    <td></td>
                    <td></td>
                    <td>${row.PostName}</td>
                    <td>${row.PostDate}</td>
                </tr>
            `;
                        });

                    } catch (err) {
                        console.error("Fetch Error:", err);
                    }
                });
 