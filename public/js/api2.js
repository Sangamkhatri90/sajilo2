document.addEventListener("DOMContentLoaded", () => {
    // Elements for the first form
    const dropdown1 = document.getElementById("copymaster-source");
    const fyStartInput1 = document.getElementById("fy-start");
    const fyEndInput1 = document.getElementById("fy-end");

    // Elements for the second form
    const dropdown2 = document.getElementById("datamaster-source1");
    const fyStartInput2 = document.getElementById("fy-start1");
    const fyEndInput2 = document.getElementById("fy-end1");

    // Function to populate dropdowns with options
 const populateDropdown = (dropdown) => {
    fetch('/api/org-names')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                data.forEach((org, index) => {
                    const option = document.createElement("option");
                    option.value = `${org.OrgName}|${org.OrgAlias}`;
                    option.textContent = `${org.OrgName} (${org.OrgAlias})`;
                    dropdown.appendChild(option);
                });

                // 🔥 Manually trigger change for the first item
                dropdown.selectedIndex = 0;
                dropdown.dispatchEvent(new Event("change"));
            }
        })
        .catch(error => {
            console.error('Error fetching OrgNames:', error);
        });
};


    // Populate dropdowns for both forms
    populateDropdown(dropdown1);
    populateDropdown(dropdown2);

    // Function to handle dropdown change and update fiscal year inputs
    const handleDropdownChange = (dropdown, fyStartInput, fyEndInput) => {
        dropdown.addEventListener("change", (event) => {
            const selectedOption = event.target.selectedOptions[0];
            if (selectedOption) {
                const [orgName, orgAlias] = selectedOption.value.split('|');
              fetch(`/api/fiscal-year?orgName=${orgName}&orgAlias=${orgAlias}`)
  .then(response => response.json())
  .then(data => {
    if (data.StartMiti && data.EndMiti) {
      fyStartInput.value = data.StartMiti;
      fyEndInput.value = data.EndMiti;
    } else {
      fyStartInput.value = data.StartDate;
      fyEndInput.value = data.EndDate;
    }
  })
  .catch(error => {
    console.error('Error fetching fiscal year data:', error);
  });

            }
        });
    };

    // Add event listeners for both dropdowns
    handleDropdownChange(dropdown1, fyStartInput1, fyEndInput1);
    handleDropdownChange(dropdown2, fyStartInput2, fyEndInput2);
});


        document.addEventListener("DOMContentLoaded", function () {
            fetch("/getOrganizations")
                .then(response => response.json())
                .then(data => {
                    const dropdown = document.getElementById("orgDropdown");
                    const tableBody = document.querySelector("#userVoucherRightsTable tbody");
                    if (!dropdown || !tableBody) return;

                    const loadVoucherMenus = async () => {
                        tableBody.replaceChildren();
                        if (!dropdown.value) return;

                        try {
                            const response = await fetch("/api/user-master/voucher-menus", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ dbName: dropdown.value })
                            });
                            const result = await response.json();
                            if (!response.ok || !result.success) throw new Error(result.message || "Unable to load voucher menus.");

                            result.menus.forEach((menu, index) => {
                                const menuName = menu.MenuName || "";
                                const row = tableBody.insertRow();
                                row.dataset.voucherId = menu.UDVNo;
                                const numberCell = row.insertCell();
                                numberCell.textContent = String(index + 1);
                                const nameCell = row.insertCell();
                                nameCell.textContent = menuName || "";

                                ["Access", "New", "Edit", "Delete"].forEach((permission) => {
                                    const cell = row.insertCell();
                                    const checkbox = document.createElement("input");
                                    checkbox.type = "checkbox";
                                    checkbox.className = "user-voucher-right-checkbox";
                                    checkbox.dataset.menuName = menuName || "";
                                    checkbox.dataset.permission = permission.toLowerCase();
                                    checkbox.setAttribute("aria-label", `${menuName} ${permission}`);
                                    cell.appendChild(checkbox);
                                });
                            });
                        } catch (error) {
                            const row = tableBody.insertRow();
                            const cell = row.insertCell();
                            cell.colSpan = 6;
                            cell.textContent = "Unable to load voucher menus.";
                            console.error("Error loading User Master voucher menus:", error);
                        }
                    };

                    data.organizations.forEach(org => {
                        const option = document.createElement("option");
                        option.value = org.DBName;
                        option.textContent = `${org.OrgName} (${org.DBName})`;
                        dropdown.appendChild(option);
                    });

                    if (data.organizations.some(org => org.DBName === data.selectedDbName)) {
                        dropdown.value = data.selectedDbName;
                    } else if (data.organizations.length) {
                        dropdown.selectedIndex = 0;
                    }
                    dropdown.addEventListener("change", loadVoucherMenus);
                    loadVoucherMenus();
                })
                .catch(error => console.error("Error fetching organizations:", error));
        });
                   // Function to fetch data from the server and populate the dropdown
        function loadMenuNames() {
            // Fetch the menu names from the backend
            fetch('/voucher-approved-option')
                .then(response => response.json())  // Parse the response as JSON
                .then(data => {
                    // Get the dropdown element
                    const menuSelect = document.getElementById('VAmenuSelect');
                    
                    // Clear any existing options
                    menuSelect.innerHTML = '';
                    
                    // Add a default option
                    const defaultOption = document.createElement('option');
                    defaultOption.text = 'All';
                    defaultOption.value = 'All';
                    menuSelect.appendChild(defaultOption);

                    // Populate the dropdown with the fetched MenuNames
                    data.forEach(menu => {
                        const option = document.createElement('option');
                        option.text = menu.MenuName;
                        option.value = menu.MenuName;
                        menuSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error loading menu names:', error);
                });
        }

        // Add an event listener for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            loadMenuNames();
        });

                    // Function to fetch data from the server and populate the dropdown
                    function loadCNVMenuNames() {
                        // Fetch the menu names from the backend
                        fetch('/voucher-CheckedNVerified-option')
                            .then(response => response.json())  // Parse the response as JSON
                            .then(data => {
                                // Get the dropdown element
                                const menuSelect = document.getElementById('VCNVmenuSelect');
                                
                                // Clear any existing options
                                menuSelect.innerHTML = '';
                                
                                // Add a default option
                                const defaultOption = document.createElement('option');
                                defaultOption.text = 'All';
                                defaultOption.value = 'All';
                                menuSelect.appendChild(defaultOption);
            
                                // Populate the dropdown with the fetched MenuNames
                                data.forEach(menu => {
                                    const option = document.createElement('option');
                                    option.text = menu.MenuName;
                                    option.value = menu.MenuName;
                                    menuSelect.appendChild(option);
                                });
                            })
                            .catch(error => {
                                console.error('Error loading menu names:', error);
                            });
                    }
            
                    // Add an event listener for DOMContentLoaded
                    document.addEventListener('DOMContentLoaded', function() {
                        loadCNVMenuNames();
                    });

                    
                    // Function to fetch data from the server and populate the dropdown
                    function loadPNUPMenuNames() {
                        // Fetch the menu names from the backend
                        fetch('/voucher-PostedNUnposted-option')
                            .then(response => response.json())  // Parse the response as JSON
                            .then(data => {
                                // Get the dropdown element
                                const menuSelect = document.getElementById('VPUNPmenuSelect');
                                
                                // Clear any existing options
                                menuSelect.innerHTML = '';
                                
                                // Add a default option
                                const defaultOption = document.createElement('option');
                                defaultOption.text = 'All';
                                defaultOption.value = 'All';
                                menuSelect.appendChild(defaultOption);
            
                                // Populate the dropdown with the fetched MenuNames
                                data.forEach(menu => {
                                    const option = document.createElement('option');
                                    option.text = menu.MenuName;
                                    option.value = menu.MenuName;
                                    menuSelect.appendChild(option);
                                });
                            })
                            .catch(error => {
                                console.error('Error loading menu names:', error);
                            });
                    }
            
                    // Add an event listener for DOMContentLoaded
                    document.addEventListener('DOMContentLoaded', function() {
                        loadPNUPMenuNames();
                    });