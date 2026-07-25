const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // usuario que creaste
  password: 'Password1*',   // contraseña
  database: 'iamzerotrust'
});

module.exports = pool;
