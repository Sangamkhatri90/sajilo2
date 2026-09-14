 async function checkSetup() {
    const secondDBName = prompt("Enter the name of the second database (e.g. Cha7081).Note that one database will be created by default:");
    if (!secondDBName || secondDBName.trim() === "") {
      showCustomAlert("Database name is required!");
      return;
    }
console.log("hello bhaiu")
    const confirmCheck =  await showCustomConfirm(
      `Check the following before proceding:\n
1️⃣ MSSQL is installed\n
2️⃣ No existing DB named SAJILODB and ${secondDBName}\n
3️⃣ Proceed with setup?\n`
    );

    if (!confirmCheck) return;

    try {
      const res = await fetch(`/check-setup?secondDb=${encodeURIComponent(secondDBName)}`);
      const data = await res.json();

      if (res.ok && data.canProceed) {
        const confirmSetup = showCustomConfirm(`✅ All checks passed.\nProceed to setup?`);
        if (confirmSetup) {
          const setupRes = await fetch(`/setup?secondDb=${encodeURIComponent(secondDBName)}`);
          const setupMsg = await setupRes.text();
          showCustomAlert(setupMsg);
        }
      } else {
        showCustomAlert(data.message);
      }
    } catch (err) {
      showCustomAlert("❌ Error: " + err.message);
    }
  }