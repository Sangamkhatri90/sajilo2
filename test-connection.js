const sql = require('mssql');
const config = require('./setupConfig');

(async () => {
  try {
    const pool = await sql.connect(config);
    console.log("✅ Connected to MSSQL from Node.js!");
    await pool.close();
  } catch (err) {
    console.error("❌ Connection failed from Node.js:", err.message);
  }
})();
