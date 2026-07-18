
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

// Função para verificar se o usuário é admin
function ehAdmin() {
    const usuario = verificarUsuarioLogado();
    console.log('Verificando admin:', usuario);
    console.log('Tipo do usuário:', usuario?.tipo);
    return usuario && usuario.tipo === 'admin';
}

// Função para obter botões de ação da postagem (deletar para admin ou dono)
function getPostActionButtons(post) {
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        console.log('❌ Nenhum usuário logado - não mostra botões');
        return '';
    }
    
    const ehDono = post.usuario_id === usuarioLogado.id;
    const ehAdminUser = ehAdmin();
    
    console.log('🔍 Post ID:', post.id, '| Dono:', post.usuario_nome, '| ehDono:', ehDono, '| ehAdmin:', ehAdminUser, '| Mostra botão?', (ehAdminUser || ehDono));
    
    let botoes = '';
    
    // Botão de editar - apenas para o dono
    if (ehDono) {
        botoes += `
            <button onclick="editarPostagem(${post.id}, '${post.conteudo.replace(/'/g, "\\'")}', '${post.categoria}')" class="btn-action btn-edit">
                Editar
            </button>
        `;
    }
    
    // Botão de deletar - para o dono ou admin
    if (ehAdminUser || ehDono) {
        const badgeAdmin = ehAdminUser && !ehDono ? '<span class="badge-admin-action">ADMIN</span>' : '';
        botoes += `
            <button onclick="deletarPostagem(${post.id})" class="btn-action btn-delete">
                Deletar ${badgeAdmin}
            </button>
        `;
    }
    
    if (!botoes) {
        console.log('❌ Não mostra botões');
    }
    
    return botoes;
}

