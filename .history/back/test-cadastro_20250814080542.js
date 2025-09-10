// Teste simples de cadastro
const API_URL = 'http://localhost:3000/api';

async function testarCadastro() {
    console.log('🧪 Testando cadastro...');
    
    const dadosUsuario = {
        nome: 'Teste Usuario',
        email: 'teste@exemplo.com',
        senha: '123456',
        bio: 'Usuario de teste'
    };
    
    try {
        console.log('📤 Enviando dados:', dadosUsuario);
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });
        
        console.log('📨 Status da resposta:', response.status);
        console.log('📨 Headers da resposta:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('📨 Dados da resposta:', data);
        
        if (response.ok) {
            console.log('✅ Cadastro realizado com sucesso!');
            console.log('🔑 Token:', data.token);
        } else {
            console.log('❌ Erro no cadastro:', data.error);
        }
        
    } catch (error) {
        console.log('💥 Erro de conexão:', error.message);
        console.log('🔍 Detalhes do erro:', error);
    }
}

// Teste da conexão primeiro
async function testarConexao() {
    console.log('🌐 Testando conexão com servidor...');
    
    try {
        const response = await fetch(`${API_URL}/../`);
        const data = await response.json();
        console.log('✅ Servidor conectado:', data);
        return true;
    } catch (error) {
        console.log('❌ Servidor não está respondendo:', error.message);
        return false;
    }
}

async function executarTestes() {
    const servidorOk = await testarConexao();
    
    if (servidorOk) {
        setTimeout(() => {
            testarCadastro();
        }, 1000);
    } else {
        console.log('⚠️ Não é possível testar o cadastro sem conexão com o servidor');
    }
}

executarTestes();
