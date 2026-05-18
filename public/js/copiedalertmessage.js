document.addEventListener('DOMContentLoaded', () => {
    // Loop through each form with the class "ajax-form"
    document.querySelectorAll('.ajax-form').forEach(form => {
        if (form.classList.contains('district-save-form')) return;
        if (form.classList.contains('qualification-save-form')) return;
        if (form.classList.contains('profession-save-form')) return;
        if (form.classList.contains('routemaster-save-form')) return;
        if (form.classList.contains('vdc-save-form')) return;
        if (form.classList.contains('denomination-save-form')) return;
        if (form.classList.contains('narration-save-form')) return;
        if (form.classList.contains('add-ledger-group')) return;
        if (form.classList.contains('add-ledger-Subgroup')) return;
        if (form.classList.contains('editdoc-ajax-form')) return;
        if (form.classList.contains('docclass-copyajax-form')) return;
        if (form.classList.contains('ledgermas-copyajax-form')) return;
        if (form.classList.contains('ledgermaster-newajax-form')) return;
        if (form.classList.contains('CollmasEdit-ajax-form')) return;
        if (form.classList.contains('CollmasCopy-ajax-form')) return;
        if (form.classList.contains('AccTypeIntset-Edit-ajax-form')) return;
        if (form.classList.contains('Editpanalty-ajax-form')) return;
        if (form.classList.contains('CopyRebate-ajax-form')) return;
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            try {
                const response = await fetch(this.action, {
                    method: this.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formObject),
                });
            
                const result = await response.json();
            
                if (result.success) {
                    showCustomAlert(result.message);
                    showCustomAlertfordb(result.message); // Custom success alert
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    }
                } else {
                    showCustomAlert(`Error: ${result.message}`);
                    showCustomAlertfordb(`Error: ${result.message}`); // Custom error alert
                }
            } catch (error) {
                console.error('Error during fetch:', error);
                showCustomAlert('An unexpected error occurred. Try Again!');
                showCustomAlertfordb('An unexpected error occurred. Try Again!');
            }
        });
    });
function showCustomAlert(message){
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("alertMessage");
    const closeAlert = document.getElementById("closeAlert");
    const alertOkButton = document.getElementById("alertOkButton");
    const fiscalyeardiv = document.getElementById('movableDivfiscalyear');
    
    alertBox.style.display = 'block';
    alertMessage.textContent = message;
    
    // close the alert when the ok or close button is clicked
    closeAlert.onclick = () => (alertBox.style.display = 'none');
      alertOkButton.onclick = () => {
            alertBox.style.display = 'none';
            fiscalyeardiv.style.display = 'block';
            
      };
       makeMovable(alertBox); // Make the alert box draggable
}





    // Show custom alert function
    function showCustomAlertfordb(message) {
        const alertBox = document.getElementById('customAlertfordb');
        const databasetablediv = document.getElementById('movableDiv81');
        const alertMessage = document.getElementById('alertMessagefordb');
        const closeAlert = document.getElementById('closeAlertfordb');
        const alertOkButton = document.getElementById('alertOkButtonfordb');
        alertBox.style.display = 'block';
        alertMessage.textContent = message;
       
        databasetablediv.style.display = 'none';
        
        // Close the alert when clicking the close button or OK button
        closeAlert.onclick = () => (alertBox.style.display = 'none');
        alertOkButton.onclick = () => {
            alertBox.style.display = 'none';
            databasetablediv.style.display = 'block';
            
      };

        makeMovable(alertBox); // Make the alert box draggable
    }

    // Make the alert modal movable
    function makeMovable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        const header = element.querySelector('.modal-content'); // Use modal-content as the draggable area

        header.style.cursor = 'default'; // Indicate draggable area

        header.addEventListener('mousedown', (event) => {
            isDragging = true;
            offsetX = event.clientX - element.offsetLeft;
            offsetY = event.clientY - element.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(event) {
            if (!isDragging) return;
            element.style.left = `${event.clientX - offsetX}px`;
            element.style.top = `${event.clientY - offsetY}px`;
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
});
