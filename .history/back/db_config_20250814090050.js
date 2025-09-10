const mysql = require('mysql2');

// Configuração do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aninha2007', 
    database: 'micro_midia',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);
const db = pool.promise();

// Testar conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        console.log('💡 Verifique se:');
        console.log('   - MySQL está rodando');
        console.log('   - Banco "micro_midia" existe');
        console.log('   - Credenciais estão corretas');
    } else {
        console.log('✅ Conectado ao MySQL com sucesso!');
        connection.release();
    }
});

module.exports = db;
