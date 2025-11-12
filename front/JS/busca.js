// Garantir que exista uma URL base para a API. Se outra parte do app definiu
// `API_BASE_URL` no escopo global (por exemplo em `script.js`), usamos ela;
// caso contrário, montamos uma URL relativa com base em `location`.
const API_BASE_URL = (function(){
    try{
        if (typeof window !== 'undefined' && window.API_BASE_URL) return window.API_BASE_URL;
    }catch(e){}
    // Sempre usar a porta 3002 do servidor Node.js, mesmo se estiver em Live Server
    return 'http://127.0.0.1:3002/api';
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('busca-form');
    if(form) form.addEventListener('submit', handleBusca);
    const termoInput = document.getElementById('termo-busca');
    if(termoInput) termoInput.addEventListener('input', handleBuscaTempoReal);
    
    // Adicionar event listeners nas tags de busca rápida
    const tagsBusca = document.querySelectorAll('.tag-busca');
    tagsBusca.forEach(tag => {
        tag.addEventListener('click', function() {
            const termo = this.getAttribute('data-termo');
            buscarRapida(termo);
        });
    });
});

// Cria um pequeno banner no topo da página com informações de debug e um botão
function createDebugBanner(){
    
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
        
        // Normaliza texto para comparação (remove acentos, transforma em minúsculas)
        function normalizeText(str){
            if(!str) return '';
            return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
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
                const termNorm = normalizeText(termo);
                return postagens.filter(p => {
                    const conteudo = normalizeText(p.conteudo || '');
                    const usuario = normalizeText(p.usuario_nome || '');
                    const categoria = normalizeText(p.categoria || '');
                    const tags = normalizeText(p.tags || '');
                    // combinar por conteúdo, autor, categoria ou tags
                    return (
                        conteudo.includes(termNorm) ||
                        usuario.includes(termNorm) ||
                        categoria.includes(termNorm) ||
                        tags.includes(termNorm)
                    );
                });
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