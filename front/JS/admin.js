// Admin.js - Painel Administrativo
// API_BASE_URL já está declarado no script.js

console.log('🔧 admin.js carregado!');

// Verificar se é admin ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded disparado no admin.js');
    const usuario = verificarUsuarioLogado();
    console.log('👤 Usuário verificado:', usuario);
    
    if (!usuario) {
        alert('Você precisa estar logado para acessar esta página');
        window.location.href = 'login.html';
        return;
    }
    
    if (usuario.tipo !== 'admin') {
        alert('⛔ Acesso negado! Apenas administradores podem acessar esta página.');
        window.location.href = 'feed.html';
        return;
    }
    
    console.log('✅ Admin autenticado:', usuario);
    console.log('📥 Iniciando carregamento do dashboard...');
    carregarDashboard();
});

// Carregar todo o dashboard
async function carregarDashboard() {
    await carregarEstatisticas();
    await carregarUsuarios();
    await carregarPostagens();
}

// Carregar estatísticas gerais
async function carregarEstatisticas() {
    try {
        console.log('📊 Carregando estatísticas...');
        const [usuarios, postagens, comentarios, curtidas, conversas] = await Promise.all([
            fetch(`${API_BASE_URL}/usuarios`).then(r => r.json()),
            fetch(`${API_BASE_URL}/postagens`).then(r => r.json()),
            fetch(`${API_BASE_URL}/comentarios`).then(r => r.json()),
            fetch(`${API_BASE_URL}/curtidas`).then(r => r.json()),
            fetch(`${API_BASE_URL}/conversas`).then(r => r.json()).catch(() => [])
        ]);
        
        console.log('✅ Dados carregados:', {
            usuarios: usuarios.length,
            postagens: postagens.length,
            comentarios: comentarios.length,
            curtidas: curtidas.length,
            conversas: conversas.length || 0
        });
        
        document.getElementById('stat-users').textContent = usuarios.length;
        document.getElementById('stat-admins').textContent = usuarios.filter(u => u.tipo === 'admin').length;
        document.getElementById('stat-posts').textContent = postagens.length;
        document.getElementById('stat-comments').textContent = comentarios.length;
        document.getElementById('stat-likes').textContent = curtidas.length;
        document.getElementById('stat-conversations').textContent = conversas.length || 0;
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
    }
}

// Carregar lista de usuários
async function carregarUsuarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`);
        const usuarios = await response.json();
        
        renderizarUsuarios(usuarios);
        
        // Configurar filtros
        document.getElementById('filter-users').addEventListener('input', () => filtrarUsuarios(usuarios));
        document.getElementById('filter-type').addEventListener('change', () => filtrarUsuarios(usuarios));
        document.getElementById('filter-status').addEventListener('change', () => filtrarUsuarios(usuarios));
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('users-list').innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar usuários</td></tr>';
    }
}

// Renderizar tabela de usuários
function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('users-list');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(user => {
        const fotoPerfil = user.foto_perfil 
            ? `<img src="${user.foto_perfil}" class="user-avatar" alt="${user.nome}">` 
            : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #ddd; display: flex; align-items: center; justify-content: center; font-weight: bold;">${user.nome[0].toUpperCase()}</div>`;
        
        const badgeTipo = user.tipo === 'admin' 
            ? '<span class="badge badge-admin">ADMIN</span>' 
            : '<span class="badge badge-user">Usuário</span>';
        
        const statusBanido = user.banido 
            ? '<span class="badge badge-banned" style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">BANIDO</span>'
            : '';
        
        const acoes = gerarAcoesUsuario(user);
        
        return `
            <tr>
                <td>${fotoPerfil}</td>
                <td><strong>${user.nome}</strong> ${statusBanido}</td>
                <td>${user.email}</td>
                <td>${badgeTipo}</td>
                <td>${new Date(user.criado_em).toLocaleDateString('pt-BR')}</td>
                <td>${acoes}</td>
            </tr>
        `;
    }).join('');
}

