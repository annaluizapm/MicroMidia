// Testador de configurações MySQL
const mysql = require('mysql2');

const configuracoes = [
    { user: 'root', password: '', desc: 'Sem senha (XAMPP/WAMP padrão)' },
    { user: 'root', password: 'root', desc: 'Senha: root' },
    { user: 'root', password: 'password', desc: 'Senha: password' },
    { user: 'root', password: '123456', desc: 'Senha: 123456' },
    { user: 'root', password: 'mysql', desc: 'Senha: mysql' },
];

async function testarConfiguracoes() {
    console.log('🔐 Testando configurações de MySQL...\n');
    
    for (let i = 0; i < configuracoes.length; i++) {
        const config = configuracoes[i];
        console.log(`${i + 1}. Testando ${config.desc}...`);
        
        try {
            const pool = mysql.createPool({
                host: 'localhost',
                user: config.user,
                password: config.password,
                database: 'micro_midia',
                waitForConnections: true,
                connectionLimit: 1,
                queueLimit: 0
            });
            
            const promisePool = pool.promise();
            
            // Testar conexão
            const [rows] = await promisePool.execute('SELECT 1 as test');
            console.log(`   ✅ SUCESSO! Use esta configuração:`);
            console.log(`   DB_USER=${config.user}`);
            console.log(`   DB_PASSWORD=${config.password}`);
            console.log(`   DB_HOST=localhost`);
            console.log(`   DB_NAME=micro_midia\n`);
            
            // Verificar se tabela usuarios existe
            try {
                const [tables] = await promisePool.execute('SHOW TABLES LIKE "usuarios"');
                if (tables.length > 0) {
                    console.log('   ✅ Tabela usuarios encontrada!');
                } else {
                    console.log('   ⚠️ Tabela usuarios não existe - execute o script SQL');
                }
            } catch (e) {
                console.log('   ⚠️ Banco micro_midia não existe - crie o banco primeiro');
            }
            
            pool.end();
            return; // Para no primeiro que funcionar
            
        } catch (error) {
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                console.log('   ❌ Acesso negado');
            } else if (error.code === 'ER_BAD_DB_ERROR') {
                console.log('   ⚠️ Credenciais OK, mas banco "micro_midia" não existe');
                console.log(`   💡 Crie o banco com estas credenciais:`);
                console.log(`   DB_USER=${config.user}`);
                console.log(`   DB_PASSWORD=${config.password}`);
            } else {
                console.log('   ❌ Erro:', error.message);
            }
        }
        console.log('');
    }
    
    console.log('❌ Nenhuma configuração funcionou!');
    console.log('💡 Possíveis soluções:');
    console.log('1. Instale XAMPP (MySQL sem senha)');
    console.log('2. Configure uma senha diferente');
    console.log('3. Verifique se MySQL está rodando');
}

testarConfiguracoes();
