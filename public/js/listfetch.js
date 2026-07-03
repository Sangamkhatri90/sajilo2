
document.addEventListener("DOMContentLoaded", function () {
    fetch("/menu")
        .then(response => response.json())
        .then(data => {
            const menuList = document.getElementById("menu-list");
            const detailDiv = document.getElementById("detail-div");
            const detailLegend = document.getElementById("detail-legend");
            const detailContent = document.getElementById("detail-content");
            let selectedMenu = null;

            if (data.length > 0) {
                data.forEach(menu => {
                    const listItem = document.createElement("li");
                    listItem.textContent = menu.CodeMenuName;
                    listItem.classList.add("menu-list");

                    listItem.addEventListener("click", () => {
                        selectedMenu = menu.CodeMenuName;
                        detailDiv.style.display = "block";
                        detailLegend.textContent = `${menu.CodeMenuName}`;
                        detailContent.innerHTML = `${menu.CodeMenuName}`;
                    });

                    menuList.appendChild(listItem);
                });
            } else {
                menuList.innerHTML = "<li>No menu items found</li>";
            }

            // Handle form submission
            const form = document.getElementById("menu-form");
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                if (!selectedMenu) {
                    showCustomAlert("Please select a menu item first.");
                    return;
                }

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                data.CodeMenuName = selectedMenu;

                fetch("/submit-menu", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            showCustomAlert("Menu item submitted successfully!");
                        } else {
                            showCustomAlert(`Error: ${result.error}`);
                        }
                        form.reset();
                        detailDiv.style.display = "none";
                    })
                    .catch(error => {
                        console.error("Error submitting menu:", error);
                    });
            });
        })
        .catch(error => {
            console.error("Error fetching menu data:", error);
        });

    const detailDiv = document.getElementById("detail-div");
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    detailDiv.addEventListener("mousedown", function (e) {
        isDragging = true;
        offsetX = e.clientX - detailDiv.offsetLeft;
        offsetY = e.clientY - detailDiv.offsetTop;
        detailDiv.style.cursor = "pointer";
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging) {
            detailDiv.style.left = `${e.clientX - offsetX}px`;
            detailDiv.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        detailDiv.style.cursor = "default";
    });

    document.getElementById("cancelButton").addEventListener("click", function () {
        detailDiv.style.display = "none";
    });
});

// document.addEventListener("DOMContentLoaded", function () {
//     const menuList = document.getElementById('menu-names');
    
//     // Display loading state
//     menuList.innerHTML = '<li>Loading...</li>';

//     // Fetch the menu names from the server
//     fetch('/get-menu-names')
//       .then(response => response.json())
//       .then(data => {
//         menuList.innerHTML = ''; // Clear loading state

//         if (data.length === 0) {
//           menuList.innerHTML = '<li>No menu items available</li>';
//           return;
//         }

//         data.forEach(menu => {
//           const listItem = document.createElement('li');
//           listItem.textContent = menu.MenuName;
//           menuList.appendChild(listItem);
//         });
//       })
//       .catch(error => {
//         console.error('Error fetching menu names:', error);
//         menuList.innerHTML = '<li>Error loading menu items</li>';
//       });
//   });

  document.addEventListener("DOMContentLoaded", function () {
    const menuList = document.getElementById('menu-names-1');
    
    // Display loading state
    menuList.innerHTML = '<li>Loading...</li>';

    // Fetch the menu names from the server
    fetch('/get-menu-names-1')
      .then(response => response.json())
      .then(data => {
        menuList.innerHTML = ''; // Clear loading state

        if (data.length === 0) {
          menuList.innerHTML = '<li>No menu items available</li>';
          return;
        }

        data.forEach(menu => {
          const listItem = document.createElement('li');
          listItem.textContent = menu.MenuName;
          menuList.appendChild(listItem);
        });
      })
      .catch(error => {
        console.error('Error fetching menu names:', error);
        menuList.innerHTML = '<li>Error loading menu items</li>';
      });
  });