// Funções para gerenciamento do perfil de usuário
const API_BASE_URL = 'http://127.0.0.1:3002/api';

// Variável global para o usuário atual
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

// Carregar dados do perfil ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se há um usuário logado
    if (!usuarioAtual) {
        mostrarMensagem('Você precisa estar logado para acessar esta página', 'erro');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    await carregarPerfilUsuario();
    await carregarPostagensUsuario();
    await carregarEstatisticas();
    
    // Configurar formulário
    document.getElementById('perfil-form').addEventListener('submit', handleSalvarPerfil);
    
    // Configurar upload de foto
    const inputFoto = document.getElementById('input-foto');
    if (inputFoto) {
        inputFoto.addEventListener('change', handleFotoUpload);
    }
    
    // Adicionar manipulador para o clique na foto de perfil
    const fotoContainer = document.getElementById('foto-container');
    if (fotoContainer) {
        fotoContainer.addEventListener('click', () => {
            document.getElementById('input-foto').click();
        });
    }
});

// Carregar dados do usuário
async function carregarPerfilUsuario() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioAtual.id}`);
        if (response.ok) {
            const usuario = await response.json();
            
            document.getElementById('nome-usuario').textContent = usuario.nome;
            document.getElementById('nome').value = usuario.nome;
            document.getElementById('email').value = usuario.email;
            
            // Verificar se o elemento bio existe antes de tentar atribuir um valor
            const bioElement = document.getElementById('bio');
            if (bioElement) {
                bioElement.value = usuario.bio || '';
            }
            
            // Carregar foto se existir
            if (usuario.foto_perfil) {
                const fotoContainer = document.getElementById('foto-container');
                fotoContainer.innerHTML = `<img src="${usuario.foto_perfil}" class="foto-perfil" alt="Foto do perfil">`;
            }
            
            // Atualizar usuário atual com os dados mais recentes
            usuarioAtual = usuario;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
        } else {
            mostrarMensagem('Erro ao carregar dados do usuário', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        mostrarMensagem('Erro de conexão com o servidor', 'erro');
    }
}

// Salvar alterações do perfil
async function handleSalvarPerfil(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Verificar se o elemento bio existe antes de tentar obter seu valor
    let bio = '';
    const bioElement = document.getElementById('bio');
    if (bioElement) {
        bio = bioElement.value.trim();
    }
    
    if (!nome || !email) {
        mostrarMensagem('Nome e email são obrigatórios', 'erro');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioAtual.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                nome, 
                email, 
                bio 
            })
        });
        
        if (response.ok) {
            mostrarMensagem('Perfil atualizado com sucesso!', 'sucesso');
            document.getElementById('nome-usuario').textContent = nome;
            
            // Atualizar localStorage com os novos dados
            usuarioAtual.nome = nome;
            usuarioAtual.email = email;
            usuarioAtual.bio = bio;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
        } else {
            const erro = await response.json();
            mostrarMensagem(erro.error || 'Erro ao atualizar perfil', 'erro');
        }
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        mostrarMensagem('Erro de conexão com o servidor', 'erro');
    }
}

// Upload de foto (simulado - só frontend por simplicidade)
function handleFotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fotoContainer = document.getElementById('foto-container');
            fotoContainer.innerHTML = `<img src="${e.target.result}" class="foto-perfil" alt="Foto do perfil">`;
            mostrarMensagem('Foto alterada! (Salve para aplicar)', 'sucesso');
            
            // Em um cenário real, você enviaria a foto para o servidor aqui
            // e salvaria a URL retornada
        };
        reader.readAsDataURL(file);
    }
}

// Carregar postagens do usuário
async function carregarPostagensUsuario() {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`);
        if (response.ok) {
            const todasPostagens = await response.json();
            const minhasPostagens = todasPostagens.filter(p => p.usuario_id === usuarioAtual.id);
            
            const container = document.getElementById('lista-postagens');
            
            if (minhasPostagens.length === 0) {
                container.innerHTML = '<p style="color: #666; font-style: italic;">Você ainda não fez nenhuma postagem.</p>';
                return;
            }
            
            container.innerHTML = minhasPostagens.map(post => `
                <div class="post-item">
                    <div class="post-content">${post.conteudo}</div>
                    <div class="post-meta">
                        <span>${new Date(post.criado_em || post.created_at).toLocaleString()}</span>
                        <span>❤️ ${post.curtidas || 0} | 💬 ${post.comentarios || 0}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        document.getElementById('lista-postagens').innerHTML = '<p>Erro ao carregar postagens</p>';
    }
}

// Carregar estatísticas
async function carregarEstatisticas() {
    try {
        const response = await fetch(`${API_BASE_URL}/postagens`);
        if (response.ok) {
            const todasPostagens = await response.json();
            const minhasPostagens = todasPostagens.filter(p => p.usuario_id === usuarioAtual.id);
            
            const totalPostagens = minhasPostagens.length;
            const totalCurtidas = minhasPostagens.reduce((sum, post) => sum + (post.curtidas || 0), 0);
            const totalComentarios = minhasPostagens.reduce((sum, post) => sum + (post.comentarios || 0), 0);
            
            document.getElementById('total-postagens').textContent = totalPostagens;
            document.getElementById('total-curtidas').textContent = totalCurtidas;
            document.getElementById('total-comentarios').textContent = totalComentarios;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Função para exibir mensagens para o usuário
function mostrarMensagem(texto, tipo = 'info') {
    alert(texto);
}
