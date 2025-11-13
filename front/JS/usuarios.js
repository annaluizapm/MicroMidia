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
        
        if (usuariosRes.ok) {
            todosUsuarios = await usuariosRes.json();
            console.log('Usuários carregados:', todosUsuarios);
            // Mostrar as fotos de perfil
            todosUsuarios.forEach(u => {
                if (u.foto_perfil) {
                    console.log(`${u.nome}: foto_perfil =`, u.foto_perfil);
                }
            });
        }
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
        grid.innerHTML = '<div class="loading"><h3>Nenhum usuário encontrado</h3></div>';
        return;
    }
    
    console.log('Usuarios ANTES do map:', usuarios);
    
    const usuariosComStats = usuarios.map(usuario => {
        console.log('Usuario no map:', usuario, 'tem foto_perfil?', usuario.foto_perfil);
        const postagensUsuario = todasPostagens.filter(p => p.usuario_id === usuario.id);
        const totalPostagens = postagensUsuario.length;
        const totalCurtidas = postagensUsuario.reduce((sum, p) => sum + (p.curtidas || 0), 0);
        
        const resultado = {
            ...usuario,
            totalPostagens,
            totalCurtidas,
            ultimaAtividade: postagensUsuario.length > 0 ? 
                Math.max(...postagensUsuario.map(p => new Date(p.criado_em).getTime())) : 
                new Date(usuario.criado_em).getTime()
        };
        console.log('Resultado do map:', resultado, 'tem foto_perfil?', resultado.foto_perfil);
        return resultado;
    });
    
    // Ordenar por atividade (mais ativo primeiro)
    usuariosComStats.sort((a, b) => b.ultimaAtividade - a.ultimaAtividade);
    
    grid.innerHTML = usuariosComStats.map(usuario => {
        // Usar a foto_perfil diretamente se existir, senão usar o ícone padrão
        console.log('Usuario completo:', usuario);
        console.log('foto_perfil value:', usuario.foto_perfil, 'type:', typeof usuario.foto_perfil);
        const fotoPerfil = usuario.foto_perfil || '../assets/perfil-de-usuario.png';
        console.log(`Renderizando ${usuario.nome} com foto:`, fotoPerfil);
        
        return `
            <div class="usuario-card">
                <div class="usuario-header">
                    <img src="${fotoPerfil}" alt="${usuario.nome}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 12px; flex-shrink: 0;" onerror="console.error('Erro ao carregar foto de ${usuario.nome}:', this.src); this.src='../assets/perfil-de-usuario.png';">
                    <div class="usuario-info">
                        <h3>${usuario.nome}</h3>
                        <div class="usuario-email">${usuario.email}</div>
                    </div>
                </div>
                
                <div class="usuario-bio">
                    ${usuario.bio || 'Este usuário ainda não adicionou uma biografia.'}
                </div>
                
                <div class="usuario-stats">
                    <span><img src="../assets/feed.png" alt="Postagens" style="width: 14px; height: 14px; vertical-align: middle;"> ${usuario.totalPostagens} postagens</span>
                    <span><img src="../assets/icone-like.png" alt="Curtidas" style="width: 14px; height: 14px; vertical-align: middle;"> ${usuario.totalCurtidas} curtidas</span>
                    <span><img src="../assets/calendario.png" alt="Data" style="width: 14px; height: 14px; vertical-align: middle;"> ${new Date(usuario.criado_em).toLocaleDateString()}</span>
                </div>
                
                <div class="usuario-actions">
                    <button class="btn-perfil" onclick="verPerfilUsuario(${usuario.id})" style="width: 100%;">
                        Ver Perfil
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

// Ver perfil do usuário
function verPerfilUsuario(userId) {
    const usuario = todosUsuarios.find(u => u.id === userId);
    if (!usuario) return;
    
    // Calcular estatísticas do usuário
    const postagensUsuario = todasPostagens.filter(p => p.usuario_id === userId);
    const totalPostagens = postagensUsuario.length;
    const totalCurtidas = postagensUsuario.reduce((sum, p) => sum + (p.curtidas || 0), 0);
    
    // Criar HTML das postagens
    const postagensHTML = postagensUsuario.length > 0 ? postagensUsuario.map(post => `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 12px; border-left: 4px solid #D90429;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <img src="${usuario.foto_perfil || '../assets/perfil-de-usuario.png'}" alt="${usuario.nome}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333; font-size: 14px;">${usuario.nome}</div>
                    <div style="font-size: 11px; color: #999;">${new Date(post.criado_em).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                </div>
            </div>
            <p style="color: #444; line-height: 1.5; margin: 0; font-size: 14px; white-space: pre-wrap;">${post.conteudo}</p>
            <div style="display: flex; gap: 15px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                <span style="font-size: 12px; color: #666;">
                    <img src="../assets/icone-like.png" style="width: 13px; vertical-align: middle;"> ${post.curtidas || 0}
                </span>
                <span style="font-size: 12px; color: #666;">
                    <img src="../assets/icone-comentario.png" style="width: 13px; vertical-align: middle;"> ${post.comentarios || 0}
                </span>
            </div>
        </div>
    `).join('') : '<p style="text-align: center; color: #999; padding: 20px; background: #f8f9fa; border-radius: 10px;">Nenhuma postagem ainda.</p>';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-perfil-usuario';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 90%; max-height: 85vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #D90429;">Perfil de ${usuario.nome}</h2>
                    <button id="fechar-modal-perfil" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                    <img src="${usuario.foto_perfil || '../assets/perfil-de-usuario.png'}" alt="${usuario.nome}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #D90429;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 5px 0; color: #333;">${usuario.nome}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">${usuario.email}</p>
                        ${usuario.cargo ? `<p style="margin: 5px 0 0 0; color: #D90429; font-weight: 600; font-size: 13px;">${usuario.cargo}${usuario.empresa ? ` • ${usuario.empresa}` : ''}</p>` : ''}
                    </div>
                </div>
                
                ${usuario.bio ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; margin: 0 0 8px 0;">Sobre</h4>
                        <p style="color: #666; line-height: 1.6; margin: 0;">${usuario.bio}</p>
                    </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 24px; font-weight: bold; color: #D90429;">${totalPostagens}</div>
                        <div style="font-size: 12px; color: #666;">Postagens</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 24px; font-weight: bold; color: #D90429;">${totalCurtidas}</div>
                        <div style="font-size: 12px; color: #666;">Curtidas</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 24px; font-weight: bold; color: #D90429;">${new Date(usuario.criado_em).toLocaleDateString('pt-BR').split('/')[0]}/${new Date(usuario.criado_em).toLocaleDateString('pt-BR').split('/')[1]}</div>
                        <div style="font-size: 12px; color: #666;">Membro desde</div>
                    </div>
                </div>
                
                ${usuario.empresa || usuario.segmento ? `
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <h4 style="color: #333; margin: 0 0 10px 0;">Informações Profissionais</h4>
                        ${usuario.empresa ? `<p style="margin: 5px 0; color: #666;"><strong>Empresa:</strong> ${usuario.empresa}</p>` : ''}
                        ${usuario.segmento ? `<p style="margin: 5px 0; color: #666;"><strong>Segmento:</strong> ${usuario.segmento}</p>` : ''}
                        ${usuario.cargo ? `<p style="margin: 5px 0; color: #666;"><strong>Cargo:</strong> ${usuario.cargo}</p>` : ''}
                    </div>
                ` : ''}
                
                ${usuario.site_empresa || usuario.linkedin ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #333; margin: 0 0 10px 0;">Links</h4>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${usuario.site_empresa ? `<a href="${usuario.site_empresa}" target="_blank" style="padding: 8px 15px; background: #D90429; color: white; text-decoration: none; border-radius: 5px; font-size: 14px;">🌐 Website</a>` : ''}
                            ${usuario.linkedin ? `<a href="${usuario.linkedin}" target="_blank" style="padding: 8px 15px; background: #0077b5; color: white; text-decoration: none; border-radius: 5px; font-size: 14px;">LinkedIn</a>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                    <h4 style="color: #D90429; margin: 0 0 15px 0;">Postagens (${totalPostagens})</h4>
                    ${postagensHTML}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal
    document.getElementById('fechar-modal-perfil').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal.firstElementChild) {
            modal.remove();
        }
    });
}

