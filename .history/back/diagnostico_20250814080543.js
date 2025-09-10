// Script de diagnóstico completo
require('dotenv').config();

console.log('🔧 === DIAGNÓSTICO COMPLETO DO SISTEMA ===\n');

// 1. Verificar variáveis de ambiente
console.log('1. 📋 VARIÁVEIS DE AMBIENTE:');
console.log('   DB_HOST:', process.env.DB_HOST || '❌ NÃO DEFINIDA');
console.log('   DB_USER:', process.env.DB_USER || '❌ NÃO DEFINIDA');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ DEFINIDA' : '⚠️ VAZIA');
console.log('   DB_NAME:', process.env.DB_NAME || '❌ NÃO DEFINIDA');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('   PORT:', process.env.PORT || '❌ NÃO DEFINIDA');
console.log('');

// 2. Testar dependências
console.log('2. 📦 TESTANDO DEPENDÊNCIAS:');
try {
    const mysql = require('mysql2');
    console.log('   ✅ mysql2');
} catch (e) {
    console.log('   ❌ mysql2 - Execute: npm install mysql2');
}

try {
    const bcrypt = require('bcryptjs');
    console.log('   ✅ bcryptjs');
} catch (e) {
    console.log('   ❌ bcryptjs - Execute: npm install bcryptjs');
}

try {
    const jwt = require('jsonwebtoken');
    console.log('   ✅ jsonwebtoken');
} catch (e) {
    console.log('   ❌ jsonwebtoken - Execute: npm install jsonwebtoken');
}
console.log('');

// 3. Testar conexão com banco
console.log('3. 🗄️ TESTANDO CONEXÃO COM BANCO:');
const mysql = require('mysql2');

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

async function testarBanco() {
    try {
        // Teste de conexão básica
        console.log('   🔌 Testando conexão...');
        const [rows] = await promisePool.execute('SELECT 1 as test');
        console.log('   ✅ Conexão estabelecida');

        // Verificar se banco existe
        console.log('   📊 Verificando banco de dados...');
        const [dbs] = await promisePool.execute('SELECT DATABASE() as db');
        console.log('   ✅ Banco atual:', dbs[0].db);

        // Verificar tabelas
        console.log('   📋 Verificando tabelas...');
        const [tables] = await promisePool.execute('SHOW TABLES');
        
        const requiredTables = ['usuarios', 'postagens', 'comentarios', 'curtidas'];
        const existingTables = tables.map(t => Object.values(t)[0]);
        
        requiredTables.forEach(table => {
            if (existingTables.includes(table)) {
                console.log(`   ✅ Tabela ${table}`);
            } else {
                console.log(`   ❌ Tabela ${table} - NÃO ENCONTRADA`);
            }
        });

        // Verificar estrutura da tabela usuarios
        if (existingTables.includes('usuarios')) {
            console.log('   🔍 Estrutura da tabela usuarios:');
            const [columns] = await promisePool.execute('DESCRIBE usuarios');
            columns.forEach(col => {
                console.log(`      📝 ${col.Field} (${col.Type}) ${col.Key ? '[' + col.Key + ']' : ''}`);
            });
        }

    } catch (error) {
        console.log('   ❌ ERRO NA CONEXÃO:', error.message);
        console.log('   🔍 Código do erro:', error.code);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   💡 SOLUÇÃO: Verifique usuário e senha do MySQL no arquivo .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   💡 SOLUÇÃO: Inicie o serviço MySQL');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('   💡 SOLUÇÃO: Crie o banco micro_midia');
        }
    } finally {
        pool.end();
    }
}

// 4. Testar servidor
async function testarServidor() {
    console.log('4. 🌐 TESTANDO SERVIDOR:');
    try {
        const response = await fetch('http://localhost:3000/');
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Servidor respondendo:', data.message);
        } else {
            console.log('   ⚠️ Servidor respondeu com status:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Servidor não está respondendo');
        console.log('   💡 Execute: npm run dev (no diretório back)');
    }
}

async function executarDiagnostico() {
    await testarBanco();
    console.log('');
    await testarServidor();
    
    console.log('\n🏁 === DIAGNÓSTICO CONCLUÍDO ===');
    console.log('📄 Para mais detalhes, veja TROUBLESHOOTING.md');
}

executarDiagnostico();
