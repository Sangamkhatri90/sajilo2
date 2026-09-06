const DEFAULT_DRIVER = "ODBC Driver 17 for SQL Server";
const connectionString = `Server=localhost;Database=SAJILODB;UID=sa;PWD=123;Driver={${DEFAULT_DRIVER}};`;
const connectionString1 = `Server=localhost;Database=Cha79080_DB;UID=sa;PWD=123;Driver={${DEFAULT_DRIVER}};`;

const createConnectionString = (databaseName) => {
    return `Server=localhost;Database=${databaseName};UID=sa;PWD=123;Driver={${DEFAULT_DRIVER}};`;
};
module.exports = {
    connectionString,
    connectionString1,
    createConnectionString,
};