document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".toggle-link");
    const contents = document.querySelectorAll(".content > div");

    function deactivateAll() {
        tabs.forEach(tab => tab.classList.remove("active"));
        contents.forEach(content => content.style.display = "none");
    }

    function activateDefaultTab() {
        if (tabs.length > 0 && contents.length > 0) {
            tabs[0].classList.add("active");
            contents[0].style.display = "block";
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", function (event) {
            event.preventDefault();
            const target = tab.getAttribute("data-target");
            const contentToShow = document.querySelector(`.${target}`);

            if (contentToShow) {
                deactivateAll();
                tab.classList.add("active");
                contentToShow.style.display = "block";
            } else {
                console.error(`No content found for ${target}`);
            }
        });
    });
    deactivateAll();
    activateDefaultTab();
});
