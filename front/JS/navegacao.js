// navegacao.js - Funções de navegação comuns

// Adicionar event listeners quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Botões de navegação na index
    const btnCadastro = document.getElementById('btn-cadastro');
    const btnLogin = document.getElementById('btn-login');
    
    if (btnCadastro) {
        btnCadastro.addEventListener('click', () => {
            window.location.href = 'cadastro.html';
        });
    }
    
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    // Botões secundários nas páginas de login/cadastro
    const btnsSecundarios = document.querySelectorAll('.btn-secondary');
    btnsSecundarios.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('criar conta') || text.includes('cadastr')) {
            btn.addEventListener('click', () => {
                window.location.href = 'cadastro.html';
            });
        } else if (text.includes('login') || text.includes('entrar')) {
            btn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    });
});
