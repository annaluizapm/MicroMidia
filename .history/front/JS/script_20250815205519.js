
const API_BASE_URL = 'http://127.0.0.1:3002/api';

// ================================
// FUNÇÕES UTILITÁRIAS
// ================================
function mostrarMensagem(texto, tipo = 'info') {
    alert(texto);
}

function limparFormulario(formId) {
    document.getElementById(formId)?.reset();
}

// ================================
// CRUD USUÁRIOS
// ================================

// Listar usuários
async function listarUsuarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        const usuarios = await response.json();
        
        console.log('Usuários:', usuarios);
        mostrarMensagem(`${usuarios.length} usuários encontrados`);
        return usuarios;
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        mostrarMensagem('Erro ao carregar usuários', 'erro');
    }
}

// Criar usuário
async function criarUsuario(nome, email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Usuário criado com sucesso!', 'sucesso');
            return data.usuario;
        } else {
            mostrarMensagem(data.error || 'Erro ao criar usuário', 'erro');
        }
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Buscar usuário por ID
async function buscarUsuario(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
        const usuario = await response.json();
        
        if (response.ok) {
            console.log('Usuário encontrado:', usuario);
            return usuario;
        } else {
            mostrarMensagem('Usuário não encontrado', 'erro');
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Atualizar usuário
async function atualizarUsuario(id, nome, email) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email })
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
        } else {
            mostrarMensagem(data.error || 'Erro ao atualizar usuário', 'erro');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Deletar usuário
async function deletarUsuario(id) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Usuário deletado com sucesso!', 'sucesso');
        } else {
            mostrarMensagem(data.error || 'Erro ao deletar usuário', 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// ================================
// CRUD POSTAGENS
// ================================

// Listar postagens
async function listarPostagens() {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`);
        const postagens = await response.json();
        
        console.log('Postagens:', postagens);
        exibirPostagens(postagens);
        return postagens;
    } catch (error) {
        console.error('Erro ao listar postagens:', error);
        mostrarMensagem('Erro ao carregar postagens', 'erro');
    }
}

// Criar postagem
async function criarPostagem(conteudo, usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                conteudo: conteudo,
                usuario_id: usuarioId 
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Postagem criada com sucesso!', 'sucesso');
            listarPostagens(); // Recarregar postagens
            return data.postagem;
        } else {
            mostrarMensagem(data.error || 'Erro ao criar postagem', 'erro');
        }
    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Buscar postagem por ID
async function buscarPostagem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${id}`);
        const postagem = await response.json();
        
        if (response.ok) {
            console.log('Postagem encontrada:', postagem);
            return postagem;
        } else {
            mostrarMensagem('Postagem não encontrada', 'erro');
        }
    } catch (error) {
        console.error('Erro ao buscar postagem:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Atualizar postagem
async function atualizarPostagem(id, conteudo) {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conteudo })
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Postagem atualizada com sucesso!', 'sucesso');
            listarPostagens(); // Recarregar postagens
        } else {
            mostrarMensagem(data.error || 'Erro ao atualizar postagem', 'erro');
        }
    } catch (error) {
        console.error('Erro ao atualizar postagem:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Deletar postagem
async function deletarPostagem(id) {
    if (!confirm('Tem certeza que deseja deletar esta postagem?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarMensagem('Postagem deletada com sucesso!', 'sucesso');
            listarPostagens(); // Recarregar postagens
        } else {
            mostrarMensagem(data.error || 'Erro ao deletar postagem', 'erro');
        }
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// ================================
// FUNÇÕES DE INTERFACE
// ================================

// Exibir postagens na tela
function exibirPostagens(postagens) {
    const container = document.querySelector('.content') || document.querySelector('main');
    if (!container) return;

    // Limpar container mantendo título e botão
    const titulo = container.querySelector('h2');
    const btnNova = container.querySelector('.btn-nova-postagem');
    container.innerHTML = '';
    if (titulo) container.appendChild(titulo);
    if (btnNova) container.appendChild(btnNova);

    if (postagens.length === 0) {
        const mensagem = document.createElement('p');
        mensagem.textContent = 'Nenhuma postagem encontrada.';
        mensagem.style.textAlign = 'center';
        mensagem.style.color = '#666';
        container.appendChild(mensagem);
        return;
    }

    postagens.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <strong>${post.usuario_nome || 'Usuário'}</strong>
                <div class="post-date">${new Date(post.criado_em || post.created_at).toLocaleString()}</div>
            </div>
            <p>${post.conteudo}</p>
            <div class="post-actions">
                <button onclick="curtirPost(${post.id})" class="btn-like">
                    ❤️ ${post.curtidas || 0} curtidas
                </button>
                <button onclick="verComentarios(${post.id})" class="btn-comment">
                    💬 ${post.comentarios || 0} comentários
                </button>
                <button onclick="editarPostagem(${post.id}, '${post.conteudo.replace(/'/g, "\\'")}'))" class="btn-small">Editar</button>
                <button onclick="deletarPostagem(${post.id})" class="btn-small">Deletar</button>
            </div>
            <div id="comentarios-${post.id}" class="comentarios-section" style="display: none;">
                <div class="loading">Carregando comentários...</div>
            </div>
        `;
        container.appendChild(postElement);
    });
}

// ================================
// CURTIDAS E COMENTÁRIOS
// ================================

// Curtir postagem
async function curtirPost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/curtidas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                postagem_id: postId,
                usuario_id: 1 // Usando ID fixo para simplificar
            })
        });

        if (response.ok) {
            mostrarMensagem('Postagem curtida!', 'sucesso');
            listarPostagens(); // Recarregar para atualizar contador
        } else {
            mostrarMensagem('Erro ao curtir postagem', 'erro');
        }
    } catch (error) {
        console.error('Erro ao curtir:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Ver comentários
async function verComentarios(postId) {
    const comentariosDiv = document.getElementById(`comentarios-${postId}`);
    
    if (comentariosDiv.style.display === 'none') {
        comentariosDiv.style.display = 'block';
        await carregarComentarios(postId);
    } else {
        comentariosDiv.style.display = 'none';
    }
}

// Carregar comentários de uma postagem
async function carregarComentarios(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comentarios/${postId}`);
        const comentarios = await response.json();
        
        const comentariosDiv = document.getElementById(`comentarios-${postId}`);
        
        let html = `
            <h4>Comentários</h4>
            <div class="comment-form">
                <textarea id="novo-comentario-${postId}" placeholder="Escreva um comentário..."></textarea>
                <button onclick="adicionarComentario(${postId})" class="btn-primary btn-small">Comentar</button>
            </div>
        `;
        
        if (comentarios.length === 0) {
            html += '<p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>';
        } else {
            comentarios.forEach(comentario => {
                html += `
                    <div class="comment">
                        <strong>${comentario.autor_nome || 'Usuário'}</strong>
                        <p>${comentario.conteudo}</p>
                        <small>${new Date(comentario.criado_em).toLocaleString()}</small>
                    </div>
                `;
            });
        }
        
        comentariosDiv.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        document.getElementById(`comentarios-${postId}`).innerHTML = '<p>Erro ao carregar comentários</p>';
    }
}

