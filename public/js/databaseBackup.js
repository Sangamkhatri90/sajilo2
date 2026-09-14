(function () {
  const backupLink = document.getElementById("backupDatabaseLink");
  if (!backupLink) return;

  backupLink.addEventListener("click", (event) => {
    event.preventDefault();

    if (!confirm("Backup the currently selected database now?")) return;

    const originalText = backupLink.textContent;
    backupLink.textContent = "Starting backup...";
    backupLink.style.pointerEvents = "none";

    // Use the browser's native file download flow for large .bak files.
    // This avoids loading the whole backup into fetch/blob memory and avoids
    // generic "Failed to fetch" errors from interrupted download streams.
    window.location.href = "/backup-database";

    setTimeout(() => {
      backupLink.textContent = originalText;
      backupLink.style.pointerEvents = "";
    }, 3000);
  });
})();