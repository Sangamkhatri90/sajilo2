require("dotenv").config();

const DEFAULT_DRIVER =
    process.env.SQL_DRIVER || "ODBC Driver 17 for SQL Server";

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
