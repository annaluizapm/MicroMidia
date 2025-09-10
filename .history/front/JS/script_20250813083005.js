
// script.js - Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Função para obter token do localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Função para salvar token
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Função para remover token
function removeToken() {
    localStorage.removeItem('token');
}

// Função para fazer requisições autenticadas
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    return response;
}

// Função de cadastro atualizada para usar a API
async function cadastrarUsuario(event) {
    event.preventDefault();
    const nome = document.querySelector('#cadastro-nome').value;
    const email = document.querySelector('#cadastro-email').value;
    const senha = document.querySelector('#cadastro-senha').value;
    const bio = document.querySelector('#cadastro-bio')?.value || '';

    if (nome && email && senha) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, senha, bio })
            });

            const data = await response.json();

            if (response.ok) {
                saveToken(data.token);
                alert('Cadastro realizado com sucesso!');
                window.location.href = 'forum.html';
            } else {
                alert(data.error || 'Erro no cadastro');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor');
        }
    } else {
        alert('Por favor, preencha todos os campos obrigatórios.');
    }
}

// Função de login atualizada para usar a API
async function fazerLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#login-email').value;
    const senha = document.querySelector('#login-senha').value;

    if (email && senha) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                saveToken(data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert(`Bem-vindo(a), ${data.user.nome}!`);
                window.location.href = 'forum.html';
            } else {
                alert(data.error || 'Email ou senha incorretos');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor');
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}
    } else {
        alert('Email ou senha inválidos!');
    }
}

// Redirecionamento entre páginas
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('.btn-secondary-login');
    const cadastroBtn = document.querySelector('.btn-secondary-cadastro');

    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    if (cadastroBtn) cadastroBtn.addEventListener('click', () => window.location.href = 'cadastro.html');
});
