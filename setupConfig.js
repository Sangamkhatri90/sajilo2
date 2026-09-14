module.exports = {
  user: 'sa',
  password: '123',
  server: 'localhost\\SQLEXPRESS',
  database: 'master', // Always use master when creating new DBs
 
  
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
