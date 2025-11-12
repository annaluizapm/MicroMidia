// Funções comuns para o header

// Função para verificar se o usuário está logado
function verificarUsuarioLogado() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        return null;
    }
    
    try {
        return JSON.parse(usuarioLogado);
    } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error);
        localStorage.removeItem('usuarioLogado');
        return null;
    }
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    alert('Logout realizado com sucesso!');
    window.location.href = 'login.html';
}

// Atualizar nome do usuário no header ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const usuario = verificarUsuarioLogado();
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (userNameDisplay) {
        if (usuario) {
            userNameDisplay.textContent = `Olá, ${usuario.nome}!`;
        } else {
            // Se não há usuário logado, redirecionar para login
            const currentPage = window.location.pathname;
            if (!currentPage.includes('login.html') && !currentPage.includes('cadastro.html') && !currentPage.includes('index.html')) {
                alert('Você precisa estar logado para acessar esta página');
                window.location.href = 'login.html';
            }
        }
    }
    
    // Adicionar event listeners aos botões de logout
    const btnsLogout = document.querySelectorAll('.btn-logout, .btn-logout-perfil');
    btnsLogout.forEach(btn => {
        btn.addEventListener('click', logout);
    });
});
