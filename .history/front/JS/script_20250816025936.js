
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

        if (response.ok) {
            const data = await response.json();
            mostrarMensagem('Postagem deletada com sucesso!', 'sucesso');
            listarPostagens(); // Recarregar postagens
        } else if (response.status === 404) {
            mostrarMensagem('Postagem não encontrada (pode já ter sido deletada)', 'erro');
            listarPostagens(); // Recarregar para atualizar a lista
        } else {
            // Tentar ler a resposta como JSON, senão usar status
            try {
                const data = await response.json();
                mostrarMensagem(data.error || 'Erro ao deletar postagem', 'erro');
            } catch {
                mostrarMensagem(`Erro ${response.status}: ${response.statusText}`, 'erro');
            }
        }
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
        mostrarMensagem('Erro de conexão com o servidor', 'erro');
    }
}

// ================================
// FUNÇÕES DE INTERFACE
// ================================

// Exibir postagens na tela
function exibirPostagens(postagens) {
    const container = document.querySelector('.content') || document.querySelector('main');
    if (!container) return;

    // Remover loading
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();

    // Limpar container mantendo título e botão
    const titulo = container.querySelector('h2');
    const btnNova = container.querySelector('.btn-nova-postagem');
    container.innerHTML = '';
    if (titulo) container.appendChild(titulo);
    if (btnNova) container.appendChild(btnNova);

    if (postagens.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.innerHTML = `
            <p style="text-align: center; color: #666; margin: 40px 0;">
                Nenhuma postagem encontrada.<br>
                <small>Seja o primeiro a compartilhar algo!</small>
            </p>
        `;
        container.appendChild(mensagem);
        return;
    }

    postagens.forEach(post => {
        // Emoji da categoria
        const categoriaEmojis = {
            'Geral': '📝',
            'Dúvida': '❓',
            'Dica': '💡',
            'Negócio': '💼',
            'Marketing': '📈',
            'Networking': '🤝'
        };
        
        const categoriaEmoji = categoriaEmojis[post.categoria] || '📝';
        
        // Formatação das tags
        let tagsHTML = '';
        if (post.tags && post.tags.trim()) {
            const tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsHTML = `<div class="post-tags">${tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`;
        }
        
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <strong>${post.usuario_nome || 'Usuário'}</strong>
                    <span class="categoria-badge" style="background: #D90429; color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.8em;">
                        ${categoriaEmoji} ${post.categoria || 'Geral'}
                    </span>
                </div>
                <div class="post-date">${new Date(post.criado_em || post.created_at).toLocaleString()}</div>
            </div>
            <p>${post.conteudo}</p>
            ${tagsHTML}
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
                        <p>${comentario.texto}</p>
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
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-top: 0; color: #D90429;">✍️ Nova Postagem</h3>
                <form id="nova-postagem-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Conteúdo:</label>
                        <textarea id="postagem-conteudo" placeholder="O que você está pensando?" style="width: 100%; height: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 8px; resize: vertical;" required></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Categoria:</label>
                        <select id="postagem-categoria" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                            <option value="Geral">📝 Geral</option>
                            <option value="Dúvida">❓ Dúvida</option>
                            <option value="Dica">💡 Dica</option>
                            <option value="Negócio">💼 Negócio</option>
                            <option value="Marketing">📈 Marketing</option>
                            <option value="Networking">🤝 Networking</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tags (opcional):</label>
                        <input type="text" id="postagem-tags" placeholder="Separe as tags por vírgula (ex: startup, dicas, marketing)" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="this.closest('div').parentElement.remove()" style="padding: 10px 20px; border: 2px solid #ddd; background: white; border-radius: 20px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 10px 20px; background: linear-gradient(135deg, #D90429 0%, #ff6b8a 100%); color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600;">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('nova-postagem-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const conteudo = document.getElementById('postagem-conteudo').value.trim();
        const categoria = document.getElementById('postagem-categoria').value;
        const tags = document.getElementById('postagem-tags').value.trim();
        
        if (conteudo) {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{"id": 1}');
            
            try {
                const response = await fetch(`${API_BASE_URL}/postagens`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        conteudo,
                        usuario_id: usuarioLogado.id,
                        categoria,
                        tags
                    })
                });

                if (response.ok) {
                    mostrarMensagem('Postagem criada com sucesso!', 'sucesso');
                    modal.remove();
                    listarPostagens(); // Recarregar postagens
                } else {
                    mostrarMensagem('Erro ao criar postagem', 'erro');
                }
            } catch (error) {
                console.error('Erro ao criar postagem:', error);
                mostrarMensagem('Erro de conexão', 'erro');
            }
        }
    });
    
    // Focar no textarea
    setTimeout(() => document.getElementById('postagem-conteudo').focus(), 100);
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
