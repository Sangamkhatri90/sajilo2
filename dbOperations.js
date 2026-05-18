const sql = require('msnodesqlv8');
const  {connectionString, connectionString1,connectionString2,connectionString3, createConnectionString, conn} = require('./dbconfig');
console.error      ('Type of config:', typeof connectionString2,typeof connectionString3);
// Function to get all login details
async function getLoginDetails() {
    try {
        sql.query(connectionString1, "SELECT * FROM dbo.tbSubLedgerMaster", (err, rows) => {
            if (err) {
                console.error("Error executing query:", err);
            } else {
                console.log("Rows from dbo.tbSubLedgerMaster:", rows);
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to get login details by ID
async function getLoginDetailsById(id) {
    try {
        const query = `SELECT * FROM dbo.OldJournals WHERE JournalID = ${id}`;
        sql.query(connectionString1, query, (err, rows) => {
            if (err) {
                console.error("Error executing query:", err);
            } else {
                if (rows.length > 0) {
                    console.log("User found:", rows);
                } else {
                    console.log("No user found with ID:", id);
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

module.exports = {
    getLoginDetails,
    getLoginDetailsById
};
