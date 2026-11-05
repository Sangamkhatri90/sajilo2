
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const container = $('divisionReportTableContainer');

  // ---------- draggable ----------
  let z = 3;
  (function makeDivMovable(div) {
    if (!div) return;
    let drag = false, dx, dy;
    div.addEventListener('mousedown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      e.preventDefault();
      div.style.zIndex = ++z;
      const r = div.getBoundingClientRect();
      dx = e.clientX - r.left; dy = e.clientY - r.top; drag = true;
    });
    document.addEventListener('mousemove', (e) => {
      if (!drag) return;
      div.style.position = 'absolute';
      div.style.left = `${e.pageX - dx}px`;
      div.style.top = `${e.pageY - dy}px`;
    });
    document.addEventListener('mouseup', () => (drag = false));
  })(container);

  // ---------- close buttons ----------
  ['divisionReportTableContainerXbtn', 'divisionReportOKBtns'].forEach((id) =>
    $(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      container.style.display = 'none';
    })
  );

  // ---------- helpers ----------
  const fmtDrCr = (n) => {
    const v = Number(n) || 0;
    if (!v) return '0.00';
    return `${Math.abs(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${v > 0 ? 'Dr' : 'Cr'}`;
  };

  const addRow = (tbody, cells, bold = false) => {
    const tr = document.createElement('tr');
    cells.forEach((txt) => {
      const td = document.createElement('td');
      td.textContent = txt;
      td.style.padding = '8px';
      if (bold) td.style.fontWeight = 'bold';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  };

  // ---------- submit ----------
  $('myForm29').addEventListener('submit', async (event) => {
    event.preventDefault();

    const showAlias = $('frdr-show-alias').checked;
    const fromDate = $('FRDR-Datefrom').value;
    const toDate = $('FRDR-Dateto').value;

    if (!fromDate || !toDate) return alert('Please provide both From and To dates.');

    let resp;
    try {
      resp = await fetch('/api/DR/tablepop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate, toDate }), // server normalizes AD/BS format
      });
    } catch {
      return alert('Network error while loading division report.');
    }

    if (!resp.ok) {
      const { error } = await resp.json().catch(() => ({}));
      return alert(error || 'Failed to load division report.');
    }

    const data = await resp.json();
    container.style.display = 'block';

    // group by group name
    const groups = {};
    data.forEach((item) => {
      const g = item['group name'] || 'Ungrouped';
      if (!groups[g]) {
        groups[g] = {
          alias: item['group alias'] || '',
          rows: [],
          sums: { opening: 0, period: 0, total: 0 },
        };
      }
      groups[g].rows.push(item);
      groups[g].sums.opening += item.openingBalance;
      groups[g].sums.period += item.period;
      groups[g].sums.total += item.total;
    });

    const thead = $('divisionReportThead');
    const tbody = $('divisionReportTbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data.length) {
      addRow(tbody, ['No data available for the selected period.']);
      return;
    }

    // header
    const hdrs = ['S.No', 'Particular'];
    if (showAlias) hdrs.push('Alias');
    hdrs.push('Number', 'Opening Balance', 'Period', 'Total');

    const headerRow = document.createElement('tr');
    hdrs.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      th.style.padding = '8px';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // body
    let gi = 1;
    const grand = { opening: 0, period: 0, total: 0 };

    for (const [groupName, info] of Object.entries(groups)) {
      // group header
      const head = [gi, groupName];
      if (showAlias) head.push(info.alias);
      head.push('', '', '', '');
      addRow(tbody, head, true);

      // ledger rows
      info.rows.forEach((item, idx) => {
        const row = [`${gi}.${idx + 1}`, item.particular];
        if (showAlias) row.push(item.alias);
        row.push(
          item.number,
          fmtDrCr(item.openingBalance),
          fmtDrCr(item.period),
          fmtDrCr(item.total)
        );
        addRow(tbody, row);
      });

      // group total
      const tot = ['', 'Group Total'];
      if (showAlias) tot.push('');
      tot.push('', fmtDrCr(info.sums.opening), fmtDrCr(info.sums.period), fmtDrCr(info.sums.total));
      addRow(tbody, tot, true);

      grand.opening += info.sums.opening;
      grand.period += info.sums.period;
      grand.total += info.sums.total;
      gi++;
    }

    // grand total
    const gt = ['', 'Grand Total'];
    if (showAlias) gt.push('');
    gt.push('', fmtDrCr(grand.opening), fmtDrCr(grand.period), fmtDrCr(grand.total));
    addRow(tbody, gt, true);
  });
});
