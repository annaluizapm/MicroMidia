// Versão simplificada da função handleCadastro que funciona
async function handleCadastroSimples(event) {
    event.preventDefault();
    console.log('🚀 Cadastro iniciado...');
    
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const bio = document.getElementById('bio')?.value || '';
    
    if (!nome || !email || !senha) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const usuario = await criarUsuario(nome, email, senha, bio, '');
        console.log('Usuário criado:', usuario);
        
        if (usuario && usuario.id) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'forum.html';
        } else {
            alert('Erro ao criar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro no cadastro: ' + error.message);
    }
}

// Substituir a função original quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastroForm');
    if (form) {
        // Substituir a função globalmente
        window.handleCadastro = handleCadastroSimples;
        console.log('Função de cadastro substituída pela versão simplificada');
    }
});
