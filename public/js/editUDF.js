let modeUDF = null; // new | edit
let selectedUDFForEdit = null;

// FORM
const myFormUDF = document.getElementById('myForm186');

// Prevent default submission
myFormUDF.addEventListener('submit', function (event) {
    event.preventDefault();
    saveUDF();
});

// NEW button
document.getElementById('UDFNewbtn').addEventListener('click', function () {
    setModeUDF('new');
});

// EDIT button
document.getElementById('UDFEditBtn').addEventListener('click', function () {
    setModeUDF('edit');
    showUDFListForEdit();
});

// SAVE button
document.getElementById('UDFsavebtn').addEventListener('click', function () {
    saveUDF();
});

// ===============================
// SAVE FUNCTION (ADD or EDIT)
// ===============================
function saveUDF() {

    // Collect form data
    const data = {
        UDFID: selectedUDFForEdit?.UDFID || null,
        Name: document.getElementById('UDFField').value.trim(),
        Module: document.getElementById('UDFModule').value,
        Type: document.getElementById('UDFType').value,
        Length: document.getElementById('UDFLength').value.trim(),
        SortOrder: document.getElementById('UDForder').value.trim(),
        AllowDecimal: document.getElementById('UDFDecimalCB').checked ? 1 : 0,
        ItemWise: document.getElementById('UDFItemwiseCB').checked ? 1 : 0,
        ShowTotal: document.getElementById('UDFShowTotalCB').checked ? 1 : 0,
        Mandatory: document.getElementById('UDFMandatoryCB').checked ? 1 : 0,
        Status: document.getElementById('UDFActiveCB').checked ? 1 : 0,
        Remarks: document.getElementById('UDFremark').value.trim()
    };

    let url = modeUDF === "edit" ? "/udf-update?id=" + selectedUDFForEdit.UDFID : "/udf-create";

    fetch(url, {
        method: modeUDF === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(msg => {
            showCustomAlert(msg);
            resetUDFMode();
        })
        .catch(err => {
            console.error(err);
            showCustomAlert("Error saving UDF");
        });
}

//
// MODE SETTER
//
function setModeUDF(mode) {
    modeUDF = mode;

    if (mode === "new") setUDFNewMode();
    if (mode === "edit") setUFDEditMode();
}

//
// NEW MODE
//
function setUDFNewMode() {
    enableUDFFields(true);

    // Clear fields
    document.getElementById('UDFField').value = "";
    document.getElementById('UDFLength').value = "";
    document.getElementById('UDForder').value = "";
    document.getElementById('UDFremark').value = "";
    document.getElementById('UDFDecimalCB').checked = false;
    document.getElementById('UDFItemwiseCB').checked = false;
    document.getElementById('UDFShowTotalCB').checked = false;
    document.getElementById('UDFMandatoryCB').checked = false;
    document.getElementById('UDFActiveCB').checked = true;

    selectedUDFForEdit = null;
}

//
// EDIT MODE
//
function setUFDEditMode() {
    enableUDFFields(true);
}

//
// Enable / disable fields
//
function enableUDFFields(status) {
    document.getElementById('UDFField').disabled = !status;
    document.getElementById('UDFModule').disabled = !status;
    document.getElementById('UDFType').disabled = !status;
    document.getElementById('UDFLength').disabled = !status;
    document.getElementById('UDForder').disabled = !status;
    document.getElementById('UDFDecimalCB').disabled = !status;
    document.getElementById('UDFItemwiseCB').disabled = !status;
    document.getElementById('UDFShowTotalCB').disabled = !status;
    document.getElementById('UDFMandatoryCB').disabled = !status;
    document.getElementById('UDFActiveCB').disabled = !status;
    document.getElementById('UDFremark').disabled = !status;
    document.getElementById('UDFsavebtn').disabled = !status;
    document.getElementById('UDFcancelBtn').disabled = !status;
}

//
// RESET MODE
//
function resetUDFMode() {
    modeUDF = null;
    enableUDFFields(false);

    document.getElementById('UDFField').value = "";
    document.getElementById('UDFLength').value = "";
    document.getElementById('UDForder').value = "";
    document.getElementById('UDFremark').value = "";

    selectedUDFForEdit = null;
}

//
// FETCH AND SHOW LIST FOR EDIT
//
function showUDFListForEdit() {
    fetch("/udf-get-all")
        .then(res => res.json())
        .then(data => {
            displayUDFList(data);
        })
        .catch(err => {
            console.error(err);
            showCustomAlert("Error loading UDF list");
        });
}

//
// SHOW UDF LIST
//
function displayUDFList(list) {
    const div = document.createElement("div");
    div.className = "udf-edit-list";
    div.style = `
        position:absolute;
        background:white;
        border:1px solid grey;
        z-index:9999;
        padding:10px;
        max-height:300px;
        overflow-y:auto;
    `;

    // close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.style = "float:right; margin-bottom:5px;";
    closeBtn.onclick = () => div.remove();
    div.appendChild(closeBtn);

    list.forEach(udf => {
        const row = document.createElement("div");
        row.className = "suggestion-item";
        row.textContent = `${udf.Name} (${udf.Module})`;

        row.onclick = function () {
            selectedUDFForEdit = udf;

            document.getElementById('UDFField').value = udf.Name;
            document.getElementById('UDFModule').value = udf.Module;
            document.getElementById('UDFType').value = udf.Type;
            document.getElementById('UDFLength').value = udf.Length;
            document.getElementById('UDForder').value = udf.SortOrder;
            document.getElementById('UDFremark').value = udf.Remarks;

            document.getElementById('UDFDecimalCB').checked = udf.AllowDecimal == 1;
            document.getElementById('UDFItemwiseCB').checked = udf.ItemWise == 1;
            document.getElementById('UDFShowTotalCB').checked = udf.ShowTotal == 1;
            document.getElementById('UDFMandatoryCB').checked = udf.Mandatory == 1;
            document.getElementById('UDFActiveCB').checked = udf.Status == 1;

            div.remove();
        };

        div.appendChild(row);
    });

    document.body.appendChild(div);
}
