(function () {
  const restoreLink = document.getElementById("restoreDatabaseLink");
  if (!restoreLink) return;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".bak";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  restoreLink.addEventListener("click", (event) => {
    event.preventDefault();
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const backupFile = fileInput.files && fileInput.files[0];
    if (!backupFile) return;

    if (!backupFile.name.toLowerCase().endsWith(".bak")) {
      alert("Please select a SQL Server .bak file.");
      return;
    }

    const confirmed = confirm(
      "Restore this .bak file into the currently logged-in database?\n\n" +
      "Warning: this will replace the current database tables and data."
    );
    if (!confirmed) return;

    const originalText = restoreLink.textContent;
    restoreLink.textContent = "Restoring...";
    restoreLink.style.pointerEvents = "none";

    try {
      const formData = new FormData();
      formData.append("backupFile", backupFile);

      const response = await fetch("/restore-database", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.message || "Database restore failed.");
      }

      alert(data.message || "Database restored successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Restore failed:", err);
      alert(err.message || "Database restore failed.");
    } finally {
      restoreLink.textContent = originalText;
      restoreLink.style.pointerEvents = "";
    }
  });
})();
