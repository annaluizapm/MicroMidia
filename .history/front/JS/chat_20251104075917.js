// ===== CONFIGURAÇÃO =====
const API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:3002/api';

// ===== ESTADO GLOBAL =====
let conversaAtual = null;
let usuarioLogado = null;
let conversas = [];
let usuarios = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se usuário está logado
    usuarioLogado = verificarUsuarioLogado();
    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar event listeners
    inicializarEventListeners();
    
    // Carregar conversas
    carregarConversas();
});

// ===== EVENT LISTENERS =====
function inicializarEventListeners() {
    // Botão nova conversa
    document.getElementById('btn-nova-conversa')?.addEventListener('click', abrirModalNovaConversa);
    
    // Fechar modal
    document.getElementById('modal-close')?.addEventListener('click', fecharModal);
    
    // Clique fora do modal
    document.getElementById('modal-nova-conversa')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-nova-conversa') {
            fecharModal();
        }
    });
    
    // Form de mensagem
    document.getElementById('form-mensagem')?.addEventListener('submit', enviarMensagem);
    
    // Auto-resize do textarea
    const textarea = document.getElementById('mensagem-texto');
    if (textarea) {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
        
        // Enviar com Enter (Shift+Enter para nova linha)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('form-mensagem').dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Busca de conversas
    document.getElementById('search-conversas')?.addEventListener('input', (e) => {
        filtrarConversas(e.target.value);
    });
    
    // Busca de usuários no modal
    document.getElementById('search-usuarios')?.addEventListener('input', (e) => {
        filtrarUsuarios(e.target.value);
    });
}

// ===== CARREGAR CONVERSAS =====
async function carregarConversas() {
    try {
        // Por enquanto, criar conversas mock (implementar endpoint depois)
        conversas = [];
        
        const listaEl = document.getElementById('conversas-lista');
        if (conversas.length === 0) {
            listaEl.innerHTML = `
                <div class="conversa-placeholder">
                    <p>Nenhuma conversa ainda</p>
                    <small>Clique em "Nova Conversa" para começar</small>
                </div>
            `;
        } else {
            renderizarConversas();
        }
    } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        mostrarMensagem('Erro ao carregar conversas', 'erro');
    }
}

// ===== RENDERIZAR CONVERSAS =====
function renderizarConversas(filtro = '') {
    const listaEl = document.getElementById('conversas-lista');
    const conversasFiltradas = conversas.filter(c => 
        c.nome.toLowerCase().includes(filtro.toLowerCase())
    );
    
    if (conversasFiltradas.length === 0) {
        listaEl.innerHTML = `
            <div class="conversa-placeholder">
                <p>Nenhuma conversa encontrada</p>
            </div>
        `;
        return;
    }
    
    listaEl.innerHTML = conversasFiltradas.map(conversa => `
        <div class="conversa-item ${conversa.id === conversaAtual?.id ? 'active' : ''}" 
             onclick="selecionarConversa(${conversa.id})">
            <div class="conversa-avatar">
                ${conversa.foto ? `<img src="${conversa.foto}" alt="${conversa.nome}">` : '👤'}
            </div>
            <div class="conversa-conteudo">
                <div class="conversa-nome-hora">
                    <h4>${conversa.nome}</h4>
                    <span class="conversa-hora">${formatarHora(conversa.ultima_mensagem_hora)}</span>
                </div>
                <p class="conversa-preview">${conversa.ultima_mensagem || 'Sem mensagens'}</p>
            </div>
            ${conversa.nao_lidas > 0 ? `<div class="conversa-badge">${conversa.nao_lidas}</div>` : ''}
        </div>
    `).join('');
}

// ===== SELECIONAR CONVERSA =====
async function selecionarConversa(conversaId) {
    conversaAtual = conversas.find(c => c.id === conversaId);
    if (!conversaAtual) return;
    
    // Atualizar UI
    renderizarConversas();
    
    // Mostrar área de mensagens
    document.querySelector('.mensagens-placeholder')?.style.setProperty('display', 'none');
    document.getElementById('conversa-header')?.style.setProperty('display', 'flex');
    document.getElementById('mensagens-lista')?.style.setProperty('display', 'block');
    document.getElementById('mensagem-input-container')?.style.setProperty('display', 'block');
    
    // Atualizar cabeçalho da conversa
    document.getElementById('conversa-nome').textContent = conversaAtual.nome;
    const avatarEl = document.getElementById('conversa-avatar');
    avatarEl.innerHTML = conversaAtual.foto ? 
        `<img src="${conversaAtual.foto}" alt="${conversaAtual.nome}">` : 
        '👤';
    
    // Carregar mensagens
    await carregarMensagens(conversaId);
}

// ===== CARREGAR MENSAGENS =====
async function carregarMensagens(conversaId) {
    try {
        // Mock de mensagens (implementar endpoint depois)
        const mensagens = [];
        
        renderizarMensagens(mensagens);
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        mostrarMensagem('Erro ao carregar mensagens', 'erro');
    }
}

