// Poll server for removable drives and update the #org-drive select
(function () {
  async function getDrives() {
    try {
      const res = await fetch('/api/drives');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.drives) ? data.drives : [];
    } catch (e) {
      return [];
    }
  }

  let prevDrives = [];

  async function updateDriveSelect() {
    const drives = await getDrives();
    const select = document.getElementById('org-drive');
    if (!select) return;

    // Normalize values (letters without colon)
    const normalized = drives.map(d => String(d).replace(':', '').toUpperCase()).filter(Boolean);

    // Remove previously-added removable options that are no longer present
    prevDrives.forEach(d => {
      if (!normalized.includes(d)) {
        const opt = select.querySelector(`option[data-removable="${d}"]`);
        if (opt) opt.remove();
      }
    });

    // Add any newly-detected removable drives
    let newlyAdded = false;
    normalized.forEach(d => {
      if (!Array.from(select.options).some(o => o.value.toUpperCase() === d)) {
        const option = document.createElement('option');
        option.value = d;
        option.text = d;
        option.setAttribute('data-removable', d);
        select.appendChild(option);
        newlyAdded = true;
      }
    });

    // If a new drive was just added, select it so user can see the inserted pendrive
    if (newlyAdded && normalized.length > 0) {
      select.value = normalized[normalized.length - 1];
    }

    prevDrives = normalized;
  }

  // Start polling after DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    updateDriveSelect();
    setInterval(updateDriveSelect, 3000);
  });
})();
