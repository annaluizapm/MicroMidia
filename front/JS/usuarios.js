// usuarios.js - Gerenciamento da página de usuários

let todosUsuarios = [];
let todasPostagens = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarFiltro();
});

// Carregar todos os dados
async function carregarDados() {
    try {
        // Carregar usuários e postagens em paralelo
        const [usuariosRes, postagensRes] = await Promise.all([
            fetch(`${API_BASE_URL}/usuarios`),
            fetch(`${API_BASE_URL}/postagens`)
        ]);
        
        if (usuariosRes.ok) todosUsuarios = await usuariosRes.json();
        if (postagensRes.ok) todasPostagens = await postagensRes.json();
        
        calcularEstatisticas();
        exibirUsuarios(todosUsuarios);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('usuarios-grid').innerHTML = 
            '<div class="loading"><h3>❌ Erro ao carregar usuários</h3></div>';
    }
}

// Calcular estatísticas gerais
function calcularEstatisticas() {
    const totalUsuarios = todosUsuarios.length;
    const totalPostagens = todasPostagens.length;
    
    document.getElementById('total-usuarios').textContent = totalUsuarios;
    document.getElementById('total-postagens-geral').textContent = totalPostagens;
}

// Exibir usuários
function exibirUsuarios(usuarios) {
    const grid = document.getElementById('usuarios-grid');
    
    if (usuarios.length === 0) {
        grid.innerHTML = '<div class="loading"><h3>👤 Nenhum usuário encontrado</h3></div>';
        return;
    }
    
    const usuariosComStats = usuarios.map(usuario => {
        const postagensUsuario = todasPostagens.filter(p => p.usuario_id === usuario.id);
        const totalPostagens = postagensUsuario.length;
        const totalCurtidas = postagensUsuario.reduce((sum, p) => sum + (p.curtidas || 0), 0);
        
        return {
            ...usuario,
            totalPostagens,
            totalCurtidas,
            ultimaAtividade: postagensUsuario.length > 0 ? 
                Math.max(...postagensUsuario.map(p => new Date(p.criado_em).getTime())) : 
                new Date(usuario.criado_em).getTime()
        };
    });
    
    // Ordenar por atividade (mais ativo primeiro)
    usuariosComStats.sort((a, b) => b.ultimaAtividade - a.ultimaAtividade);
    
    grid.innerHTML = usuariosComStats.map(usuario => {
        const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?';
        
        return `
            <div class="usuario-card">
                <div class="usuario-header">
                    <div class="usuario-avatar">${inicial}</div>
                    <div class="usuario-info">
                        <h3>${usuario.nome}</h3>
                        <div class="usuario-email">${usuario.email}</div>
                    </div>
                </div>
                
                <div class="usuario-bio">
                    ${usuario.bio || 'Este usuário ainda não adicionou uma biografia.'}
                </div>
                
                <div class="usuario-stats">
                    <span>📝 ${usuario.totalPostagens} postagens</span>
                    <span>❤️ ${usuario.totalCurtidas} curtidas</span>
                    <span>📅 ${new Date(usuario.criado_em).toLocaleDateString()}</span>
                </div>
                
                <div class="usuario-actions">
                    <button class="btn-perfil" onclick="verPerfilUsuario(${usuario.id})">
                        Ver Perfil
                    </button>
                    <button class="btn-postagens" onclick="verPostagensUsuario(${usuario.id})">
                        Postagens
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Configurar filtro de busca
function configurarFiltro() {
    const filtroInput = document.getElementById('filtro-usuarios');
    let timeoutFiltro;
    
    filtroInput.addEventListener('input', () => {
        clearTimeout(timeoutFiltro);
        timeoutFiltro = setTimeout(() => {
            const termo = filtroInput.value.toLowerCase().trim();
            
            if (termo === '') {
                exibirUsuarios(todosUsuarios);
            } else {
                const usuariosFiltrados = todosUsuarios.filter(usuario =>
                    usuario.nome.toLowerCase().includes(termo) ||
                    usuario.email.toLowerCase().includes(termo) ||
                    (usuario.bio && usuario.bio.toLowerCase().includes(termo))
                );
                exibirUsuarios(usuariosFiltrados);
            }
        }, 300);
    });
}

// Ver perfil do usuário (simular - poderia abrir modal ou página específica)
function verPerfilUsuario(userId) {
    const usuario = todosUsuarios.find(u => u.id === userId);
    if (usuario) {
        alert(`Perfil de ${usuario.nome}\n\nEmail: ${usuario.email}\nBio: ${usuario.bio || 'Sem biografia'}\n\n(Esta funcionalidade pode ser expandida para mostrar um modal ou página dedicada)`);
    }
}

// Ver postagens do usuário
function verPostagensUsuario(userId) {
    const usuario = todosUsuarios.find(u => u.id === userId);
    const postagensUsuario = todasPostagens.filter(p => p.usuario_id === userId);
    
    if (postagensUsuario.length === 0) {
        alert(`${usuario.nome} ainda não fez nenhuma postagem.`);
        return;
    }
    
    const listaPostagens = postagensUsuario
        .slice(0, 3) // Mostrar apenas as 3 mais recentes
        .map(p => `• ${p.conteudo.substring(0, 100)}${p.conteudo.length > 100 ? '...' : ''}`)
        .join('\n');
    
    alert(`Postagens recentes de ${usuario.nome}:\n\n${listaPostagens}\n\n${postagensUsuario.length > 3 ? `E mais ${postagensUsuario.length - 3} postagens...` : ''}`);
}
