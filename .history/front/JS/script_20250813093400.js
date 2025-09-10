
// script.js - Configuração da API
const API_BASE_URL = 'http://127.0.0.1:3002/api';

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
                localStorage.setItem('user', JSON.stringify(data.usuario));
                alert(`Bem-vindo(a), ${data.usuario.nome}!`);
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

// Função para carregar postagens
async function carregarPostagens() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        const posts = await response.json();

        const container = document.querySelector('.content');
        if (!container) return;

        // Limpar container (manter apenas o título)
        const title = container.querySelector('h2');
        container.innerHTML = '';
        if (title) container.appendChild(title);

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>Postagem de ${post.autor_nome}</h3>
                <p>${post.autor_nome} - ${new Date(post.criado_em).toLocaleString()}</p>
                <p>${post.conteudo}</p>
                <div class="post-actions">
                    <button onclick="curtirPost(${post.id})" class="btn-like">
                        ❤️ ${post.total_curtidas}
                    </button>
                    <button onclick="verComentarios(${post.id})" class="btn">
                        💬 ${post.total_comentarios} comentários
                    </button>
                </div>
            `;
            container.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
    }
}

// Função para curtir postagem
async function curtirPost(postId) {
    const token = getToken();
    if (!token) {
        alert('Você precisa estar logado para curtir uma postagem');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/likes/toggle`, {
            method: 'POST',
            body: JSON.stringify({ postagem_id: postId })
        });

        const data = await response.json();
        if (response.ok) {
            // Recarregar postagens para atualizar contador
            carregarPostagens();
        } else {
            alert(data.error || 'Erro ao curtir postagem');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para verificar se está logado
function verificarLogin() {
    const token = getToken();
    const loginBtn = document.querySelector('.btn-login');
    const logoutBtn = document.querySelector('.btn-logout');
    
    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Função de logout
function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Redirecionamento entre páginas
document.addEventListener('DOMContentLoaded', () => {
    // Verificar login ao carregar página
    verificarLogin();

    // Carregar postagens se estiver na página do fórum
    if (window.location.pathname.includes('forum.html')) {
        carregarPostagens();
    }

    // Event listeners para botões
    const loginBtn = document.querySelector('.btn-secondary-login');
    const cadastroBtn = document.querySelector('.btn-secondary-cadastro');

    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    if (cadastroBtn) cadastroBtn.addEventListener('click', () => window.location.href = 'cadastro.html');
});
