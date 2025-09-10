// forum.js - Funcionalidades específicas do fórum
const API_BASE_URL = 'http://127.0.0.1:3002/api';

// Função para obter token do localStorage
function getToken() {
    return localStorage.getItem('token');
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

// Função para criar nova postagem
async function criarPostagem() {
    const conteudo = prompt('Digite o conteúdo da sua postagem:');
    
    if (!conteudo) return;

    const token = getToken();
    if (!token) {
        alert('Você precisa estar logado para criar uma postagem');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/postagens`, {
            method: 'POST',
            body: JSON.stringify({ conteudo })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Postagem criada com sucesso!');
            carregarPostagens(); // Recarregar postagens
        } else {
            alert(data.error || 'Erro ao criar postagem');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para carregar postagens
async function carregarPostagens() {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`);
        const posts = await response.json();

        const container = document.querySelector('.content');
        if (!container) return;

        // Limpar container mantendo apenas o título
        const title = container.querySelector('h2');
        container.innerHTML = '';
        if (title) {
            container.appendChild(title);
            
            // Adicionar botão para nova postagem se estiver logado
            const token = getToken();
            if (token) {
                const novoPostBtn = document.createElement('button');
                novoPostBtn.textContent = '✍️ Nova Postagem';
                novoPostBtn.className = 'btn btn-primary';
                novoPostBtn.onclick = criarPostagem;
                novoPostBtn.style.marginBottom = '20px';
                container.appendChild(novoPostBtn);
            }
        }

        if (posts.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Nenhuma postagem encontrada. Seja o primeiro a postar!';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#666';
            container.appendChild(emptyMessage);
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            const dataFormatada = new Date(post.criado_em).toLocaleString('pt-BR');
            
            postElement.innerHTML = `
                <div class="post-header">
                    <h3>${post.autor_nome}</h3>
                    <span class="post-date">${dataFormatada}</span>
                </div>
                <div class="post-content">
                    <p>${post.conteudo}</p>
                </div>
                <div class="post-actions">
                    <button onclick="curtirPost(${post.id})" class="btn-like" id="like-btn-${post.id}">
                        ❤️ <span id="like-count-${post.id}">${post.total_curtidas}</span>
                    </button>
                    <button onclick="toggleComentarios(${post.id})" class="btn-comment">
                        💬 ${post.total_comentarios} comentários
                    </button>
                </div>
                <div id="comments-section-${post.id}" class="comments-section" style="display: none;">
                    <div id="comments-list-${post.id}" class="comments-list"></div>
                    <div class="comment-form">
                        <textarea id="comment-text-${post.id}" placeholder="Escreva um comentário..." rows="2"></textarea>
                        <button onclick="adicionarComentario(${post.id})" class="btn btn-small">Comentar</button>
                    </div>
                </div>
            `;
            
            container.appendChild(postElement);
            
            // Verificar se o usuário já curtiu esta postagem
            verificarCurtida(post.id);
        });
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        const container = document.querySelector('.content');
        if (container) {
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Erro ao carregar postagens. Verifique se o servidor está rodando.';
            errorMessage.style.color = 'red';
            errorMessage.style.textAlign = 'center';
            container.appendChild(errorMessage);
        }
    }
}

// Função para verificar se o usuário curtiu uma postagem
async function verificarCurtida(postId) {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/likes/check/${postId}`);
        const data = await response.json();
        
        if (response.ok && data.liked) {
            const likeBtn = document.getElementById(`like-btn-${postId}`);
            if (likeBtn) {
                likeBtn.classList.add('liked');
                likeBtn.style.color = '#e74c3c';
            }
        }
    } catch (error) {
        console.error('Erro ao verificar curtida:', error);
    }
}

// Função para curtir/descurtir postagem
async function curtirPost(postId) {
    const token = getToken();
    if (!token) {
        alert('Você precisa estar logado para curtir uma postagem');
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const response = await fetchWithAuth(`${API_BASE_URL}/curtidas`, {
            method: 'POST',
            body: JSON.stringify({ postagem_id: postId, usuario_id: user?.id })
        });

        const data = await response.json();
        if (response.ok) {
            // Atualizar contador de curtidas
            const countElement = document.getElementById(`like-count-${postId}`);
            const btnElement = document.getElementById(`like-btn-${postId}`);
            
            if (data.liked) {
                btnElement.classList.add('liked');
                btnElement.style.color = '#e74c3c';
                countElement.textContent = parseInt(countElement.textContent) + 1;
            } else {
                btnElement.classList.remove('liked');
                btnElement.style.color = '';
                countElement.textContent = parseInt(countElement.textContent) - 1;
            }
        } else {
            alert(data.error || 'Erro ao curtir postagem');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para mostrar/esconder comentários
async function toggleComentarios(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    const isVisible = section.style.display !== 'none';
    
    if (isVisible) {
        section.style.display = 'none';
    } else {
        section.style.display = 'block';
        await carregarComentarios(postId);
    }
}

// Função para carregar comentários
async function carregarComentarios(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
        const comments = await response.json();
        
        const commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <strong>${comment.autor_nome}</strong>
                    <span class="comment-date">${new Date(comment.criado_em).toLocaleString('pt-BR')}</span>
                </div>
                <div class="comment-text">${comment.texto}</div>
            `;
            commentsList.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
    }
}

// Função para adicionar comentário
async function adicionarComentario(postId) {
    const token = getToken();
    if (!token) {
        alert('Você precisa estar logado para comentar');
        return;
    }

    const textArea = document.getElementById(`comment-text-${postId}`);
    const texto = textArea.value.trim();
    
    if (!texto) {
        alert('Digite um comentário');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/comments`, {
            method: 'POST',
            body: JSON.stringify({ postagem_id: postId, texto })
        });

        const data = await response.json();
        if (response.ok) {
            textArea.value = '';
            await carregarComentarios(postId);
            // Atualizar contador de comentários na postagem
            carregarPostagens();
        } else {
            alert(data.error || 'Erro ao adicionar comentário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para verificar autenticação e mostrar/esconder elementos
function verificarAutenticacao() {
    const token = getToken();
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        // Mostrar nome do usuário se houver elemento para isso
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `Olá, ${userData.nome}!`;
        }
        
        // Adicionar botão de logout se não existir
        if (!document.querySelector('.btn-logout')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Sair';
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.onclick = logout;
            
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(logoutBtn);
            }
        }
    } else {
        // Redirecionar para login se não estiver autenticado
        // window.location.href = 'login.html';
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    carregarPostagens();
});
