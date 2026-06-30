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

        function moveAt(clientX, clientY) {
            draggable.style.left = clientX - offsetX + 'px';
            draggable.style.top = clientY - offsetY + 'px';
        }

        function onMouseMove(e) {
            e.preventDefault();
            if (isDragging) {
                moveAt(e.clientX, e.clientY);
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

function bindAdditionalToggleButton({ buttonId, popupId, getAccountNumber, getSlAlias }) {
    const draggable = document.getElementById(popupId);      
    const toggleButton = document.getElementById(buttonId);  

    if (!draggable || !toggleButton) return;

    toggleButton.addEventListener('click', async function () {

        const accountNumber = getAccountNumber();  // ← use the passed function
        const slAlias = getSlAlias();              // ← use the passed function

        const currentDisplay = window.getComputedStyle(draggable).display;
        draggable.style.display = (currentDisplay === 'none') ? 'block' : 'none';
        if (currentDisplay === 'none') {
            highestZIndex++;
            draggable.style.zIndex = highestZIndex;
        }

        // ── Fetch view details ──────────────────────────────────────────
        fetch('/fetchCollectionChequemasaccpostviewDetailsForEdit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ EditCollChequemasAccIDforaccpostingVD: accountNumber })
        })
        .then(r => r.json())
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

                const genderTypeSelect = document.getElementById('EditGenderTrans-optionforaccpost');
                for (let opt of genderTypeSelect.options) {
                    if (opt.value === data.Gender) { opt.selected = true; break; }
                }
            } else {
                showCustomAlert(data.message || 'Member not found');
            }
        });

        // ── Fetch recent transactions ───────────────────────────────────
        if (!slAlias) {
            alert("Missing SubLedger Alias.");
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
            tbody.innerHTML = "";

            if (data.success && data.transactions.length > 0) {
                data.transactions.forEach((txn, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${txn.JV_Date || ''}</td>
                        <td>${txn.VoucherNo || ''}</td>
                        <td>${txn.MenuName || ''}</td>
                        <td>${txn.DrAmount}</td>
                        <td>${txn.CrAmount}</td>
                        <td>${txn.Balance.toFixed(2)} ${txn.BalanceType}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="7">No transactions found</td></tr>`;
            }
        } catch (err) {
            console.error(err);
            alert("Error loading transactions");
        }

        // ── Fetch share transactions ────────────────────────────────────
        const table = document.getElementById("EditMainSharemastable");
        const tbody = table.querySelector('tbody');

        if (!accountNumber) {
            tbody.innerHTML = "";
            window.__lastShareCertificateData = { accountNumber: "", rows: [] };
            _appendEmptyShareRows(tbody, 5);
            return;
        }

        fetch('/fetchShareTransDetailsForMainAccedit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ EditShareTransACCNumber: accountNumber })
        })
        .then(r => r.json())
        .then(data => {
            tbody.innerHTML = "";
            const rows = Array.isArray(data.ShareTransDetails) ? data.ShareTransDetails : [];
            window.__lastShareCertificateData = { accountNumber, rows };

            if (rows.length > 0) {
                rows.forEach((row, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td contenteditable="true" class="editable-cell" data-field="Transactiono">${row.TransactionNo ?? ''}</td>
                        <td contenteditable="true" class="editable-cell" data-field="From">${row.ShareIDFrom ?? ''}</td>
                        <td contenteditable="true" class="editable-cell" data-field="To">${row.ShareIDTo ?? ''}</td>
                        <td contenteditable="true" class="editable-cell" data-field="Total">${row.TotalShare ?? ''}</td>
                    `;
                    tbody.appendChild(tr);
                });
                _appendEmptyShareRows(tbody, Math.max(0, 5 - rows.length), rows.length);
            } else {
                tbody.innerHTML = `<tr><td colspan="5">No data found for the entered Account Number.</td></tr>`;
                _appendEmptyShareRows(tbody, 5);
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            tbody.innerHTML = `<tr><td colspan="5">Error fetching data. Please try again later.</td></tr>`;
            window.__lastShareCertificateData = { accountNumber, rows: [] };
            _appendEmptyShareRows(tbody, 5);
        });
    });
}

