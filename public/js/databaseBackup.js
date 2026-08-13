(function () {
  const backupLink = document.getElementById("backupDatabaseLink");
  if (!backupLink) return;

  function getBackupFileName(response) {
    const disposition = response.headers.get("Content-Disposition") || "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) return decodeURIComponent(utf8Match[1].replace(/"/g, ""));

    const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (fileNameMatch) return fileNameMatch[1];

    return `database_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
  }

  async function saveBackupWithPicker(blob, fileName) {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "SQL Server Backup",
          accept: { "application/octet-stream": [".bak"] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  function downloadBackup(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  backupLink.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!confirm("Backup the currently selected database now?")) return;

    const originalText = backupLink.textContent;
    backupLink.textContent = "Backing up...";
    backupLink.style.pointerEvents = "none";

    try {
      const response = await fetch("/backup-database");
      const contentType = response.headers.get("Content-Type") || "";

      if (!response.ok) {
        let message = "Database backup failed.";
        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          message = errorData.details || errorData.message || message;
        }
        throw new Error(message);
      }

      const fileName = getBackupFileName(response);
      const blob = await response.blob();

      if (window.showSaveFilePicker) {
        await saveBackupWithPicker(blob, fileName);
      } else {
        downloadBackup(blob, fileName);
      }

      alert("Database backup completed successfully.");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Backup failed:", err);
        alert(err.message || "Database backup failed.");
      }
    } finally {
      backupLink.textContent = originalText;
      backupLink.style.pointerEvents = "";
    }
  });
})();
