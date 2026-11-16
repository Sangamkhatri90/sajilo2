
document.addEventListener('DOMContentLoaded', () => {
    const maindiv = document.getElementById("movableDiv131");
    const maincollectorReportForm = document.getElementById('collectorReportForm');
    const collectorReportselectall = document.getElementById('collectorReportselectall');
    const collectorNameReportDiv = document.getElementById('collectorNameReportDiv');
    const collectorNameReportForm = document.getElementById('collectorNameReportForm');
    const collectorNameReportTable = document.getElementById('collectorNameReportTable');
    const collectorValueDiv = document.getElementById('collectorValueDiv');
    const collectorValueForm = document.getElementById('collectorValueForm');
    const collectorValueTable = document.getElementById('collectorValueTable');

    // Preserve dates between the two form submissions
    let collectorReportFromDate = '';
    let collectorReportToDate = '';

    document.getElementById('closeButton131').addEventListener('click', () => {
        maindiv.style.display = 'none';
    });

    document.getElementById('cancelButton131').addEventListener('click', () => {
        maindiv.style.display = 'none';
    });

    document.getElementById('collectorValueDivbtnsOK').addEventListener('click', () => {
        collectorValueDiv.style.display = 'none';
    });

    document.getElementById('collectorValueDivXbtn').addEventListener('click', () => {
        collectorValueDiv.style.display = 'none';
    });

    /* ---------- utilities ---------- */
    const toggleAll = (sel, checked) =>
        document.querySelectorAll(sel).forEach(cb => (cb.checked = checked));

    /* ---------- ONE-TIME select helpers ---------- */
    document.getElementById('collectorNameReportSelectAll')
        .addEventListener('click', e => {
            e.preventDefault();
            toggleAll('.collector-report-checkbox', true);
        });

    document.getElementById('collectorNameReportUnselectAll')
        .addEventListener('click', e => {
            e.preventDefault();
            toggleAll('.collector-report-checkbox', false);
        });

    let highestZIndex = 3;

    const bringToFront = el => {
        highestZIndex += 1;
        el.style.zIndex = highestZIndex;
    };

    /* === DO NOT EDIT ANYTHING INSIDE THIS FUNCTION === */
    const makeDivMovable = div => {
        let isDragging = false;
        let offsetX, offsetY;

        div.addEventListener('mousedown', e => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            e.preventDefault();
            bringToFront(div);

            const { left, top } = div.getBoundingClientRect();
            offsetX = e.clientX - left;
            offsetY = e.clientY - top;
            isDragging = true;
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;

            div.style.position = 'absolute';
            div.style.left = `${e.pageX - offsetX}px`;
            div.style.top = `${e.pageY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    };

    [collectorNameReportDiv, collectorValueDiv].forEach(makeDivMovable);

    // ================= MAIN COLLECTOR REPORT FORM =================

    maincollectorReportForm.addEventListener('submit', async e => {
        e.preventDefault();

        const fromDate = document.getElementById("CollectorReportDateForm").value;
        const toDate = document.getElementById('CollectorReportToForm').value;

        // Save dates before opening the collector selection popup
        collectorReportFromDate = fromDate;
        collectorReportToDate = toDate;

        if (!fromDate || !toDate) {
            showCustomAlert('Please select both dates.');
            return;
        }

        if (fromDate > toDate) {
            showCustomAlert('From date cannot be greater than To date.');
            return;
        }

        const [year1, month1, day1] = fromDate.split("-");
        const formattedfromDate = `${day1}/${month1}/${year1}`;

        console.log("formatedformdate", formattedfromDate);

        const [year2, month2, day2] = toDate.split("-");
        const formattedtoDate = `${day2}/${month2}/${year2}`;

        console.log("formattedtoDate", formattedtoDate);

        if (collectorReportselectall.checked) {

            console.log("Select ALL triggered");

            maindiv.style.display = 'none';

            const response = await fetch('/collector/multi-report', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    all: true,
                    fromDate: formattedfromDate,
                    toDate: formattedtoDate
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error("Collector report failed:", data.error);
                showCustomAlert(data.error || "Failed to generate report.");
                return;
            }

            collectorValueDiv.style.display = 'block';
            collectorNameReportDiv.style.display = "none";

            displayCollectorResult(data);

            return;
        }

        // Individual collector selection
        try {
            const res = await fetch('/get-collector-report-name-id');

            if (!res.ok) {
                throw new Error('Failed to fetch collector data');
            }

            const collectorNameReportData = await res.json();

            collectorNameReportTable.innerHTML = collectorNameReportData.map((row, i) => `
                <tr>
                    <td>
                        <input
                            type="checkbox"
                            class="collector-report-checkbox"
                            data-name="${row.CollectorName}"
                            data-alias="${row.CollectorAlias}"
                            value="${row.CollectorID}">
                    </td>
                    <td>${i + 1}</td>
                    <td>${row.CollectorName}</td>
                    <td>${row.CollectorAlias}</td>
                </tr>
            `).join('');

            maindiv.style.display = 'none';
            collectorNameReportDiv.style.display = 'block';

        } catch (err) {
            console.error('Error fetching collectors:', err);
            showCustomAlert('Unable to fetch collector list.');
        }
    });

    // ================= COLLECTOR SELECTION FORM =================

    collectorNameReportForm.addEventListener('submit', async e => {
        e.preventDefault();

        const selectedCollectoerNames = Array.from(
            document.querySelectorAll('.collector-report-checkbox:checked')
        ).map(checkbox => checkbox.value);

        console.log('selectedCollectoerNames', selectedCollectoerNames);

        if (selectedCollectoerNames.length === 0) {
            showCustomAlert('No values selected');
            return;
        }

        // Reuse the dates saved by the main form
        const fromDate = collectorReportFromDate;
        const toDate = collectorReportToDate;

        if (!fromDate || !toDate) {
            showCustomAlert('Date range is missing. Please reopen Collector Report.');
            return;
        }

        const [year1, month1, day1] = fromDate.split("-");
        const formattedfromDate = `${day1}/${month1}/${year1}`;

        console.log("formatedformdate", formattedfromDate);

        const [year2, month2, day2] = toDate.split("-");
        const formattedtoDate = `${day2}/${month2}/${year2}`;

        console.log("formattedtoDate", formattedtoDate);

        try {
            const response6 = await fetch('/get-cramount-collector', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedCollectoerNames,
                    fromDate: formattedfromDate,
                    toDate: formattedtoDate
                })
            });

            const datacollector = await response6.json();

            console.log("Collector API Response:", datacollector);

            if (!response6.ok || !datacollector.success) {
                console.error("Collector report failed:", datacollector.error);
                showCustomAlert(datacollector.error || "Failed to generate report.");
                return;
            }

            collectorNameReportDiv.style.display = "none";
            collectorValueDiv.style.display = 'block';

            renderTableCollector(datacollector.data || []);

        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Unable to generate collector report.');
        }
    });

    // ================= DISPLAY FUNCTIONS =================

    function displayCollectorResult(data) {
        renderTableCollector(data.data || []);
    }

    function renderTableCollector(datacollector) {
        const tablecollector = document.querySelector('#collectorValueTable tbody');
        tablecollector.innerHTML = '';

        let totalAmount = 0;
        let totalCommission = 0;

        datacollector.forEach((item, index) => {
            totalAmount += Number(item.TotalCrAmount);
            totalCommission += Number(item.CommissionAmount);

            const rowHTML = `
                <tr>
                    <td>${item.SNO}</td>
                    <td>${item.CollectorName}</td>
                    <td>${item.CollectorAlias}</td>
                    <td>${item.CommissionPercent}%</td>
                    <td>${item.TotalCrAmount}</td>
                    <td>${item.CommissionAmount}</td>
                </tr>`;

            tablecollector.insertAdjacentHTML('beforeend', rowHTML);
        });

        // TOTAL ROW
        const totalRow = `
            <tr style="font-weight:bold; background:#f3f3f3;">
                <td colspan="4" style="text-align:right;">TOTAL :</td>
                <td>${totalAmount}</td>
                <td>${totalCommission.toFixed(2)}</td>
            </tr>
        `;

        tablecollector.insertAdjacentHTML('beforeend', totalRow);
    }

});
