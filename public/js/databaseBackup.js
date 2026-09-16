(function () {
  const backupLink = document.getElementById("backupDatabaseLink");
  if (!backupLink) return;

  window.saveDatabaseBackupToDestination = async (url, suggestedName) => {
    if (typeof window.showSaveFilePicker !== "function") return false;

    let fileHandle;
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: "SQL Server backup", accept: { "application/octet-stream": [".bak"] } }],
      });
    } catch (error) {
      if (error.name === "AbortError") return null;
      throw error;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Database backup failed.");
    }

    const writable = await fileHandle.createWritable();
    try {
      await response.body.pipeTo(writable);
    } catch (error) {
      await writable.abort();
      throw error;
    }
    return true;
  };

  backupLink.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!confirm("Backup the currently selected database now?")) return;

    const originalText = backupLink.textContent;
    backupLink.textContent = "Starting backup...";
    backupLink.style.pointerEvents = "none";

    try {
      const result = await window.saveDatabaseBackupToDestination(
        "/backup-database",
        `database-backup-${new Date().toISOString().slice(0, 10)}.bak`
      );
      if (result === false) {
        window.location.href = "/backup-database";
        return;
      }
      if (result) alert("Database backup saved successfully.");
    } catch (error) {
      console.error("Backup failed:", error);
      alert(error.message || "Database backup failed.");
    } finally {
      backupLink.textContent = originalText;
      backupLink.style.pointerEvents = "";
    }
  });
})();
