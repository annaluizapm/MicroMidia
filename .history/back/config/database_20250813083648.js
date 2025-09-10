const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.Anna2007,
    password: process.env.DB_PASSWORD,
    database: process.env.micro_midia,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Usar promises
const promisePool = pool.promise();

module.exports = promisePool;
