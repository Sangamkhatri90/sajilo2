const sqlq = require('mssql');
const fs = require('fs');
const path = require('path');
const config = require('./setupConfig');

async function runSetupScript(secondDbName) {
  try {
    let script = fs.readFileSync(path.join(__dirname, 'scripts/setup.sql'), 'utf8');

    // Replace placeholder with user-provided DB name
    script = script.replace(/\bCha7081\b/g, secondDbName);

    const pool = await sqlq.connect(config);
    const statements = script.split(/\bGO\b/gi);

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        await pool.request().batch(trimmed);
      }
    }

    console.log("✅ Setup completed.");
    await pool.close();
  } catch (err) {
    console.error("❌ Error in setup:", err);
    throw err;
  }
}

module.exports = runSetupScript;
