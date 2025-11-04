// Garantir que exista uma URL base para a API. Se outra parte do app definiu
// `API_BASE_URL` no escopo global (por exemplo em `script.js`), usamos ela;
// caso contrário, montamos uma URL relativa com base em `location`.
const API_BASE_URL = (function(){
    try{
        if (typeof window !== 'undefined' && window.API_BASE_URL) return window.API_BASE_URL;
    }catch(e){}
    // fallback dinâmico para `http(s)://host:port/api`
    const port = (typeof location !== 'undefined' && location.port) ? `:${location.port}` : '';
    const protocol = (typeof location !== 'undefined' && location.protocol) ? location.protocol : 'http:';
    const hostname = (typeof location !== 'undefined' && location.hostname) ? location.hostname : '127.0.0.1';
    return `${protocol}//${hostname}${port}/api`;
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('busca-form');
    if(form) form.addEventListener('submit', handleBusca);
    const termoInput = document.getElementById('termo-busca');
    if(termoInput) termoInput.addEventListener('input', handleBuscaTempoReal);
    // adicionar banner de debug para facilitar diagnóstico em tempo real
    try { createDebugBanner(); } catch(e){ console.warn('Não foi possível criar debug banner:', e); }
});

// Cria um pequeno banner no topo da página com informações de debug e um botão
function createDebugBanner(){
    if (document.getElementById('debug-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'debug-banner';
    banner.style.position = 'fixed';
    banner.style.top = '10px';
    banner.style.right = '10px';
    banner.style.zIndex = 9999;
    banner.style.background = 'rgba(0,0,0,0.75)';
    banner.style.color = 'white';
    banner.style.padding = '10px 12px';
    banner.style.borderRadius = '8px';
    banner.style.fontSize = '13px';
    banner.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';

    const info = document.createElement('div');
    info.style.marginBottom = '8px';
    info.innerText = `API_BASE_URL: ${API_BASE_URL}`;

    const btn = document.createElement('button');
    btn.innerText = 'Testar /api/postagens';
    btn.style.cursor = 'pointer';
    btn.style.padding = '6px 10px';
    btn.style.borderRadius = '6px';
    btn.style.border = 'none';
    btn.style.background = '#D90429';
    btn.style.color = 'white';
    btn.style.fontWeight = '600';

    const status = document.createElement('div');
    status.id = 'debug-status';
    status.style.marginTop = '8px';
    status.style.fontSize = '12px';

    btn.addEventListener('click', async () => {
        status.innerText = 'Testando...';
        try {
            const res = await fetch(`${API_BASE_URL}/postagens`);
            status.innerText = `Status: ${res.status} ${res.statusText}`;
            if (res.ok) {
                const data = await res.json();
                status.innerText += ` — postagens: ${Array.isArray(data) ? data.length : 'n/a'}`;
            } else {
                const text = await res.text();
                status.innerText += ` — resposta: ${text.slice(0,120)}`;
            }
        } catch (err) {
            status.innerText = 'Erro: ' + (err.message || err);
            console.error('Debug banner fetch error:', err);
        }
    });

    banner.appendChild(info);
    banner.appendChild(btn);
    banner.appendChild(status);
    document.body.appendChild(banner);
}
        
        let timeoutBusca;
        
        // Busca em tempo real (com delay)
        function handleBuscaTempoReal() {
            clearTimeout(timeoutBusca);
            timeoutBusca = setTimeout(() => {
                const termo = document.getElementById('termo-busca').value.trim();
                if (termo.length > 2) {
                    realizarBusca(termo, document.getElementById('filtro-tipo').value);
                }
            }, 500);
        }
        
        // Busca ao enviar formulário
        async function handleBusca(event) {
            event.preventDefault();
            const termo = document.getElementById('termo-busca').value.trim();
            const tipo = document.getElementById('filtro-tipo').value;
            
            if (termo) {
                await realizarBusca(termo, tipo);
            }
        }
        
        // Busca rápida por tags
        function buscarRapida(termo) {
            document.getElementById('termo-busca').value = termo;
            realizarBusca(termo, 'postagens');
        }
        
        // Realizar busca
        async function realizarBusca(termo, tipo) {
            const container = document.getElementById('resultados-container');
            container.innerHTML = '<div class="sem-resultados"><h3>🔍 Buscando...</h3></div>';
            
            try {
                let resultados = [];
                
                if (tipo === 'postagens' || tipo === 'todos') {
                    const postagens = await buscarPostagens(termo);
                    resultados = [...resultados, ...postagens.map(p => ({...p, tipo: 'postagem'}))];
                }
                
                if (tipo === 'usuarios' || tipo === 'todos') {
                    const usuarios = await buscarUsuarios(termo);
                    resultados = [...resultados, ...usuarios.map(u => ({...u, tipo: 'usuario'}))];
                }
                
                exibirResultados(resultados, termo);
                
            } catch (error) {
                console.error('Erro na busca:', error);
                container.innerHTML = '<div class="sem-resultados"><h3>❌ Erro na busca</h3><p>Tente novamente em alguns segundos</p></div>';
            }
        }
        
        // Buscar postagens
        async function buscarPostagens(termo) {
            const url = `${API_BASE_URL}/postagens`;
            console.log('[busca] GET', url);
            const response = await fetch(url).catch(err => {
                console.error('[busca] Erro fetch postagens:', err);
                return null;
            });
            if (!response) return [];
            console.log('[busca] postagens status', response.status);
            if (response.ok) {
                const postagens = await response.json();
                console.log('[busca] postagens recebidas:', Array.isArray(postagens) ? postagens.length : typeof postagens);
                return postagens.filter(p => 
                    (p.conteudo || '').toLowerCase().includes(termo.toLowerCase()) ||
                    (p.usuario_nome && p.usuario_nome.toLowerCase().includes(termo.toLowerCase()))
                );
            }
            const text = await response.text().catch(()=>'');
            console.warn('[busca] resposta não OK postagens:', response.status, text.slice(0,200));
            return [];
        }
        
        // Buscar usuários  
        async function buscarUsuarios(termo) {
            const url = `${API_BASE_URL}/usuarios`;
            console.log('[busca] GET', url);
            const response = await fetch(url).catch(err => {
                console.error('[busca] Erro fetch usuarios:', err);
                return null;
            });
            if (!response) return [];
            console.log('[busca] usuarios status', response.status);
            if (response.ok) {
                const usuarios = await response.json();
                console.log('[busca] usuarios recebidos:', Array.isArray(usuarios) ? usuarios.length : typeof usuarios);
                return usuarios.filter(u => 
                    (u.nome || '').toLowerCase().includes(termo.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(termo.toLowerCase()) ||
                    (u.bio && u.bio.toLowerCase().includes(termo.toLowerCase()))
                );
            }
            const text = await response.text().catch(()=>'');
            console.warn('[busca] resposta não OK usuarios:', response.status, text.slice(0,200));
            return [];
        }
        
        // Exibir resultados
        function exibirResultados(resultados, termo) {
            const container = document.getElementById('resultados-container');
            
            if (resultados.length === 0) {
                container.innerHTML = `
                    <div class="sem-resultados">
                        <h3>😔 Nenhum resultado encontrado</h3>
                        <p>Tente buscar por outros termos ou verifique a ortografia</p>
                    </div>
                `;
                return;
            }
            
            const info = `<div class="resultados-info">Encontrados ${resultados.length} resultado(s) para "${termo}"</div>`;
            
            const itens = resultados.map(item => {
                if (item.tipo === 'postagem') {
                    return `
                        <div class="resultado-item">
                            <div class="resultado-header">
                                <span class="resultado-autor">📝 ${item.usuario_nome || 'Usuário'}</span>
                                <span class="resultado-data">${new Date(item.criado_em).toLocaleString()}</span>
                            </div>
                            <div class="resultado-conteudo">${destacarTermo(item.conteudo, termo)}</div>
                            <div class="resultado-stats">
                                <span>❤️ ${item.curtidas || 0} curtidas</span>
                                <span>💬 ${item.comentarios || 0} comentários</span>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="resultado-item">
                            <div class="resultado-header">
                                <span class="resultado-autor">👤 ${destacarTermo(item.nome, termo)}</span>
                                <span class="resultado-data">Usuário</span>
                            </div>
                            <div class="resultado-conteudo">
                                <strong>Email:</strong> ${destacarTermo(item.email, termo)}<br>
                                ${item.bio ? `<strong>Bio:</strong> ${destacarTermo(item.bio, termo)}` : ''}
                            </div>
                        </div>
                    `;
                }
            }).join('');
            
            container.innerHTML = info + itens;
        }
        
        // Destacar termo de busca
        function destacarTermo(texto, termo) {
            if (!texto) return '';
            const regex = new RegExp(`(${termo})`, 'gi');
            return texto.replace(regex, '<span class="highlight">$1</span>');
        }