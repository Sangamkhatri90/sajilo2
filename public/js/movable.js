// Function to reset form fields to blank, excluding specific classes and IDs
function resetFormFields(movableDivId) {
    const id = `#${movableDivId}`;
    const form = document.querySelector(`${id} form`);
    if (form) {
        const excludedClasses = ['benchods', 'start-date-local', 'end-date-local'];
        const excludedIds = ['custom-english-date']; // your excluded IDs here

        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];

            const hasExcludedClass = excludedClasses.some(cls => el.classList.contains(cls));
            const hasExcludedId = excludedIds.includes(el.id);

            if (!hasExcludedClass && !hasExcludedId) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = false;
                } else if (el.tagName.toLowerCase() === 'select') {
                    el.selectedIndex = 0;
                } else {
                    el.value = '';
                }
            }
        }
    }
}



// Function to keep track of the highest z-index value
let highestZIndex = 1;

function makeMovable(movableDivId, closeButtonId, cancelButtonId, toggleButtonId, toggleKey) {
    const draggable = document.getElementById(movableDivId);
    const closeButton = document.getElementById(closeButtonId);
    const cancelButton = document.getElementById(cancelButtonId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !closeButton || !cancelButton || !toggleButton) {
        return;
    }

    let isDragging = false;

    // Function to bring the div to the front by updating the z-index
    function bringToFront(element) {
        highestZIndex++;
        element.style.zIndex = highestZIndex;
    }

    // Show/hide the div when clicking the toggle button
    toggleButton.addEventListener('click', function () {
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            bringToFront(draggable);
        }
    });

    // Close the div when clicking the close button
    closeButton.addEventListener('click', function () {
        draggable.style.display = 'none';
        resetFormFields(movableDivId); // Reset form fields when close button is clicked
    });

    // Close the div when clicking the cancel button
    cancelButton.addEventListener('click', function () {
        draggable.style.display = 'none';
        resetFormFields(movableDivId); // Reset form fields when cancel button is clicked
    });

    // Add a keyboard shortcut for toggling the div using Ctrl + alphabet
    document.addEventListener('keydown', function (e) {
        if (toggleKey && e.ctrlKey && e.key.toLowerCase() === toggleKey.toLowerCase()) {
            const currentDisplay = window.getComputedStyle(draggable).display;
            draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
            if (currentDisplay === 'none') {
                bringToFront(draggable);
            }
        }
    });

    // Dragging functionality
    draggable.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        e.preventDefault();
        bringToFront(draggable); // Bring the div to the front when clicked
        isDragging = true;

        let offsetX = e.clientX - draggable.getBoundingClientRect().left;
        let offsetY = e.clientY - draggable.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            draggable.style.left = pageX - offsetX + 'px';
            draggable.style.top = pageY - offsetY + 'px';
        }

        function onMouseMove(e) {
            e.preventDefault();
            if (isDragging) {
                moveAt(e.pageX, e.pageY);
            }
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function () {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        };
    });

    draggable.ondragstart = function () {
        return false;
    };
}

