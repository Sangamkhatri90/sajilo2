<<<<<<< HEAD
const DEFAULT_DRIVER = "ODBC Driver 17 for SQL Server";
const connectionString = `Server=localhost;Database=SAJILODBSukunda;UID=sa;PWD=123;Driver={${DEFAULT_DRIVER}};`;
const connectionString1 = `Server=localhost;Database=Cha79080_DB;UID=sa;PWD=123;Driver={${DEFAULT_DRIVER}};`;
=======
require("dotenv").config();

const DEFAULT_DRIVER =
    process.env.SQL_DRIVER || "ODBC Driver 17 for SQL Server";
>>>>>>> c8f0f449f9c53552d2d038cfbf9e82bf2d7a1b4f

const createConnectionString = (databaseName) => {
    return [
        `Server=${process.env.SQL_SERVER}`,
        `Database=${databaseName}`,
        `UID=${process.env.SQL_USER}`,
        `PWD=${process.env.SQL_PASSWORD}`,
        `Driver={${DEFAULT_DRIVER}}`,
    ].join(";");
};

const connectionString = createConnectionString(process.env.SQL_DATABASE);
const connectionString1 = createConnectionString(process.env.SQL_DATABASE_1);

module.exports = {
    connectionString,
    connectionString1,
    createConnectionString,
};