// ===== RENDERIZAR MENSAGENS =====
function renderizarMensagens(mensagens) {
    const listaEl = document.getElementById('mensagens-lista');
    
    if (mensagens.length === 0) {
        listaEl.innerHTML = `
            <div class="conversa-placeholder">
                <p>Nenhuma mensagem ainda</p>
                <small>Envie a primeira mensagem para iniciar a conversa</small>
            </div>
        `;
        return;
    }
    
    listaEl.innerHTML = mensagens.map(msg => `
        <div class="mensagem ${msg.remetente_id === usuarioLogado.id ? 'enviada' : 'recebida'}">
            <div class="mensagem-conteudo">
                <div class="mensagem-balao">
                    <p class="mensagem-texto">${escapeHtml(msg.conteudo)}</p>
                </div>
                <div class="mensagem-info">
                    ${msg.remetente_id !== usuarioLogado.id ? `<span class="mensagem-autor">${msg.remetente_nome}</span>` : ''}
                    <span class="mensagem-hora">${formatarHora(msg.criado_em)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll para o final
    listaEl.scrollTop = listaEl.scrollHeight;
}

// ===== ENVIAR MENSAGEM =====
async function enviarMensagem(event) {
    event.preventDefault();
    
    const textarea = document.getElementById('mensagem-texto');
    const conteudo = textarea.value.trim();
    
    if (!conteudo || !conversaAtual) return;
    
    try {
        // Por enquanto, adicionar localmente (implementar endpoint depois)
        const novaMensagem = {
            id: Date.now(),
            conversa_id: conversaAtual.id,
            remetente_id: usuarioLogado.id,
            remetente_nome: usuarioLogado.nome,
            conteudo: conteudo,
            criado_em: new Date().toISOString(),
            lida: false
        };
        
        // Adicionar à lista
        const mensagensAtuais = []; // buscar do estado
        mensagensAtuais.push(novaMensagem);
        renderizarMensagens(mensagensAtuais);
        
        // Atualizar conversa
        conversaAtual.ultima_mensagem = conteudo;
        conversaAtual.ultima_mensagem_hora = new Date().toISOString();
        renderizarConversas();
        
        // Limpar textarea
        textarea.value = '';
        textarea.style.height = 'auto';
        textarea.focus();
        
        console.log('✅ Mensagem enviada:', novaMensagem);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        mostrarMensagem('Erro ao enviar mensagem', 'erro');
    }
}

// ===== MODAL NOVA CONVERSA =====
async function abrirModalNovaConversa() {
    const modal = document.getElementById('modal-nova-conversa');
    modal.classList.add('active');
    
    // Carregar usuários
    await carregarUsuarios();
}

function fecharModal() {
    const modal = document.getElementById('modal-nova-conversa');
    modal.classList.remove('active');
}

async function carregarUsuarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        const data = await response.json();
        
        // Filtrar usuário logado
        usuarios = data.filter(u => u.id !== usuarioLogado.id);
        
        renderizarUsuarios();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('usuarios-lista').innerHTML = `
            <div class="loading">Erro ao carregar usuários</div>
        `;
    }
}

function renderizarUsuarios(filtro = '') {
    const listaEl = document.getElementById('usuarios-lista');
    const usuariosFiltrados = usuarios.filter(u => 
        u.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(filtro.toLowerCase()))
    );
    
    if (usuariosFiltrados.length === 0) {
        listaEl.innerHTML = `<div class="loading">Nenhum usuário encontrado</div>`;
        return;
    }
    
    listaEl.innerHTML = usuariosFiltrados.map(usuario => `
        <div class="usuario-item" onclick="iniciarConversa(${usuario.id})">
            <div class="usuario-avatar">
                ${usuario.foto_perfil ? `<img src="${usuario.foto_perfil}" alt="${usuario.nome}">` : '👤'}
            </div>
            <div class="usuario-info">
                <h4>${usuario.nome}</h4>
                <p>${usuario.empresa || usuario.email || ''}</p>
            </div>
        </div>
    `).join('');
}

async function iniciarConversa(usuarioId) {
    try {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) return;
        
        // Verificar se já existe conversa com esse usuário
        let conversa = conversas.find(c => c.usuario_id === usuarioId);
        
        if (!conversa) {
            // Criar nova conversa (mock - implementar endpoint depois)
            conversa = {
                id: Date.now(),
                tipo: 'privada',
                usuario_id: usuarioId,
                nome: usuario.nome,
                foto: usuario.foto_perfil,
                ultima_mensagem: '',
                ultima_mensagem_hora: new Date().toISOString(),
                nao_lidas: 0
            };
            
            conversas.unshift(conversa);
        }
        
        fecharModal();
        selecionarConversa(conversa.id);
        
    } catch (error) {
        console.error('Erro ao iniciar conversa:', error);
        mostrarMensagem('Erro ao iniciar conversa', 'erro');
    }
}

// ===== FUNÇÕES AUXILIARES =====
function filtrarConversas(filtro) {
    renderizarConversas(filtro);
}

function filtrarUsuarios(filtro) {
    renderizarUsuarios(filtro);
}

function formatarHora(dataStr) {
    if (!dataStr) return '';
    
    const data = new Date(dataStr);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
        return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (data.toDateString() === ontem.toDateString()) {
        return 'Ontem';
    } else {
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function verificarUsuarioLogado() {
    const usuarioStr = localStorage.getItem('usuarioLogado');
    if (!usuarioStr) return null;
    
    try {
        return JSON.parse(usuarioStr);
    } catch (error) {
        console.error('Erro ao parsear usuário:', error);
        return null;
    }
}

function mostrarMensagem(texto, tipo = 'info') {
    alert(texto);
}
