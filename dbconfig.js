const connectionString = "Server=localhost;Database=SAJILODB;user=sa;password=123;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};";
const connectionString1 = "Server=localhost;Database=Cha79080_DB;user=sa;password=123;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};";

const createConnectionString = (databaseName) => {
    return `Server=localhost;Database=${databaseName};user=sa;password=123;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};`;
};
module.exports = {
    connectionString,
    connectionString1,
    createConnectionString,
    
};