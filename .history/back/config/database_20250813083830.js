const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.LOCALHOST,
    user: process.env.ROOT,
    password: process.env.ROOT,
    database: process.env.MICRO_MIDIA,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Usar promises
const promisePool = pool.promise();

module.exports = promisePool;
