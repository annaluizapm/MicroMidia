// Teste de conexão com banco de dados
require('dotenv').config();
const mysql = require('mysql2');

console.log('🔧 Configurações do banco:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Password:', process.env.DB_PASSWORD ? '[DEFINIDA]' : '[VAZIA]');
console.log('Database:', process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

async function testarConexaoBD() {
    try {
        console.log('📊 Testando conexão com o banco de dados...');
        
        const [rows] = await promisePool.execute('SELECT 1 as test');
        console.log('✅ Conexão com banco OK:', rows);
        
        // Testar se a tabela usuarios existe
        const [tables] = await promisePool.execute('SHOW TABLES LIKE "usuarios"');
        if (tables.length > 0) {
            console.log('✅ Tabela usuarios encontrada');
            
            // Verificar estrutura da tabela
            const [columns] = await promisePool.execute('DESCRIBE usuarios');
            console.log('📋 Estrutura da tabela usuarios:', columns);
        } else {
            console.log('❌ Tabela usuarios não encontrada!');
            console.log('💡 Execute o script SQL em front/SQL/micro_midia.sql');
        }
        
    } catch (error) {
        console.log('❌ Erro na conexão com banco:', error.message);
        console.log('🔍 Código do erro:', error.code);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Verifique usuário e senha do MySQL');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 MySQL não está rodando ou porta incorreta');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Banco de dados não existe. Crie o banco micro_midia');
        }
    } finally {
        pool.end();
    }
}

testarConexaoBD();