function bindAdditionalToggleButton(movableDivId, toggleButtonId) {
    const draggable = document.getElementById(movableDivId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !toggleButton) {
        return;
    }

    toggleButton.addEventListener('click', async function () {
        const EditCollChequemasAccIDforaccpostingVD = document.getElementById('Maintransaccountnumberofaccpostedit').value;
       
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

        
                        // Inside the fetch call for necessary data 
                        fetch('/fetchCollectionChequemasaccpostviewDetailsForEdit', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ EditCollChequemasAccIDforaccpostingVD })  // Send the EditAccTypePenaltySelectedName to the backend
                        })
                            .then(response => response.json())
                            .then(data => {

                                if (data.success) {
                                    document.getElementById('accpost-viewdetials-account-number').value = data.SLAlias || '';
                                    document.getElementById('accopendate-viewaccdeteditaccposting').value = data.AccountOpenDate || '';
                                    document.getElementById('acc-name-viewaccdeteditaccposting').value = data.SLName || '';
                                    document.getElementById('ccacceditvd-accountType').value = data.GLName || '';
                                    document.getElementById('acc-address-viewaccdeteditaccposting').value = data.Address1 || '';
                                    document.getElementById('acc-address2-viewaccdeteditaccposting').value = data.Address2 || '';
                                    document.getElementById('acc-phone-viewaccdeteditaccposting').value = data.Phone1 || '';
                                    document.getElementById('acc-email-viewaccdeteditaccposting').value = data.Email || '';
                                    document.getElementById('acc-mobile-viewaccdeteditaccposting').value = data.Mobile || '';
                                    document.getElementById('acc-DOB-viewaccdeteditaccposting').value = data.DateOfBirth || '';
                                    document.getElementById('NextofKinName-viewaccdeteditaccposting').value = data.NextofKinName || '';
                                    document.getElementById('NextofKinAddress-viewaccdeteditaccposting').value = data.NextofKinAddress || '';
                                    document.getElementById('NextofKinReln-viewaccdeteditaccposting').value = data.Relation || '';
                                    document.getElementById('NextofKinContactNumber-viewaccdeteditaccposting').value = data.NextofKinContactNumber || '';
                                    document.getElementById('acc-remarks-viewaccdeteditaccposting').value = data.Remarks || '';
                                    document.getElementById('acc-fax-viewaccdeteditaccposting').value = data.Fax || '';
                                    document.getElementById('acc-MemberId-viewaccdeteditaccposting').value = data.MemberAlias || '';
                                    document.getElementById('acc-MemberName-viewaccdeteditaccposting').value = data.MemberName || '';


                                    document.getElementById("accounteidtcolcheque-photo").src = data.Photo || "";
                                    document.getElementById("accounteidtcolcheque-sign1").src = data.Sign1 || "";
                                    document.getElementById("accounteidtcolcheque-sign2").src = data.Sign2 || "";
                                    document.getElementById("accounteidtcolcheque-sign3").src = data.Sign3 || "";
                                    document.getElementById("accounteidtcolcheque-sign4").src = data.Sign4 || "";

                                    const gendertype = data.Gender;
                                    // Select the appropriate option in the dropdown based on the TransactionType
                                    const genderTypeSelect = document.getElementById('EditGenderTrans-optionforaccpost');
                                    const options = genderTypeSelect.options;
                                    //Loop through the options to find the matching value and set it as selected
                                    for (let i = 0; i < options.length; i++) {
                                        if (options[i].value === gendertype) {
                                            options[i].selected = true;
                                            break; // Stop the loop once the correct option is selected
                                        }
                                    }


                                } else {
                                    showCustomAlert(data.message || 'Member not found');
                                }

                      
                            });
    const slAlias = document.getElementById("Maintransaccountnumberofaccpostedit")?.value?.trim();
                        console.log("value", slAlias)
                        if (!slAlias) {
                            alert("Missing End date, or SubLedger Alias.");
                            return;
                        }



                        try {
                            const res = await fetch("/api/getRecentTransactionsLP9", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ slAlias })
                            });

                            const data = await res.json();
                            const tbody = document.querySelector("#ccactranstablefd tbody");
                            tbody.innerHTML = ""; // clear old rows

                            if (data.success && data.transactions.length > 0) {
                                data.transactions.forEach((txn, index) => {
                                    const row = document.createElement("tr");
                                    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${txn.JV_Date || ''}</td>
            <td>${txn.VoucherNo || ''} </td>
            <td>${txn.MenuName || ''} </td>
            <td>${txn.DrAmount}</td>
            <td>${txn.CrAmount}</td>
            <td>${txn.Balance.toFixed(2)} ${txn.BalanceType}</td>
          `;
                                    tbody.appendChild(row);
                                });
                            } else {
                                tbody.innerHTML = `<tr><td colspan="3">No transactions found</td></tr>`;
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Error loading transactions");
                        }

    });
}

function bindAdditionalToggleButtonNrm(movableDivId, toggleButtonId) {
    const draggable = document.getElementById(movableDivId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (!draggable || !toggleButton) {
        return;
    }

    toggleButton.addEventListener('click', function () {
       
        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

    });
}

// Initialize movable divs (example initialization)
makeMovable('movableDiv1', 'closeButton1', 'cancelButton1', 'toggleButton1');
makeMovable('movableDiv2', 'closeButton2', 'cancelButton2', 'toggleButton2');
makeMovable('movableDiv3', 'closeButton3', 'cancelButton3', 'toggleButton3');
makeMovable('movableDiv4', 'closeButton4', 'cancelButton4', 'toggleButton4');
makeMovable('movableDiv5', 'closeButton5', 'cancelButton5', 'toggleButton5');
makeMovable('movableDiv6', 'closeButton6', 'cancelButton6', 'toggleButton6');
makeMovable('movableDiv7', 'closeButton7', 'cancelButton7', 'toggleButton7');
makeMovable('movableDiv8', 'closeButton8', 'cancelButton8', 'toggleButton8');
makeMovable('movableDiv9', 'closeButton9', 'cancelButton9', 'toggleButton9');
makeMovable('movableDiv10', 'closeButton10', 'cancelButton10', 'toggleButton10');
makeMovable('movableDiv11', 'closeButton11', 'cancelButton11', 'toggleButton11');
makeMovable('movableDiv12', 'closeButton12', 'cancelButton12', 'toggleButton12');
makeMovable('movableDiv13', 'closeButton13', 'cancelButton13', 'toggleButton13');
makeMovable('movableDiv14', 'closeButton14', 'cancelButton14', 'toggleButton14');
makeMovable('movableDiv15', 'closeButton15', 'cancelButton15', 'toggleButton15');
makeMovable('movableDiv16', 'closeButton16', 'cancelButton16', 'toggleButton16');
makeMovable('movableDiv19', 'closeButton19', 'cancelButton19', 'toggleButton19');
makeMovable('movableDiv20', 'closeButton20', 'cancelButton20', 'toggleButton20');
makeMovable('movableDiv21', 'closeButton21', 'cancelButton21', 'toggleButton21');
makeMovable('movableDiv22', 'closeButton22', 'cancelButton22', 'toggleButton22');
makeMovable('movableDiv23', 'closeButton23', 'cancelButton23', 'toggleButton23');
makeMovable('movableDiv24', 'closeButton24', 'cancelButton24', 'toggleButton24');
makeMovable('movableDiv25', 'closeButton25', 'cancelButton25', 'toggleButton25');
makeMovable('movableDiv26', 'closeButton26', 'cancelButton26', 'toggleButton26');
makeMovable('movableDiv27', 'closeButton27', 'cancelButton27', 'toggleButton27');
makeMovable('movableDiv28', 'closeButton28', 'cancelButton28', 'toggleButton28');
makeMovable('movableDiv29', 'closeButton29', 'cancelButton29', 'toggleButton29');
makeMovable('movableDiv30', 'closeButton30', 'cancelButton30', 'toggleButton30');

makeMovable('movableDiv32', 'closeButton32', 'cancelButton32', 'toggleButton32');
makeMovable('movableDiv33', 'closeButton33', 'cancelButton33', 'toggleButton33');
makeMovable('movableDiv34', 'closeButton34', 'cancelButton34', 'toggleButton34');
makeMovable('movableDiv35', 'closeButton35', 'cancelButton35', 'toggleButton35');
makeMovable('movableDiv36', 'closeButton36', 'cancelButton36', 'toggleButton36');
makeMovable('movableDiv37', 'closeButton37', 'cancelButton37', 'toggleButton37');
makeMovable('movableDiv38', 'closeButton38', 'cancelButton38', 'toggleButton38');
makeMovable('movableDiv39', 'closeButton39', 'cancelButton39', 'toggleButton39');
makeMovable('movableDiv40', 'closeButton40', 'cancelButton40', 'toggleButton40');
makeMovable('movableDiv41', 'closeButton41', 'cancelButton41', 'toggleButton41');
makeMovable('movableDiv42', 'closeButton42', 'cancelButton42', 'toggleButton42', 'F1');
makeMovable('movableDiv44', 'closeButton44', 'cancelButton44', 'toggleButton44');
makeMovable('movableDiv45', 'closeButton45', 'cancelButton45', 'toggleButton45');
makeMovable('movableDiv46', 'closeButton46', 'cancelButton46', 'toggleButton46');
makeMovable('movableDiv47', 'closeButton47', 'cancelButton47', 'toggleButton47');
makeMovable('movableDiv48', 'closeButton48', 'cancelButton48', 'toggleButton48');
makeMovable('movableDiv49', 'closeButton49', 'cancelButton49', 'toggleButton49');
makeMovable('movableDiv50', 'closeButton50', 'cancelButton50', 'toggleButton50');
makeMovable('movableDiv51', 'closeButton51', 'cancelButton51', 'toggleButton51');
makeMovable('movableDiv52', 'closeButton52', 'cancelButton52', 'toggleButton52');
makeMovable('movableDiv53', 'closeButton53', 'cancelButton53', 'toggleButton53');
makeMovable('movableDiv54', 'closeButton54', 'cancelButton54', 'toggleButton54');
makeMovable('movableDiv55', 'closeButton55', 'cancelButton55', 'toggleButton55');
makeMovable('movableDiv56', 'closeButton56', 'cancelButton56', 'toggleButton56');
makeMovable('movableDiv57', 'closeButton57', 'cancelButton57', 'toggleButton57');
makeMovable('movableDiv58', 'closeButton58', 'cancelButton58', 'toggleButton58');
makeMovable('movableDiv59', 'closeButton59', 'cancelButton59', 'toggleButton59');
makeMovable('movableDiv60', 'closeButton60', 'cancelButton60', 'toggleButton60');
makeMovable('movableDiv61', 'closeButton61', 'cancelButton61', 'toggleButton61');
makeMovable('movableDiv62', 'closeButton62', 'cancelButton62', 'toggleButton62');
makeMovable('movableDiv63', 'closeButton63', 'cancelButton63', 'toggleButton63');
makeMovable('movableDiv64', 'closeButton64', 'cancelButton64', 'toggleButton64');
makeMovable('movableDiv65', 'closeButton65', 'cancelButton65', 'toggleButton65');
makeMovable('movableDiv66', 'closeButton66', 'cancelButton66', 'toggleButton66');
makeMovable('movableDiv67', 'closeButton67', 'cancelButton67', 'toggleButton67');
makeMovable('movableDiv68', 'closeButton68', 'cancelButton68', 'toggleButton68');
makeMovable('movableDiv69', 'closeButton69', 'cancelButton69', 'toggleButton69');
makeMovable('movableDiv70', 'closeButton70', 'cancelButton70', 'toggleButton70');
makeMovable('movableDiv71', 'closeButton71', 'cancelButton71', 'toggleButton71');
makeMovable('movableDiv72', 'closeButton72', 'cancelButton72', 'toggleButton72');
makeMovable('movableDiv73', 'closeButton73', 'cancelButton73', 'toggleButton73');
makeMovable('movableDiv74', 'closeButton74', 'cancelButton74', 'toggleButton74');
makeMovable('movableDiv75', 'closeButton75', 'cancelButton75', 'toggleButton75');
makeMovable('movableDiv76', 'closeButton76', 'cancelButton76', 'toggleButton76');
makeMovable('movableDiv77', 'closeButton77', 'cancelButton77', 'toggleButton77');
makeMovable('movableDiv78', 'closeButton78', 'cancelButton78', 'toggleButton78');
makeMovable('movableDiv79', 'closeButton79', 'cancelButton79', 'toggleButton79');
makeMovable('movableDiv80', 'closeButton80', 'cancelButton80', 'toggleButton80');
makeMovable('movableDiv81', 'closeButton81', 'cancelButton81', 'toggleButton81');
makeMovable('movableDiv82', 'closeButton82', 'cancelButton82', 'toggleButton82');
makeMovable('movableDiv86', 'closeButton86', 'cancelButton86', 'toggleButton86');
makeMovable('movableDiv87', 'closeButton87', 'cancelButton87', 'toggleButton87');
makeMovable('movableDiv88', 'closeButton88', 'cancelButton88', 'toggleButton88');
makeMovable('movableDiv89', 'closeButton89', 'cancelButton89', 'toggleButton89');
makeMovable('movableDiv90', 'closeButton90', 'cancelButton90', 'toggleButton90');
makeMovable('movableDiv91', 'closeButton91', 'cancelButton91', 'toggleButton91');
makeMovable('movableDiv92', 'closeButton92', 'cancelButton92', 'toggleButton92');
makeMovable('movableDiv93', 'closeButton93', 'cancelButton93', 'toggleButton93');
makeMovable('movableDiv94', 'closeButton94', 'cancelButton94', 'toggleButton94');
makeMovable('movableDiv95', 'closeButton95', 'cancelButton95', 'toggleButton95');
makeMovable('movableDiv96', 'closeButton96', 'cancelButton96', 'toggleButton96');
makeMovable('movableDiv97', 'closeButton97', 'cancelButton97', 'toggleButton97');
makeMovable('movableDiv98', 'closeButton98', 'cancelButton98', 'toggleButton98');
makeMovable('movableDiv99', 'closeButton99', 'cancelButton99', 'toggleButton99');
makeMovable('movableDiv100', 'closeButton100', 'cancelButton100', 'toggleButton100');
makeMovable('movableDiv101', 'closeButton101', 'cancelButton101', 'toggleButton101');
makeMovable('movableDiv102', 'closeButton102', 'cancelButton102', 'toggleButton102');
makeMovable('movableDiv103', 'closeButton103', 'cancelButton103', 'toggleButton103');
makeMovable('movableDiv104', 'closeButton104', 'cancelButton104', 'toggleButton104');
makeMovable('movableDiv105', 'closeButton105', 'cancelButton105', 'toggleButton105');
makeMovable('movableDiv106', 'closeButton106', 'cancelButton106', 'toggleButton106');
makeMovable('movableDiv107', 'closeButton107', 'cancelButton107', 'toggleButton107');
makeMovable('movableDiv108', 'closeButton108', 'cancelButton108', 'toggleButton108');
makeMovable('movableDiv109', 'closeButton109', 'cancelButton109', 'toggleButton109');
makeMovable('movableDiv110', 'closeButton110', 'cancelButton110', 'toggleButton110');
makeMovable('movableDiv111', 'closeButton111', 'cancelButton111', 'toggleButton111');
makeMovable('movableDiv112', 'closeButton112', 'cancelButton112', 'toggleButton112');
makeMovable('movableDiv113', 'closeButton113', 'cancelButton113', 'toggleButton113');
makeMovable('movableDiv114', 'closeButton114', 'cancelButton114', 'toggleButton114');
makeMovable('movableDiv115', 'closeButton115', 'cancelButton115', 'toggleButton115');
makeMovable('movableDiv116', 'closeButton116', 'cancelButton116', 'toggleButton116');
makeMovable('movableDiv117', 'closeButton117', 'cancelButton117', 'toggleButton117');
makeMovable('movableDiv118', 'closeButton118', 'cancelButton118', 'toggleButton118');
makeMovable('movableDiv119', 'closeButton119', 'cancelButton119', 'toggleButton119');
makeMovable('movableDiv120', 'closeButton120', 'cancelButton120', 'toggleButton120');
makeMovable('movableDiv121', 'closeButton121', 'cancelButton121', 'toggleButton121');
makeMovable('movableDiv122', 'closeButton122', 'cancelButton122', 'toggleButton122');
makeMovable('movableDiv123', 'closeButton123', 'cancelButton123', 'toggleButton123');
makeMovable('movableDiv124', 'closeButton124', 'cancelButton124', 'toggleButton124');
makeMovable('movableDiv125', 'closeButton125', 'cancelButton125', 'toggleButton125');
makeMovable('movableDiv126', 'closeButton126', 'cancelButton126', 'toggleButton126');
makeMovable('movableDiv127', 'closeButton127', 'cancelButton127', 'toggleButton127');
makeMovable('movableDiv128', 'closeButton128', 'cancelButton128', 'toggleButton128');
makeMovable('movableDiv129', 'closeButton129', 'cancelButton129', 'toggleButton129');
makeMovable('movableDiv130', 'closeButton130', 'cancelButton130', 'toggleButton130');
makeMovable('movableDiv131', 'closeButton131', 'cancelButton131', 'toggleButton131');
makeMovable('movableDiv132', 'closeButton132', 'cancelButton132', 'toggleButton132');
makeMovable('movableDiv133', 'closeButton133', 'cancelButton133', 'toggleButton133');
makeMovable('movableDiv134', 'closeButton134', 'cancelButton134', 'toggleButton134');
makeMovable('movableDiv135', 'closeButton135', 'cancelButton135', 'toggleButton135');
makeMovable('movableDiv136', 'closeButton136', 'cancelButton136', 'toggleButton136');
makeMovable('movableDiv137', 'closeButton137', 'cancelButton137', 'toggleButton137');
makeMovable('movableDiv138', 'closeButton138', 'cancelButton138', 'toggleButton138');

makeMovable('movableDiv147', 'closeButton147', 'cancelButton147', 'toggleButton147');
makeMovable('movableDiv148', 'closeButton148', 'cancelButton148', 'toggleButton148');
makeMovable('movableDiv149', 'closeButton149', 'cancelButton149', 'toggleButton149');
makeMovable('movableDiv150', 'closeButton150', 'cancelButton150', 'toggleButton150');
makeMovable('movableDiv151', 'closeButton151', 'cancelButton151', 'toggleButton151');
makeMovable('movableDiv152', 'closeButton152', 'cancelButton152', 'toggleButton152');
makeMovable('movableDiv153', 'closeButton153', 'cancelButton153', 'toggleButton153');
makeMovable('movableDiv154', 'closeButton154', 'cancelButton154', 'toggleButton154');
makeMovable('movableDiv155', 'closeButton155', 'cancelButton155', 'toggleButton155');
makeMovable('movableDiv156', 'closeButton156', 'cancelButton156', 'toggleButton156');
makeMovable('movableDiv157', 'closeButton157', 'cancelButton157', 'toggleButton157');
makeMovable('movableDiv158', 'closeButton158', 'cancelButton158', 'toggleButton158');
makeMovable('movableDiv159', 'closeButton159', 'cancelButton159', 'toggleButton159');
makeMovable('movableDiv160', 'closeButton160', 'cancelButton160', 'toggleButton160');
makeMovable('movableDiv161', 'closeButton161', 'cancelButton161', 'toggleButton161');
makeMovable('movableDiv162', 'closeButton162', 'cancelButton162', 'toggleButton162');
makeMovable('movableDiv163', 'closeButton163', 'cancelButton163', 'toggleButton163');
makeMovable('movableDiv164', 'closeButton164', 'cancelButton164', 'toggleButton164');
makeMovable('movableDiv165', 'closeButton165', 'cancelButton165', 'toggleButton165');
makeMovable('movableDiv166', 'closeButton166', 'cancelButton166', 'toggleButton166');
makeMovable('movableDiv167', 'closeButton167', 'cancelButton167', 'toggleButton167');
makeMovable('movableDiv168', 'closeButton168', 'cancelButton168', 'toggleButton168');
makeMovable('movableDiv169', 'closeButton169', 'cancelButton169', 'toggleButton169');
makeMovable('movableDiv170', 'closeButton170', 'cancelButton170', 'toggleButton170');
makeMovable('movableDiv171', 'closeButton171', 'cancelButton171', 'toggleButton171');
makeMovable('movableDiv172', 'closeButton172', 'cancelButton172', 'toggleButton172');
makeMovable('movableDiv173', 'closeButton173', 'cancelButton173', 'toggleButton173');
makeMovable('movableDiv174', 'closeButton174', 'cancelButton174', 'toggleButton174');
makeMovable('movableDiv175', 'closeButton175', 'cancelButton175', 'toggleButton175');
makeMovable('movableDiv176', 'closeButton176', 'cancelButton176', 'toggleButton176');
makeMovable('movableDiv177', 'closeButton177', 'cancelButton177', 'toggleButton177');
makeMovable('movableDiv178', 'closeButton178', 'cancelButton178', 'toggleButton178');
makeMovable('movableDiv179', 'closeButton179', 'cancelButton179', 'toggleButton179');
makeMovable('movableDiv180', 'closeButton180', 'cancelButton180', 'toggleButton180');
makeMovable('movableDiv181', 'closeButton181', 'cancelButton181', 'toggleButton181');
makeMovable('movableDiv182', 'closeButton182', 'cancelButton182', 'toggleButton182');
makeMovable('movableDiv183', 'closeButton183', 'cancelButton183', 'toggleButton183');
makeMovable('movableDiv184', 'closeButton184', 'cancelButton184', 'toggleButton184');
bindAdditionalToggleButton('movableDiv184', 'MaintranstoggleButton184');
makeMovable('movableDiv185', 'closeButton185', 'cancelButton185', 'toggleButton185');
makeMovable('movableDiv186', 'closeButton186', 'cancelButton186', 'toggleButton186');
makeMovable('movableDiv187', 'closeButton187', 'cancelButton187', 'toggleButton187');
bindAdditionalToggleButtonNrm('movableDiv187', 'MaintranstoggleButton187');
makeMovable('movableDiv188', 'closeButton188', 'cancelButton188', 'toggleButton188');
bindAdditionalToggleButtonNrm('movableDiv188', 'MaintranstoggleButton188');
makeMovable('movableDiv189', 'closeButton189', 'cancelButton189', 'toggleButton189');
makeMovable('movableDiv190', 'closeButton190', 'cancelButton190', 'toggleButton190');

      