// Gerar botões de ação para usuário
function gerarAcoesUsuario(user) {
    const usuarioLogado = verificarUsuarioLogado();
    
    // Não pode modificar a si mesmo
    if (user.id === usuarioLogado.id) {
        return '<em style="color: #999;">Você</em>';
    }
    
    const botoes = [];
    
    // Botão de promover/rebaixar
    if (user.tipo === 'usuario') {
        botoes.push(`<button class="btn-admin btn-promote" onclick="promoverUsuario(${user.id}, '${user.nome}')">Promover a Admin</button>`);
    } else {
        botoes.push(`<button class="btn-admin btn-demote" onclick="rebaixarUsuario(${user.id}, '${user.nome}')">Rebaixar</button>`);
    }
    
    // Botão de banir/desbanir
    if (user.banido) {
        botoes.push(`<button class="btn-admin btn-unban" onclick="desbanirUsuario(${user.id}, '${user.nome}')" style="background: #27ae60;">Desbanir</button>`);
    } else {
        botoes.push(`<button class="btn-admin btn-ban" onclick="banirUsuario(${user.id}, '${user.nome}')" style="background: #e67e22;">Banir</button>`);
    }
    
    // Botão de deletar
    botoes.push(`<button class="btn-admin btn-delete" onclick="deletarUsuario(${user.id}, '${user.nome}')">Deletar</button>`);
    
    return botoes.join(' ');
}

// Filtrar usuários
function filtrarUsuarios(todosUsuarios) {
    const busca = document.getElementById('filter-users').value.toLowerCase();
    const tipo = document.getElementById('filter-type').value;
    const status = document.getElementById('filter-status').value;
    
    const filtrados = todosUsuarios.filter(user => {
        const matchBusca = user.nome.toLowerCase().includes(busca) || user.email.toLowerCase().includes(busca);
        const matchTipo = !tipo || user.tipo === tipo;
        const matchStatus = !status || (status === 'banido' ? user.banido : !user.banido);
        return matchBusca && matchTipo && matchStatus;
    });
    
    renderizarUsuarios(filtrados);
}

// Promover usuário a admin
async function promoverUsuario(userId, nome) {
    if (!confirm(`Tem certeza que deseja promover "${nome}" a ADMINISTRADOR?\n\nEle terá acesso total ao sistema!`)) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/tipo?usuarioId=${usuarioLogado.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'admin', usuarioId: usuarioLogado.id })
        });
        
        if (response.ok) {
            alert(`✅ ${nome} foi promovido a ADMINISTRADOR!`);
            carregarDashboard();
        } else {
            const data = await response.json();
            alert('❌ Erro: ' + (data.erro || data.error || 'Não foi possível promover o usuário'));
        }
    } catch (error) {
        console.error('Erro ao promover usuário:', error);
        alert('❌ Erro ao promover usuário');
    }
}

// Rebaixar admin a usuário normal
async function rebaixarUsuario(userId, nome) {
    if (!confirm(`Tem certeza que deseja rebaixar "${nome}" a usuário normal?\n\nEle perderá todos os privilégios de admin!`)) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/tipo?usuarioId=${usuarioLogado.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'usuario', usuarioId: usuarioLogado.id })
        });
        
        if (response.ok) {
            alert(`✅ ${nome} foi rebaixado a usuário normal`);
            carregarDashboard();
        } else {
            const data = await response.json();
            alert('❌ Erro: ' + (data.erro || data.error || 'Não foi possível rebaixar o usuário'));
        }
    } catch (error) {
        console.error('Erro ao rebaixar usuário:', error);
        alert('❌ Erro ao rebaixar usuário');
    }
}

// Deletar usuário
async function deletarUsuario(userId, nome) {
    if (!confirm(`⚠️ ATENÇÃO: Tem certeza que deseja DELETAR o usuário "${nome}"?\n\nEsta ação é IRREVERSÍVEL e removerá:\n- O usuário\n- Todas as suas postagens\n- Todos os seus comentários\n- Todas as suas curtidas`)) {
        return;
    }
    
    if (!confirm(`Confirme novamente: DELETAR "${nome}" permanentemente?`)) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}?usuarioId=${usuarioLogado.id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert(`✅ Usuário "${nome}" foi deletado com sucesso`);
            carregarDashboard();
        } else {
            const data = await response.json();
            alert('❌ Erro: ' + (data.erro || data.error || 'Não foi possível deletar o usuário'));
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('❌ Erro ao deletar usuário');
    }
}

