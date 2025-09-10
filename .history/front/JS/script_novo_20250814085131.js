// script.js - Configuração simplificada da API (SEM autenticação)
const API_BASE_URL = 'http://localhost:3000/api';

// Função de cadastro simplificada
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
                // Salvar dados do usuário no localStorage (SEM token)
                localStorage.setItem('user', JSON.stringify(data.user));
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

// Função de login simplificada
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
                // Salvar dados do usuário no localStorage
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

        // Verificar se usuário está logado
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (user) {
            // Adicionar botão para nova postagem
            const novoPostBtn = document.createElement('button');
            novoPostBtn.textContent = '✍️ Nova Postagem';
            novoPostBtn.className = 'btn btn-primary';
            novoPostBtn.onclick = () => criarPostagem(user.id);
            novoPostBtn.style.marginBottom = '20px';
            container.appendChild(novoPostBtn);
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
            postElement.innerHTML = `
                <h3>Postagem de ${post.autor_nome}</h3>
                <p>${post.autor_nome} - ${new Date(post.criado_em).toLocaleString()}</p>
                <p>${post.conteudo}</p>
                <div class="post-actions">
                    <button onclick="curtirPost(${post.id})" class="btn-like">
                        ❤️ ${post.total_curtidas}
                    </button>
                    <button onclick="toggleComentarios(${post.id})" class="btn">
                        💬 ${post.total_comentarios} comentários
                    </button>
                </div>
                <div id="comments-section-${post.id}" class="comments-section" style="display: none;">
                    <div id="comments-list-${post.id}"></div>
                    ${user ? `
                        <div class="comment-form">
                            <textarea id="comment-text-${post.id}" placeholder="Escreva um comentário..." rows="2"></textarea>
                            <button onclick="adicionarComentario(${post.id}, ${user.id})" class="btn btn-small">Comentar</button>
                        </div>
                    ` : '<p>Faça login para comentar</p>'}
                </div>
            `;
            container.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
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

// Função para curtir postagem
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
            carregarPostagens(); // Recarregar para atualizar contador
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
            commentsList.innerHTML = '<p style="color: #666; font-style: italic;">Nenhum comentário ainda.</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.style.cssText = 'margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;';
            commentElement.innerHTML = `
                <strong>${comment.autor_nome}</strong>
                <span style="color: #666; font-size: 0.8em;"> - ${new Date(comment.criado_em).toLocaleString()}</span>
                <div>${comment.texto}</div>
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
            carregarPostagens(); // Atualizar contador
        } else {
            alert(data.error || 'Erro ao adicionar comentário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para verificar se está logado
function verificarLogin() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (user) {
        // Mostrar nome do usuário se houver elemento para isso
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `Olá, ${user.nome}!`;
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
    verificarLogin();
    
    // Carregar postagens se estiver na página do fórum
    if (window.location.pathname.includes('forum.html')) {
        carregarPostagens();
    }

    // Event listeners para botões da página inicial
    const loginBtn = document.querySelector('.btn-secondary-login');
    const cadastroBtn = document.querySelector('.btn-secondary-cadastro');

    if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    if (cadastroBtn) cadastroBtn.addEventListener('click', () => window.location.href = 'cadastro.html');
});
