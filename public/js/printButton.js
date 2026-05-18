document.querySelectorAll('.global-print-btn').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-print-target');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) return showCustomAlert("Print target not found!");

        const printContainer = document.getElementById('print-container');
        const printHeader = document.getElementById('print-header');
        printContainer.innerHTML = ''; // Clear old content

        // 🔹 Restore and populate header
        const orgName = localStorage.getItem('selectedOrgName') || '';
        const address1 = localStorage.getItem('selectedAddress1') || '';
        printHeader.querySelector('#print-org-name').textContent = orgName;
        printHeader.querySelector('#print-org-address').textContent = address1;

        // 🔹 Append header and cloned table
        printContainer.appendChild(printHeader.cloneNode(true)); // Safe clone
        printContainer.appendChild(targetElement.cloneNode(true));
        printContainer.style.display = 'block';

        // 🔹 Print
        window.print();
        printContainer.style.display = 'none';
    });
});