// Helper: appends N empty editable share rows
function _appendEmptyShareRows(tbody, count, startIndex = 0) {
    for (let i = 0; i < count; i++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${startIndex + i + 1}</td>
            <td contenteditable="true" class="editable-cell" data-field="Transactiono"></td>
            <td contenteditable="true" class="editable-cell" data-field="From"></td>
            <td contenteditable="true" class="editable-cell" data-field="To"></td>
            <td contenteditable="true" class="editable-cell" data-field="Total"></td>
        `;
        tbody.appendChild(tr);
    }
}

function bindAdditionalToggleButtonNrm({buttonId, popupId ,getAccType, getBalance, getMemId, getAccNo, getMemIdName, getAccNoName}) {
    const draggable = document.getElementById(popupId);
    const toggleButton = document.getElementById(buttonId);

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
        const accType = getAccType();
        document.getElementById("cc-apRenewLedger").value = accType || '';
        const accBal = getBalance();
        document.getElementById("ccaprenewAmt").value = accBal || '';
        const memID = getMemId();
        document.getElementById("ccaprenewMemAlias").value = memID || '';
        const accNo = getAccNo();
        document.getElementById("ccaprenewaccid").value = accNo || '';
        const memIdName = getMemIdName();
        document.getElementById("ccaprenewMemName").value = memIdName || '';
        const accNoName = getAccNoName();
        document.getElementById("ccaprenewaccname").value = accNoName || '';
    });
}
function bindAdditionalToggleButtonNrmBill(movableDivId, toggleButtonId) {
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

            
                            const ccacceditGLName = document.getElementById("Maintransaccountnumberofaccpostedit")?.value?.trim();
                            document.getElementById("cc-apBillsLedger").value = ccacceditGLName || '';
                             const EditCollChequemasAccIDforaccposting = document.getElementById("Maintransaccountnumberofaccpostedit").value;
console.log("value", EditCollChequemasAccIDforaccposting)
                            fetch('/fetchCollectionChequemasaccpostForEdit', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ EditCollChequemasAccIDforaccposting })
                            })
                                .then(response => response.json())
                                .then(data => {

                                    if (data.success) {
                                        document.getElementById('ccapbillsMemberAlias').value = (data.MemberAlias || '');
                                        document.getElementById('ccapbillsMemberName').value = (data.MemberName || '');

                                    }

                                    else {
                                        showCustomAlert(data.message || 'Member not found');
                                    }

                                })
               

    });
}

function openTransPostInt({buttonId,popupId}){
 const draggable = document.getElementById(popupId);
    const toggleButton = document.getElementById(buttonId);

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
    })  
}

function getShareCertificateFallbackRate() {
    const candidates = [
        document.getElementById('RatePerShare'),
        document.getElementById('Maintransrate'),
        document.getElementById('ShareRate'),
        document.getElementById('share-rate')
    ];

    for (const field of candidates) {
        const value = field?.value?.trim();
        const numeric = Number(value);
        if (value && Number.isFinite(numeric) && numeric > 0) {
            return numeric;
        }
    }

    return 100;
}

function collectShareRowsFromTable() {
    const table = document.getElementById('EditMainSharemastable');
    const tbody = table?.querySelector('tbody');
    if (!tbody) {
        return [];
    }

    const rows = [];
    tbody.querySelectorAll('tr').forEach((tr) => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 5) {
            return;
        }

        const transactionNo = cells[1]?.textContent?.trim() || '';
        const fromValue = cells[2]?.textContent?.trim() || '';
        const toValue = cells[3]?.textContent?.trim() || '';
        const totalValue = cells[4]?.textContent?.trim() || '';

        const fromNo = Number(fromValue);
        const toNo = Number(toValue);
        const totalShare = Number(totalValue);

        if (!transactionNo && !fromValue && !toValue && !totalValue) {
            return;
        }

        if (!Number.isFinite(fromNo) && !Number.isFinite(toNo) && !Number.isFinite(totalShare)) {
            return;
        }

        rows.push({
            transactionNo,
            shareFrom: Number.isFinite(fromNo) ? fromNo : null,
            shareTo: Number.isFinite(toNo) ? toNo : null,
            totalShare: Number.isFinite(totalShare) ? totalShare : null
        });
    });

    return rows;
}

async function resolveShareCertificateData() {
    const accountNumber = document.getElementById('Maintransaccountnumberofaccpostedit')?.value?.trim() || '';
    let memberName = document.getElementById('acc-MemberName-viewaccdeteditaccposting')?.value?.trim()
        || document.getElementById('Maintransmembervalueforedit')?.value?.trim()
        || '';
    let memberAlias = document.getElementById('acc-MemberId-viewaccdeteditaccposting')?.value?.trim() || '';
    const sourceOfFund = document.getElementById('MaintranssrcofFund')?.value?.trim() || '';
    const cachedRows = Array.isArray(window.__lastShareCertificateData?.rows) ? window.__lastShareCertificateData.rows : [];
    let rows = collectShareRowsFromTable();

    if ((!rows || rows.length === 0) && cachedRows.length > 0) {
        rows = cachedRows.map((row) => ({
            transactionNo: String(row.TransactionNo ?? row.transactionNo ?? ''),
            shareFrom: Number(row.ShareIDFrom ?? row.shareFrom ?? row.From ?? row.from ?? 0) || null,
            shareTo: Number(row.ShareIDTo ?? row.shareTo ?? row.To ?? row.to ?? 0) || null,
            totalShare: Number(row.TotalShare ?? row.totalShare ?? row.Total ?? row.total ?? 0) || null
        }));
    }

    if ((!rows || rows.length === 0) && accountNumber) {
        const response = await fetch('/fetchShareTransDetailsForMainAccedit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                EditShareTransACCNumber: accountNumber
            }),
        });

        const data = await response.json();
        if (data.ShareTransDetails && data.ShareTransDetails.length > 0) {
            rows = data.ShareTransDetails.map((row) => ({
                transactionNo: String(row.TransactionNo ?? ''),
                shareFrom: Number(row.ShareIDFrom ?? 0) || null,
                shareTo: Number(row.ShareIDTo ?? 0) || null,
                totalShare: Number(row.TotalShare ?? 0) || null
            }));
            window.__lastShareCertificateData = { accountNumber, rows: data.ShareTransDetails };
        }
    }

    if (accountNumber && (!memberName || !memberAlias)) {
        const response = await fetch('/fetchCollectionChequemasaccpostviewDetailsForEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                EditCollChequemasAccIDforaccpostingVD: accountNumber
            }),
        });

        const data = await response.json();
        memberName = memberName || data.MemberName || data.SLName || '';
        memberAlias = memberAlias || data.MemberAlias || data.SLAlias || '';
    }

    return {
        accountNumber,
        memberName,
        memberAlias,
        sourceOfFund,
        rows
    };
}

function drawCertificateLine(doc, y, pageWidth, margin) {
    doc.setDrawColor(90, 90, 90);
    doc.line(margin, y, pageWidth - margin, y);
}

function addCertificateText(doc, text, x, y, options = {}) {
    const {
        fontSize = 11,
        fontStyle = 'normal',
        align = 'left',
        maxWidth = 0
    } = options;

    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    if (maxWidth > 0) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y, { align });
        return lines.length;
    }

    doc.text(text, x, y, { align });
    return 1;
}

function buildShareCertificatePdf(context) {
    const jspdfNamespace = window.jspdf;
    const jsPDF = jspdfNamespace && jspdfNamespace.jsPDF;

    if (!jsPDF) {
        throw new Error('jsPDF is not available.');
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const numericRows = context.rows.filter((row) => row && (row.shareFrom !== null || row.shareTo !== null || row.totalShare !== null));
    if (numericRows.length === 0) {
        throw new Error('No share rows are available to print.');
    }

    const totalShares = numericRows.reduce((sum, row) => sum + (Number(row.totalShare) || 0), 0);
    const shareFromValues = numericRows.map((row) => Number(row.shareFrom)).filter(Number.isFinite);
    const shareToValues = numericRows.map((row) => Number(row.shareTo)).filter(Number.isFinite);
    const shareFromNo = shareFromValues.length ? Math.min(...shareFromValues) : null;
    const shareToNo = shareToValues.length ? Math.max(...shareToValues) : null;
    const ratePerShare = getShareCertificateFallbackRate();
    const certificateValue = totalShares * ratePerShare;
    const issuedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    doc.setFillColor(247, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    let y = 18;
    doc.setTextColor(15, 23, 42);
    addCertificateText(doc, 'SHARE CERTIFICATE', pageWidth / 2, y, { fontSize: 18, fontStyle: 'bold', align: 'center' });
    y += 6;
    addCertificateText(doc, 'Summary of the share holdings shown in the account view', pageWidth / 2, y, {
        fontSize: 10,
        align: 'center'
    });
    y += 6;
    drawCertificateLine(doc, y, pageWidth, margin);
    y += 10;

    const leftX = margin;
    const rightX = pageWidth / 2 + 4;
    const infoMaxWidth = pageWidth / 2 - margin - 8;

    const leftFields = [
        `Member Name: ${context.memberName || 'N/A'}`,
        `Member ID: ${context.memberAlias || 'N/A'}`,
        `Account Number: ${context.accountNumber || 'N/A'}`
    ];

    const rightFields = [
        `Share Range: ${shareFromNo !== null && shareToNo !== null ? `${shareFromNo} to ${shareToNo}` : 'N/A'}`,
        `Total Shares: ${totalShares}`,
        `Rate per Share: ${ratePerShare}`
    ];

    leftFields.forEach((text) => {
        const lineCount = addCertificateText(doc, text, leftX, y, { fontSize: 11, maxWidth: infoMaxWidth });
        y += lineCount * 5.5;
    });

    let rightY = 34;
    rightFields.forEach((text) => {
        const lineCount = addCertificateText(doc, text, rightX, rightY, { fontSize: 11, maxWidth: infoMaxWidth });
        rightY += lineCount * 5.5;
    });

    y = Math.max(y, rightY) + 4;
    if (context.sourceOfFund) {
        const lineCount = addCertificateText(doc, `Source of Fund: ${context.sourceOfFund}`, leftX, y, {
            fontSize: 11,
            maxWidth: pageWidth - (margin * 2)
        });
        y += lineCount * 5.5;
    }

    const summaryText = `This certifies that the member above holds the shares listed below, covering the range ${shareFromNo !== null && shareToNo !== null ? `${shareFromNo} to ${shareToNo}` : 'N/A'}. The certificate value is ${certificateValue.toFixed(2)} at the stated rate.`;
    const summaryLines = addCertificateText(doc, summaryText, leftX, y + 2, {
        fontSize: 10,
        maxWidth: pageWidth - (margin * 2)
    });
    y += summaryLines * 5.5 + 6;

    const tableHeaders = [
        { label: 'Txn No.', width: 32 },
        { label: 'From', width: 38 },
        { label: 'To', width: 38 },
        { label: 'Shares', width: 30 }
    ];
    const tableStartX = leftX;
    const rowHeight = 8;
    const tableWidth = tableHeaders.reduce((sum, col) => sum + col.width, 0);

    const ensurePageSpace = (neededHeight) => {
        if (y + neededHeight > pageHeight - 20) {
            doc.addPage();
            y = 18;
            doc.setTextColor(15, 23, 42);
        }
    };

    ensurePageSpace(18);
    doc.setFillColor(226, 232, 240);
    doc.rect(tableStartX, y, tableWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    let cellX = tableStartX;
    tableHeaders.forEach((col) => {
        doc.rect(cellX, y, col.width, rowHeight);
        doc.text(col.label, cellX + 2, y + 5.5);
        cellX += col.width;
    });

    y += rowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    numericRows.forEach((row) => {
        ensurePageSpace(rowHeight + 2);
        doc.rect(tableStartX, y, tableWidth, rowHeight);
        const values = [
            row.transactionNo || '',
            row.shareFrom !== null ? String(row.shareFrom) : '',
            row.shareTo !== null ? String(row.shareTo) : '',
            row.totalShare !== null ? String(row.totalShare) : ''
        ];
        cellX = tableStartX;
        values.forEach((value, index) => {
            const width = tableHeaders[index].width;
            doc.rect(cellX, y, width, rowHeight);
            doc.text(String(value), cellX + 2, y + 5.5);
            cellX += width;
        });
        y += rowHeight;
    });

    y += 10;
    ensurePageSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signature', margin, y);
    doc.text('Member Signature', pageWidth - margin - 40, y);
    doc.setFont('helvetica', 'normal');
    doc.line(margin, y + 12, margin + 55, y + 12);
    doc.line(pageWidth - margin - 40, y + 12, pageWidth - margin, y + 12);

    doc.setFontSize(9);
    doc.text(`Issued on ${issuedDate}`, margin, pageHeight - 10);

    return doc;
}

async function openShareCertificate() {
    const previewWindow = window.open('', '_blank');

    if (!previewWindow) {
        const message = 'The browser blocked the PDF preview window.';
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(message);
        } else {
            alert(message);
        }
        return;
    }

    try {
        const context = await resolveShareCertificateData();
        const doc = buildShareCertificatePdf(context);
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        previewWindow.location.href = blobUrl;
        previewWindow.document.title = 'Share Certificate';

        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
        previewWindow.close();
        console.error('Error generating share certificate:', error);
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(error.message || 'Unable to generate the share certificate.');
        } else {
            alert(error.message || 'Unable to generate the share certificate.');
        }
    }
}

function bindPrintShareCertificateButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) {
        return;
    }

    button.addEventListener('click', openShareCertificate);
}

// Automatically initialize all movable divs by matching ID patterns
function initializeMovableDivs() {
    const movableDivs = document.querySelectorAll('.movableDiv[id^="movableDiv"]');
    movableDivs.forEach((div) => {
        const match = div.id.match(/^movableDiv(\d+)$/);
        if (!match) {
            return;
        }

        const id = match[1];
        const closeButtonExists = document.getElementById(`closeButton${id}`) !== null;
        const cancelButtonExists = document.getElementById(`cancelButton${id}`) !== null;
        const toggleButtonExists = document.getElementById(`toggleButton${id}`) !== null;

        if (!closeButtonExists || !cancelButtonExists || !toggleButtonExists) {
            console.warn(`movableDiv${id} is present but missing control IDs:`, {
                close: closeButtonExists,
                cancel: cancelButtonExists,
                toggle: toggleButtonExists,
            });
        }

        makeMovable(div.id, `closeButton${id}`, `cancelButton${id}`, `toggleButton${id}`);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMovableDivs);
} else {
    initializeMovableDivs();
}

bindAdditionalToggleButton({
    buttonId: "MaintranstoggleButton184",
    popupId: "movableDiv184",
    getAccountNumber: () =>
        document.getElementById("Maintransaccountnumberofaccpostedit").value,

    getSlAlias: () =>
        document.getElementById("Maintransaccountnumberofaccpostedit").value
    });


bindAdditionalToggleButton({
    buttonId: "MultiTransViewAccDetailBtn",
    popupId: "movableDiv184",
    getAccountNumber: () =>
        document.getElementById("Multitransaccountnumber").value,
    getSlAlias: () =>
        document.getElementById("Multitransaccountnumber").value
});
bindAdditionalToggleButtonNrmBill('movableDiv187', 'MaintranstoggleButton187');

bindAdditionalToggleButtonNrm({
    popupId: "movableDiv188",
    buttonId: "MaintranstoggleButton188",
    getAccType: () => document.getElementById("Maintransacctypeforaccpostingedit").value,
    getBalance: () => document.getElementById("MaintransBalance").value,
    getMemId: () => document.getElementById("MaintransMembervalueforedit1").value,
    getMemIdName: () => document.getElementById("MaintransMembervalueforedit").value,
    getAccNo: () => document.getElementById("Maintransaccountnumberofaccpostedit").value,
    getAccNoName: () => document.getElementById("Maintransmembervalueforedit").value,
});

bindAdditionalToggleButtonNrm({
    popupId: "movableDiv188",
    buttonId: "MultiTransRenewBtn",
    getAccType: () => document.getElementById("MultitransaccTypeLgrname").value,
    getBalance: () => document.getElementById("MultiTransPrincipalBal").value,
    getMemId: () => document.getElementById("MultitransmemberAlias").value,
    getMemIdName: () => document.getElementById("MultitransmemberName").value,
    getAccNo: () => document.getElementById("Multitransaccountnumber").value,
    getAccNoName: () => document.getElementById("Multitransaccountname").value,
});

openTransPostInt({buttonId:'MaintransPostIntBtn',popupId:'movableDiv191'});

bindPrintShareCertificateButton('PrintShareCertificateBtn');

      