// Banir usuário
async function banirUsuario(userId, nome) {
    if (!confirm(`Tem certeza que deseja BANIR o usuário "${nome}"?\n\nO usuário não poderá mais fazer login até ser desbanido.`)) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/banir?usuarioId=${usuarioLogado.id}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert(`✅ Usuário "${nome}" foi banido com sucesso`);
            carregarDashboard();
        } else {
            const data = await response.json();
            alert('❌ Erro: ' + (data.erro || data.error || 'Não foi possível banir o usuário'));
        }
    } catch (error) {
        console.error('Erro ao banir usuário:', error);
        alert('❌ Erro ao banir usuário');
    }
}

// Desbanir usuário
async function desbanirUsuario(userId, nome) {
    if (!confirm(`Tem certeza que deseja DESBANIR o usuário "${nome}"?\n\nO usuário poderá fazer login novamente.`)) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/desbanir?usuarioId=${usuarioLogado.id}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            alert(`✅ Usuário "${nome}" foi desbanido com sucesso`);
            carregarDashboard();
        } else {
            const data = await response.json();
            alert('❌ Erro: ' + (data.erro || data.error || 'Não foi possível desbanir o usuário'));
        }
    } catch (error) {
        console.error('Erro ao desbanir usuário:', error);
        alert('❌ Erro ao desbanir usuário');
    }
}

// Carregar lista de postagens
async function carregarPostagens() {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`);
        const postagens = await response.json();
        
        renderizarPostagens(postagens);
        
        // Configurar filtros
        document.getElementById('filter-posts').addEventListener('input', () => filtrarPostagens(postagens));
        document.getElementById('filter-category').addEventListener('change', () => filtrarPostagens(postagens));
        
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        document.getElementById('posts-list').innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao carregar postagens</td></tr>';
    }
}

// Renderizar tabela de postagens
function renderizarPostagens(postagens) {
    const tbody = document.getElementById('posts-list');
    
    if (postagens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhuma postagem encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = postagens.map(post => {
        const conteudoPreview = post.conteudo.length > 100 
            ? post.conteudo.substring(0, 100) + '...' 
            : post.conteudo;
        
        return `
            <tr>
                <td><strong>#${post.id}</strong></td>
                <td>${post.usuario_nome || 'Desconhecido'}</td>
                <td>${conteudoPreview}</td>
                <td><span class="badge" style="background: #D90429; color: white;">${post.categoria || 'Geral'}</span></td>
                <td>${post.curtidas || 0}</td>
                <td>${post.comentarios || 0}</td>
                <td>${new Date(post.criado_em).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn-admin btn-ban" onclick="deletarPostagemAdmin(${post.id})">Deletar</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar postagens
function filtrarPostagens(todasPostagens) {
    const busca = document.getElementById('filter-posts').value.toLowerCase();
    const categoria = document.getElementById('filter-category').value;
    
    const filtradas = todasPostagens.filter(post => {
        const matchBusca = post.conteudo.toLowerCase().includes(busca) || (post.usuario_nome && post.usuario_nome.toLowerCase().includes(busca));
        const matchCategoria = !categoria || post.categoria === categoria;
        return matchBusca && matchCategoria;
    });
    
    renderizarPostagens(filtradas);
}

// Deletar postagem (admin)
async function deletarPostagemAdmin(postId) {
    if (!confirm('Tem certeza que deseja deletar esta postagem?')) {
        return;
    }
    
    const usuarioLogado = verificarUsuarioLogado();
    
    try {
        const response = await fetch(`${API_BASE_URL}/postagens/${postId}?usuarioId=${usuarioLogado.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Postagem deletada com sucesso!');
            carregarDashboard();
        } else {
            alert('❌ Erro: ' + (data.error || 'Não foi possível deletar a postagem'));
        }
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
        alert('❌ Erro ao deletar postagem');
    }
}