// Adicionar comentário
async function adicionarComentario(postId) {
    const textarea = document.getElementById(`novo-comentario-${postId}`);
    const conteudo = textarea.value.trim();
    
    if (!conteudo) {
        mostrarMensagem('Digite um comentário', 'erro');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postagem_id: postId,
                usuario_id: 1, // Usando ID fixo para simplificar
                texto: conteudo
            })
        });
        
        if (response.ok) {
            textarea.value = '';
            await carregarComentarios(postId); // Recarregar comentários
            mostrarMensagem('Comentário adicionado!', 'sucesso');
        } else {
            mostrarMensagem('Erro ao adicionar comentário', 'erro');
        }
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
    }
}

// Editar postagem
function editarPostagem(id, conteudoAtual) {
    const novoConteudo = prompt('Editar postagem:', conteudoAtual);
    if (novoConteudo && novoConteudo !== conteudoAtual) {
        atualizarPostagem(id, novoConteudo);
    }
}

// ================================
// EVENTOS E INICIALIZAÇÃO
// ================================

// Formulário de cadastro (se existir)
async function handleCadastro(event) {
    event.preventDefault();
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    
    if (nome && email && senha) {
        const usuario = await criarUsuario(nome, email, senha);
        if (usuario) {
            limparFormulario('cadastroForm');
            window.location.href = 'forum.html';
        }
    }
}

// Formulário de login (se existir)
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    
    if (email && senha) {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`);
            const usuarios = await response.json();
            
            const usuario = usuarios.find(u => u.email === email);
            if (usuario) {
                mostrarMensagem('Login realizado com sucesso!', 'sucesso');
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                window.location.href = 'forum.html';
            } else {
                mostrarMensagem('Email ou senha incorretos', 'erro');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            mostrarMensagem('Erro de conexão', 'erro');
        }
    }
}

// Formulário de nova postagem
function handleNovaPostagem() {
    const conteudo = prompt('Digite o conteúdo da postagem:');
    const usuarioId = prompt('Digite o ID do usuário (use 1 para teste):');
    
    if (conteudo && usuarioId) {
        criarPostagem(conteudo, parseInt(usuarioId));
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script simples carregado!');
    
    // Se estiver na página do fórum, carregar postagens
    if (window.location.pathname.includes('forum')) {
        listarPostagens();
    }
    
    // Adicionar botão de nova postagem se não existir
    const container = document.querySelector('.content');
    if (container && !document.querySelector('.btn-nova-postagem')) {
        const btn = document.createElement('button');
        btn.textContent = '✍️ Nova Postagem';
        btn.className = 'btn btn-primary btn-nova-postagem';
        btn.onclick = handleNovaPostagem;
        btn.style.marginBottom = '20px';
        container.insertBefore(btn, container.firstChild);
    }
    
    // Configurar formulário de cadastro se existir
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', handleCadastro);
    }
    
    // Configurar formulário de login se existir
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Funções globais para teste no console
window.testeAPI = {
    listarUsuarios,
    criarUsuario,
    buscarUsuario,
    atualizarUsuario,
    deletarUsuario,
    listarPostagens,
    criarPostagem,
    buscarPostagem,
    atualizarPostagem,
    deletarPostagem
};

console.log('📝 Para testar a API no console, use: testeAPI.listarUsuarios(), testeAPI.criarUsuario("Nome", "email@test.com", "123"), etc.');
