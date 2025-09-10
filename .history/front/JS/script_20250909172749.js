
const API_BASE_URL = 'http://127.0.0.1:3002/api';


// FUNÇÕES UTILITÁRIAS

function mostrarMensagem(texto, tipo = 'info') {
    alert(texto);
}

function limparFormulario(formId) {
    document.getElementById(formId)?.reset();
}

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
    mostrarMensagem('Logout realizado com sucesso!', 'sucesso');
    window.location.href = 'login.html';
}


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
async function criarUsuario(nome, email, senha, bio = '', foto_perfil = '') {
    try {
        console.log(' Tentando criar usuário:', { nome, email });
        console.log(' URL da API:', `${API_BASE_URL}/usuarios`);
        
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, bio, foto_perfil })
        });

        console.log(' Response status:', response.status);
        const data = await response.json();
        console.log(' Response data:', data);
        
        if (response.ok) {
            console.log('✅ Resposta OK da API, retornando usuário...');
            // Não mostrar mensagem aqui, será mostrada no handleCadastro
            return data.usuario;
        } else {
            console.log('❌ Resposta com erro da API:', response.status, data);
            mostrarMensagem(data.error || 'Erro ao criar usuário', 'erro');
            return null;
        }
    } catch (error) {
        console.error(' Erro detalhado ao criar usuário:', error);
        console.error(' Error name:', error.name);
        console.error(' Error message:', error.message);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            mostrarMensagem('Erro de conexão: Servidor não disponível. Verifique se o servidor está rodando na porta 3002.', 'erro');
        } else {
            mostrarMensagem('Erro de conexão: ' + error.message, 'erro');
        }
        return null;
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
async function atualizarUsuario(id, nome, email, bio = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, bio })
        });

        if (response.ok) {
            const data = await response.json();
            mostrarMensagem('Usuário atualizado com sucesso!', 'sucesso');
            return data.usuario;
        } else {
            const data = await response.json();
            mostrarMensagem(data.error || 'Erro ao atualizar usuário', 'erro');
            return null;
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        mostrarMensagem('Erro de conexão', 'erro');
        return null;
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

// CRUD POSTAGENS


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
    // Verificar se o usuário está logado
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        mostrarMensagem('Você precisa estar logado para deletar uma postagem', 'erro');
        return;
    }
    
    // Verificar se o usuário é o dono da postagem
    try {
        const postResponse = await fetch(`${API_BASE_URL}/postagens/${id}`);
        if (!postResponse.ok) {
            mostrarMensagem('Não foi possível verificar a postagem', 'erro');
            return;
        }
        
        const postagem = await postResponse.json();
        
        // Verificar se o usuário atual é o dono da postagem
        if (postagem.usuario_id !== usuarioLogado.id) {
            mostrarMensagem('Você só pode deletar suas próprias postagens', 'erro');
            return;
        }
        
        // Confirmar a exclusão
        if (!confirm('Tem certeza que deseja deletar esta postagem?')) return;
        
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

// Função para determinar quais botões de ação mostrar para cada postagem
function getPostActionButtons(post) {
    // Verificar se o usuário está logado
    const usuarioLogado = verificarUsuarioLogado();
    
    // Se não estiver logado ou não for o dono da postagem, não mostra botões de edição/exclusão
    if (!usuarioLogado || post.usuario_id !== usuarioLogado.id) {
        return '';
    }
    
    // Se for o dono da postagem, mostra botões de edição e exclusão
    return `
        <button onclick="editarPostagem(${post.id}, '${post.conteudo.replace(/'/g, "\\'")}'))" class="btn-small">Editar</button>
        <button onclick="deletarPostagem(${post.id})" class="btn-small">Deletar</button>
    `;
}

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
        
        // Imagem do perfil do usuário
        const perfilImagemHTML = post.foto_perfil 
            ? `<img src="${post.foto_perfil}" alt="Foto do perfil" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #C0C0C0;">` 
            : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #C0C0C0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">${(post.usuario_nome || 'U')[0].toUpperCase()}</div>`;
        
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${perfilImagemHTML}
                    <div>
                        <strong>${post.usuario_nome || 'Usuário'}</strong>
                        <span class="categoria-badge" style="background: #D90429; color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 8px;">
                            ${categoriaEmoji} ${post.categoria || 'Geral'}
                        </span>
                    </div>
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
                ${getPostActionButtons(post)}
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
    // Verificar se o usuário está logado
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        mostrarMensagem('Você precisa estar logado para curtir uma postagem', 'erro');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/curtidas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                postagem_id: postId,
                usuario_id: usuarioLogado.id
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
                // Imagem do perfil do autor do comentário
                const autorImagemHTML = comentario.autor_foto 
                    ? `<img src="${comentario.autor_foto}" alt="Foto do perfil" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #C0C0C0;">` 
                    : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #C0C0C0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${(comentario.autor_nome || 'U')[0].toUpperCase()}</div>`;
                
                html += `
                    <div class="comment" style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 15px;">
                        ${autorImagemHTML}
                        <div style="flex: 1;">
                            <strong>${comentario.autor_nome || 'Usuário'}</strong>
                            <p style="margin: 5px 0;">${comentario.texto}</p>
                            <small style="color: #666;">${new Date(comentario.criado_em).toLocaleString()}</small>
                        </div>
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
    
    // Verificar se o usuário está logado
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        mostrarMensagem('Você precisa estar logado para comentar', 'erro');
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
                usuario_id: usuarioLogado.id,
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

// Verificar usuario logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const usuario = verificarUsuarioLogado();
    if (usuario) {
        console.log('Usuário logado encontrado:', usuario);
        
        // Atualizar nome do usuário no header se existir
        const userNameDisplay = document.getElementById('user-name-display');
        if (userNameDisplay) {
            userNameDisplay.textContent = `Olá, ${usuario.nome}!`;
        }
    } else {
        console.log('Nenhum usuário logado encontrado');
        
        // Se não há usuário logado e estamos em uma página que requer login
        const currentPage = window.location.pathname;
        if (currentPage.includes('forum.html') || currentPage.includes('perfil.html')) {
            mostrarMensagem('Você precisa estar logado para acessar esta página', 'erro');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
});

// Formulário de cadastro (se existir)
async function handleCadastro(event) {
    event.preventDefault();
    console.log('🚀 Iniciando processo de cadastro...');
    
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const bio = document.getElementById('bio')?.value || '';
    
    console.log('📋 Dados do formulário:', { nome, email, senha: '***', bio });
    
    if (nome && email && senha) {
        console.log('✅ Validação inicial passou, criando usuário...');
        
        try {
            // Primeiro criar o usuário sem foto
            const usuario = await criarUsuario(nome, email, senha, bio, '');
            console.log('👤 Resultado da criação do usuário:', usuario);
            
            if (usuario && usuario.id) {
                console.log('✅ Usuário criado com sucesso, ID:', usuario.id);
                
                // Se há uma foto selecionada, fazer upload dela
                const fotoPreview = document.querySelector('#foto-preview img');
                if (fotoPreview && fotoPreview.src && !fotoPreview.src.includes('placeholder')) {
                    console.log('📷 Foto encontrada, fazendo upload...');
                    try {
                        const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id}/foto-base64`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ foto_base64: fotoPreview.src })
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            usuario.foto_perfil = data.foto_url;
                            console.log('📷 Upload da foto realizado:', data.foto_url);
                        } else {
                            console.log('❌ Erro no upload da foto:', response.status);
                        }
                    } catch (error) {
                        console.error('❌ Erro ao fazer upload da foto:', error);
                        // Não bloquear o cadastro por erro de foto
                    }
                } else {
                    console.log('📷 Nenhuma foto selecionada');
                }
                
                // Salvar o usuário atualizado no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                console.log('💾 Usuário salvo no localStorage:', usuario);
                
                // Limpar formulário
                limparFormulario('cadastroForm');
                
                // Mostrar mensagem de sucesso
                mostrarMensagem('Cadastro realizado com sucesso! Redirecionando...', 'sucesso');
                console.log('✅ Mostrando mensagem de sucesso, redirecionando em 1.5s...');
                
                // Forçar redirecionamento imediato para teste
                console.log('🔄 FORÇANDO REDIRECIONAMENTO IMEDIATO...');
                
                // Tentar redirecionamento imediato primeiro
                setTimeout(() => {
                    console.log('� Executando redirecionamento...');
                    console.log('📍 URL atual antes do redirecionamento:', window.location.href);
                    
                    try {
                        window.location.href = 'forum.html';
                        console.log('✅ Redirecionamento executado');
                    } catch (redirectError) {
                        console.error('❌ Erro no redirecionamento:', redirectError);
                        // Fallback
                        window.location.replace('forum.html');
                    }
                }, 100); // Reduzir tempo para 100ms
                
            } else {
                console.error('❌ Usuário retornado é inválido:', usuario);
                mostrarMensagem('Erro ao criar usuário. Resposta inválida do servidor.', 'erro');
            }
        } catch (error) {
            console.error('❌ Erro geral no processo de cadastro:', error);
            mostrarMensagem('Erro inesperado no cadastro: ' + error.message, 'erro');
        }
    } else {
        console.log('❌ Validação falhou - campos obrigatórios não preenchidos');
        console.log('Campos:', { nome: !!nome, email: !!email, senha: !!senha });
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios', 'erro');
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
            const usuarioLogado = verificarUsuarioLogado();
            if (!usuarioLogado) {
                mostrarMensagem('Você precisa estar logado para fazer uma postagem', 'erro');
                return;
            }
            
            try {
                console.log('📝 Enviando postagem:', { conteudo, usuario_id: usuarioLogado.id, categoria, tags });
                
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
                    const result = await response.json();
                    console.log('✅ Postagem criada:', result);
                    mostrarMensagem('Postagem criada com sucesso!', 'sucesso');
                    modal.remove();
                    listarPostagens(); // Recarregar postagens
                } else {
                    const errorData = await response.json();
                    console.error('❌ Erro do servidor:', errorData);
                    mostrarMensagem(`Erro ao criar postagem: ${errorData.error || 'Erro desconhecido'}`, 'erro');
                }
            } catch (error) {
                console.error('❌ Erro de conexão:', error);
                mostrarMensagem('Erro de conexão com o servidor', 'erro');
            }
        }
    });
    
    // Focar no textarea
    setTimeout(() => document.getElementById('postagem-conteudo').focus(), 100);
}

// Adicionar configuração dos formulários ao DOMContentLoaded existente
document.addEventListener('DOMContentLoaded', function() {
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
        console.log('📝 Configurando formulário de cadastro...');
        cadastroForm.addEventListener('submit', handleCadastro);
    }
    
    // Configurar formulário de login se existir
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('🔐 Configurando formulário de login...');
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

// Versão corrigida da função de cadastro que funciona
async function handleCadastroCorrigido(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    const bio = document.getElementById('bio')?.value || '';
    
    if (!nome || !email || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios', 'erro');
        return;
    }
    
    try {
        const usuario = await criarUsuario(nome, email, senha, bio, '');
        
        if (usuario && usuario.id) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            limparFormulario('cadastroForm');
            // Redirecionamento imediato sem alert
            window.location.href = 'forum.html';
        } else {
            mostrarMensagem('Erro ao criar usuário', 'erro');
        }
    } catch (error) {
        mostrarMensagem('Erro no cadastro: ' + error.message, 'erro');
    }
}

// Substituir a função problemática quando a página carregar
window.addEventListener('load', function() {
    window.handleCadastro = handleCadastroCorrigido;
});
