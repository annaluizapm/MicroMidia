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
});
        
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
            const response = await fetch(`${API_BASE_URL}/postagens`);
            if (response.ok) {
                const postagens = await response.json();
                return postagens.filter(p => 
                    p.conteudo.toLowerCase().includes(termo.toLowerCase()) ||
                    (p.usuario_nome && p.usuario_nome.toLowerCase().includes(termo.toLowerCase()))
                );
            }
            return [];
        }
        
        // Buscar usuários  
        async function buscarUsuarios(termo) {
            const response = await fetch(`${API_BASE_URL}/usuarios`);
            if (response.ok) {
                const usuarios = await response.json();
                return usuarios.filter(u => 
                    u.nome.toLowerCase().includes(termo.toLowerCase()) ||
                    u.email.toLowerCase().includes(termo.toLowerCase()) ||
                    (u.bio && u.bio.toLowerCase().includes(termo.toLowerCase()))
                );
            }
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