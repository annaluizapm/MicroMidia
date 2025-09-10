const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: 'root',
    password: 'Aninha2007',
    database: process.env.DB_NAME || 'micro_midia',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Usar promises
const promisePool = pool.promise();

module.exports = promisePool;
