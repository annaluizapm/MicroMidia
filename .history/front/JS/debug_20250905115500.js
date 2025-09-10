// Função utilitária para limpar dados do localStorage
function limparDadosLocalStorage() {
    localStorage.removeItem('usuarioLogado');
    console.log('Dados do localStorage limpos');
    alert('Dados limpos! Por favor, faça login novamente.');
    window.location.href = 'login.html';
}

// Função para mostrar informações do usuário atual
function mostrarInformacoesUsuario() {
    const usuario = localStorage.getItem('usuarioLogado');
    if (usuario) {
        try {
            const parsed = JSON.parse(usuario);
            console.log('Usuário atual no localStorage:', parsed);
            alert(`Usuário atual: ${parsed.nome} (ID: ${parsed.id})`);
        } catch (error) {
            console.error('Erro ao parsear usuário:', error);
            alert('Dados corrompidos no localStorage');
        }
    } else {
        alert('Nenhum usuário logado');
    }
}

// Função de logout (caso não esteja disponível em script.js)
function logout() {
    localStorage.removeItem('usuarioLogado');
    alert('Logout realizado com sucesso!');
    window.location.href = 'login.html';
}

// Adicionar ao console global para debug
window.limparDados = limparDadosLocalStorage;
window.mostrarUsuario = mostrarInformacoesUsuario;
window.logout = logout; // Garantir que logout está disponível

console.log('Funções de debug disponíveis:');
console.log('- limparDados(): Limpa o localStorage');
console.log('- mostrarUsuario(): Mostra informações do usuário atual');
console.log('- logout(): Faz logout do usuário atual');