// Função para deletar postagem
async function deletarPostagem(postId) {
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        mostrarMensagem('Você precisa estar logado', 'erro');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar esta postagem?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${postId}?usuarioId=${usuarioLogado.id}`, {
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
        mostrarMensagem('Erro ao deletar postagem', 'erro');
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
async function criarUsuario(nome, email, senha, bio = '', foto_perfil = '', empresa = '', segmento = '', cargo = '') {
    try {
        console.log('👤 Tentando criar usuário:', { nome, email, empresa, segmento });
        console.log('🌐 URL da API:', `${API_BASE_URL}/usuarios`);
        
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, bio, foto_perfil, empresa, segmento, cargo })
        });

        console.log('📊 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (response.ok) {
            console.log('✅ Resposta OK da API, retornando usuário...');
            return data.usuario;
        } else {
            console.log('❌ Resposta com erro da API:', response.status, data);
            throw new Error(data.error || 'Erro ao criar usuário');
        }
    } catch (error) {
        console.error('❌ Erro detalhado ao criar usuário:', error);
        throw error;
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
    const usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        mostrarMensagem('Você precisa estar logado', 'erro');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                conteudo,
                usuarioId: usuarioLogado.id 
            })
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

// FUNÇÃO deletarPostagem REMOVIDA - Duplicata que não permite admin deletar
// A versão correta está nas linhas 65-93 e permite admin deletar qualquer postagem

// ================================
// FUNÇÕES DE INTERFACE
// ================================

// Função para determinar quais botões de ação mostrar para cada postagem
// REMOVIDA FUNÇÃO DUPLICADA - Usar a função getPostActionButtons que já está definida no início do arquivo

// Exibir postagens na tela
function exibirPostagens(postagens) {
    const container = document.querySelector('.content') || document.querySelector('main');
    if (!container) return;

    // Remover loading
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();

    // Limpar container mantendo a introdução e o botão
    const pageIntro = container.querySelector('.page-intro');
    const titulo = container.querySelector('h2');
    const btnNova = container.querySelector('.btn-nova-postagem');
    container.innerHTML = '';
    if (pageIntro) {
        container.appendChild(pageIntro);
    } else if (titulo) {
        container.appendChild(titulo);
    }
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
                        ${post.usuario_tipo === 'admin' ? '<span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75em; margin-left: 5px; font-weight: 600;">👑 ADMIN</span>' : ''}
                        <span class="categoria-badge" style="background: #D90429; color: white; padding: 3px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 8px;">
                            ${post.categoria || 'Geral'}
                        </span>
                    </div>
                </div>
                <div class="post-date">${new Date(post.criado_em || post.created_at).toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
            </div>
            <p>${post.conteudo}</p>
            ${tagsHTML}
            <div class="post-actions">
                <button onclick="curtirPost(${post.id})" class="btn-like">
                    <img src="../assets/icone-like.png" alt="Curtir" style="width: 16px; height: 16px; vertical-align: middle;"> ${post.curtidas || 0} curtidas
                </button>
                <button onclick="verComentarios(${post.id})" class="btn-comment">
                    <img src="../assets/icone-comentario.png" alt="Comentar" style="width: 16px; height: 16px; vertical-align: middle;"> ${post.comentarios || 0} comentários
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
                            <small style="color: #666;">${new Date(comentario.criado_em).toLocaleString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}</small>
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
function editarPostagem(id, conteudoAtual, categoriaAtual) {
    const novoConteudo = prompt('Editar postagem:', conteudoAtual);
    if (novoConteudo === null) return; // Cancelou
    
    if (novoConteudo.trim() === '') {
        mostrarMensagem('O conteúdo não pode estar vazio', 'erro');
        return;
    }
    
    if (novoConteudo !== conteudoAtual) {
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
        if (currentPage.includes('feed.html') || currentPage.includes('perfil.html')) {
            mostrarMensagem('Você precisa estar logado para acessar esta página', 'erro');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
    
    // Se estiver na página de feed, carregar postagens
    const currentPage = window.location.pathname;
    if (currentPage.includes('feed.html')) {
        listarPostagens();
    }
});

// Formulário de cadastro (DESABILITADO - usar handleCadastroCorrigido)
async function handleCadastro_OLD(event) {
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
                        window.location.href = 'feed.html';
                        console.log('✅ Redirecionamento executado');
                    } catch (redirectError) {
                        console.error('❌ Erro no redirecionamento:', redirectError);
                        // Fallback
                        window.location.replace('feed.html');
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
            console.log('Tentando fazer login com:', email);
            
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });
            
            if (!response.ok) {
                const error = await response.json();
                mostrarMensagem(error.error || 'Email ou senha incorretos', 'erro');
                return;
            }
            
            const data = await response.json();
            
            if (data.success && data.usuario) {
                console.log('Login bem-sucedido! Usuário:', data.usuario);
                
                // Salvar usuário com TODOS os campos, incluindo 'tipo'
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                
                mostrarMensagem('Login realizado com sucesso!', 'sucesso');
                window.location.href = 'feed.html';
            } else {
                mostrarMensagem('Email ou senha incorretos', 'erro');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            mostrarMensagem('Erro de conexão com o servidor', 'erro');
        }
    }
}

// Formulário de nova postagem
function handleNovaPostagem() {
    const modal = document.createElement('div');
    modal.id = 'modal-nova-postagem';
    modal.className = 'post-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'nova-postagem-title');
    modal.innerHTML = `
        <div class="post-modal-backdrop">
            <div class="post-modal-content">
                <div class="post-modal-header">
                    <div>
                        <span class="page-kicker">Compartilhe com a comunidade</span>
                        <h3 id="nova-postagem-title">Nova postagem</h3>
                    </div>
                    <button type="button" id="btn-cancelar-postagem" class="post-modal-close" aria-label="Fechar">&times;</button>
                </div>
                <form id="nova-postagem-form">
                    <div class="modal-form-group">
                        <label for="postagem-conteudo">Conteúdo</label>
                        <textarea id="postagem-conteudo" placeholder="Compartilhe uma ideia, dúvida ou aprendizado..." required></textarea>
                    </div>
                    <div class="modal-form-row">
                    <div class="modal-form-group">
                        <label for="postagem-categoria">Categoria</label>
                        <select id="postagem-categoria">
                            <option value="Geral">Geral</option>
                            <option value="Dúvida">Dúvida</option>
                            <option value="Dica">Dica</option>
                            <option value="Negócio">Negócio</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Networking">Networking</option>
                        </select>
                    </div>
                    <div class="modal-form-group">
                        <label for="postagem-tags">Tags <span class="optional">Opcional</span></label>
                        <input type="text" id="postagem-tags" placeholder="Ex: vendas, marketing">
                    </div>
                    </div>
                    <div class="post-modal-actions">
                        <button type="button" class="btn-modal-cancel">Cancelar</button>
                        <button type="submit" class="btn-primary">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Botão cancelar
    const fecharModalPostagem = () => {
        document.getElementById('modal-nova-postagem').remove();
    };
    document.getElementById('btn-cancelar-postagem').addEventListener('click', fecharModalPostagem);
    modal.querySelector('.btn-modal-cancel').addEventListener('click', fecharModalPostagem);
    
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

// Adicionar botão de nova postagem e configurar formulários
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar botão de nova postagem se não existir
    const container = document.querySelector('.content');
    if (container && !document.querySelector('.btn-nova-postagem')) {
        const btn = document.createElement('button');
        btn.textContent = '+ Criar postagem';
        btn.className = 'btn btn-primary btn-nova-postagem';
        btn.onclick = handleNovaPostagem;
        btn.style.marginBottom = '20px';
        container.insertBefore(btn, container.firstChild);
    }
    
    // Configurar formulário de cadastro se existir
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        console.log('📝 Configurando formulário de cadastro...');
        // Usar diretamente a função corrigida
        cadastroForm.addEventListener('submit', handleCadastroCorrigido);
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
    const empresa = document.getElementById('empresa')?.value || '';
    const segmento = document.getElementById('segmento')?.value || '';
    const cargo = document.getElementById('cargo')?.value || '';
    
    if (!nome || !email || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios', 'erro');
        return;
    }
    
    try {
        // Primeiro criar o usuário
        const usuario = await criarUsuario(nome, email, senha, bio, '', empresa, segmento, cargo);
        
        if (usuario && usuario.id) {
            // Se há uma foto selecionada, fazer upload dela
            const fotoPreview = document.querySelector('#foto-preview img');
            if (fotoPreview && fotoPreview.src && !fotoPreview.src.includes('placeholder')) {
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
                    }
                } catch (error) {
                    console.error('Erro ao fazer upload da foto:', error);
                    // Não bloquear o cadastro por erro de foto
                }
            }
            
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            limparFormulario('cadastroForm');
            // Redirecionamento imediato sem alert
            window.location.href = 'feed.html';
        } else {
            mostrarMensagem('Erro ao criar usuário', 'erro');
        }
    } catch (error) {
        mostrarMensagem('Erro no cadastro: ' + error.message, 'erro');
    }
}
