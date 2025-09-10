// forum.js - Funcionalidades do fórum SEM autenticação JWT
const API_BASE_URL = 'http://localhost:3000/api';

// Função para carregar postagens
async function carregarPostagens() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        const posts = await response.json();

        const container = document.querySelector('.content');
        if (!container) return;

        // Limpar container mantendo apenas o título
        const title = container.querySelector('h2');
        container.innerHTML = '';
        if (title) {
            container.appendChild(title);
            
            // Verificar se usuário está logado
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user) {
                const novoPostBtn = document.createElement('button');
                novoPostBtn.textContent = '✍️ Nova Postagem';
                novoPostBtn.className = 'btn btn-primary';
                novoPostBtn.onclick = () => criarPostagem(user.id);
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

        const user = JSON.parse(localStorage.getItem('user') || 'null');

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
                    ${user ? `
                        <div class="comment-form">
                            <textarea id="comment-text-${post.id}" placeholder="Escreva um comentário..." rows="2"></textarea>
                            <button onclick="adicionarComentario(${post.id}, ${user.id})" class="btn btn-small">Comentar</button>
                        </div>
                    ` : '<p class="login-message">Faça login para comentar</p>'}
                </div>
            `;
            
            container.appendChild(postElement);
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

// Função para criar nova postagem
async function criarPostagem(userId) {
    const conteudo = prompt('Digite o conteúdo da sua postagem:');
    
    if (!conteudo) return;

    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario_id: userId, conteudo })
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

// Função para curtir/descurtir postagem
async function curtirPost(postId) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('Você precisa estar logado para curtir uma postagem');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/likes/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario_id: user.id, postagem_id: postId })
        });

        const data = await response.json();
        if (response.ok) {
            // Atualizar contador de curtidas localmente
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
async function adicionarComentario(postId, userId) {
    const textArea = document.getElementById(`comment-text-${postId}`);
    const texto = textArea.value.trim();
    
    if (!texto) {
        alert('Digite um comentário');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario_id: userId, postagem_id: postId, texto })
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

// Função para verificar autenticação
function verificarAutenticacao() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (user) {
        // Mostrar nome do usuário
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `Olá, ${user.nome}!`;
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
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    carregarPostagens();
});
