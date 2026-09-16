(function () {
  const form = document.getElementById("multipleBackupForm");
  const tableBody = document.getElementById("multipleBackupTableBody");
  const backupButton = document.getElementById("multipleBackupOkButton");
  const trigger = document.getElementById("toggleButton193");
  if (!form || !tableBody || !backupButton || !trigger) return;

  const showMessage = (message) => {
    if (typeof showCustomAlert === "function") showCustomAlert(message);
    else alert(message);
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

  const loadOrganizations = async () => {
    tableBody.innerHTML = '<tr><td colspan="4">Loading organizations...</td></tr>';
    try {
      const response = await fetch("/multiple-backup-organizations");
      const organizations = await response.json();
      if (!response.ok) throw new Error(organizations.message || "Unable to load organizations.");

      tableBody.innerHTML = organizations.length
        ? organizations.map((organization, index) => `<tr><td>${index + 1}</td><td><input type="checkbox" class="multiple-backup-check" data-db-name="${escapeHtml(organization.DBName)}"></td><td>${escapeHtml(organization.OrgName)}</td><td>${escapeHtml(organization.OrgAlias)}</td></tr>`).join("")
        : '<tr><td colspan="4">No organizations available for backup.</td></tr>';
    } catch (error) {
      tableBody.innerHTML = '<tr><td colspan="4">Unable to load organizations.</td></tr>';
      showMessage(error.message || "Unable to load organizations.");
    }
  };

  trigger.addEventListener("click", loadOrganizations);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedDatabases = Array.from(tableBody.querySelectorAll(".multiple-backup-check:checked"), (checkbox) => checkbox.dataset.dbName);
    if (!selectedDatabases.length) return showMessage("Select at least one organization to back up.");
    if (!confirm(`Back up ${selectedDatabases.length} selected organization(s)?`)) return;

    backupButton.disabled = true;
    backupButton.textContent = "Starting backup...";
    selectedDatabases.forEach((dbName) => {
      const downloadFrame = document.createElement("iframe");
      downloadFrame.hidden = true;
      downloadFrame.src = `/backup-database?dbName=${encodeURIComponent(dbName)}`;
      document.body.appendChild(downloadFrame);
      setTimeout(() => downloadFrame.remove(), 60000);
    });

    setTimeout(() => {
      backupButton.disabled = false;
      backupButton.textContent = "Ok";
    }, 3000);
  });
})();