// Ver postagens do usuário
function verPostagensUsuario(userId) {
    const usuario = todosUsuarios.find(u => u.id === userId);
    const postagensUsuario = todasPostagens.filter(p => p.usuario_id === userId);
    
    if (postagensUsuario.length === 0) {
        const modal = document.createElement('div');
        modal.id = 'modal-postagens-usuario';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2001;">
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; text-align: center;">
                    <h3 style="color: #D90429; margin: 0 0 15px 0;">Sem postagens</h3>
                    <p style="color: #666; margin-bottom: 20px;">${usuario.nome} ainda não fez nenhuma postagem.</p>
                    <button id="fechar-modal-postagens" style="padding: 10px 25px; background: #D90429; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('fechar-modal-postagens').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal.firstElementChild) modal.remove();
        });
        return;
    }
    
    // Criar HTML das postagens
    const postagensHTML = postagensUsuario.map(post => `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #D90429;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <img src="${usuario.foto_perfil || '../assets/perfil-de-usuario.png'}" alt="${usuario.nome}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${usuario.nome}</div>
                    <div style="font-size: 12px; color: #999;">${new Date(post.criado_em).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                </div>
            </div>
            <p style="color: #444; line-height: 1.6; margin: 0; white-space: pre-wrap;">${post.conteudo}</p>
            <div style="display: flex; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <span style="font-size: 13px; color: #666;">
                    <img src="../assets/icone-like.png" style="width: 14px; vertical-align: middle;"> ${post.curtidas || 0}
                </span>
                <span style="font-size: 13px; color: #666;">
                    <img src="../assets/icone-comentario.png" style="width: 14px; vertical-align: middle;"> ${post.comentarios || 0}
                </span>
            </div>
        </div>
    `).join('');
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-postagens-usuario';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2001;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; position: sticky; top: 0; background: white; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
                    <h2 style="margin: 0; color: #D90429;">Postagens de ${usuario.nome}</h2>
                    <button id="fechar-modal-postagens" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: #fff3cd; border-radius: 8px; text-align: center;">
                    <strong style="color: #856404;">Total: ${postagensUsuario.length} postagem${postagensUsuario.length !== 1 ? 's' : ''}</strong>
                </div>
                
                ${postagensHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal
    document.getElementById('fechar-modal-postagens').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal.firstElementChild) {
            modal.remove();
        }
    });
}
