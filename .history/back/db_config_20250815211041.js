const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aninha2007',
    database: 'micro_midia',
    connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);
const db = pool.promise();

// Testar conexão ao iniciar
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
    } else {
        console.log('✅ Conectado ao MySQL com sucesso!');
        connection.release();
    }
});

module.exports = db;
