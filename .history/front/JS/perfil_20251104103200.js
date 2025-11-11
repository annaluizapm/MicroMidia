// Funções para gerenciamento do perfil de usuário

// Variável global para o usuário atual
let usuarioAtual = null;

// Função para verificar se o usuário está logado (duplicada aqui para independência)
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

// Carregar dados do perfil ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se há um usuário logado
    usuarioAtual = verificarUsuarioLogado();
    
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
        // Verificar se temos um ID de usuário válido
        if (!usuarioAtual || !usuarioAtual.id) {
            mostrarMensagem('ID de usuário inválido. Por favor, faça login novamente.', 'erro');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioAtual.id}`);
        if (response.ok) {
            const usuario = await response.json();
            
            document.getElementById('nome-usuario').textContent = usuario.nome || 'Usuário';
            document.getElementById('nome').value = usuario.nome || '';
            document.getElementById('email').value = usuario.email || '';
            
            // Verificar se o elemento bio existe antes de tentar atribuir um valor
            const bioElement = document.getElementById('bio');
            if (bioElement) {
                bioElement.value = usuario.bio || '';
            }
            
            // Carregar informações do negócio
            const empresaElement = document.getElementById('empresa');
            if (empresaElement) {
                empresaElement.value = usuario.empresa || '';
            }
            
            const segmentoElement = document.getElementById('segmento');
            if (segmentoElement) {
                segmentoElement.value = usuario.segmento || '';
            }
            
            const cargoElement = document.getElementById('cargo');
            if (cargoElement) {
                cargoElement.value = usuario.cargo || '';
            }
            
            const siteEmpresaElement = document.getElementById('site_empresa');
            if (siteEmpresaElement) {
                siteEmpresaElement.value = usuario.site_empresa || '';
            }
            
            const linkedinElement = document.getElementById('linkedin');
            if (linkedinElement) {
                linkedinElement.value = usuario.linkedin || '';
            }
            
            // Carregar foto se existir
            if (usuario.foto_perfil) {
                const fotoContainer = document.getElementById('foto-container');
                fotoContainer.innerHTML = `<img src="${usuario.foto_perfil}" class="foto-perfil" alt="Foto do perfil">`;
            }
            
            // Atualizar usuário atual com os dados mais recentes
            usuarioAtual = usuario;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
        } else if (response.status === 404) {
            mostrarMensagem('Usuário não encontrado. Por favor, faça login novamente.', 'erro');
            // Limpar localStorage e redirecionar para login
            localStorage.removeItem('usuarioLogado');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
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
    
    // Informações pessoais
    let bio = '';
    const bioElement = document.getElementById('bio');
    if (bioElement) {
        bio = bioElement.value.trim();
    }
    
    if (!nome || !email) {
        mostrarMensagem('Nome e email são obrigatórios', 'erro');
        return;
    }
    
    // Informações do negócio
    let empresa = '';
    const empresaElement = document.getElementById('empresa');
    if (empresaElement) {
        empresa = empresaElement.value.trim();
    }
    
    let segmento = '';
    const segmentoElement = document.getElementById('segmento');
    if (segmentoElement) {
        segmento = segmentoElement.value.trim();
    }
    
    let cargo = '';
    const cargoElement = document.getElementById('cargo');
    if (cargoElement) {
        cargo = cargoElement.value.trim();
    }
    
    let site_empresa = '';
    const siteEmpresaElement = document.getElementById('site_empresa');
    if (siteEmpresaElement) {
        site_empresa = siteEmpresaElement.value.trim();
    }
    
    let linkedin = '';
    const linkedinElement = document.getElementById('linkedin');
    if (linkedinElement) {
        linkedin = linkedinElement.value.trim();
    }
    
    try {
        // Verificar se temos um ID de usuário válido
        if (!usuarioAtual || !usuarioAtual.id) {
            mostrarMensagem('ID de usuário inválido. Por favor, faça login novamente.', 'erro');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioAtual.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                nome, 
                email, 
                bio,
                empresa,
                segmento,
                cargo,
                site_empresa,
                linkedin,
                habilidades,
                interesses
            })
        });
        
        if (response.ok) {
            mostrarMensagem('Perfil atualizado com sucesso!', 'sucesso');
            document.getElementById('nome-usuario').textContent = nome;
            
            // Atualizar localStorage com os novos dados
            usuarioAtual.nome = nome;
            usuarioAtual.email = email;
            usuarioAtual.bio = bio;
            usuarioAtual.empresa = empresa;
            usuarioAtual.segmento = segmento;
            usuarioAtual.cargo = cargo;
            usuarioAtual.site_empresa = site_empresa;
            usuarioAtual.linkedin = linkedin;
            usuarioAtual.habilidades = habilidades;
            usuarioAtual.interesses = interesses;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
        } else {
            // Tratamento seguro para resposta não-JSON
            try {
                const erro = await response.json();
                mostrarMensagem(erro.error || 'Erro ao atualizar perfil', 'erro');
            } catch (e) {
                // Se não conseguir parsear como JSON
                mostrarMensagem(`Erro ao atualizar perfil: ${response.status} ${response.statusText}`, 'erro');
            }
        }
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        mostrarMensagem('Erro de conexão com o servidor', 'erro');
    }
}

// Upload de foto
async function handleFotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            mostrarMensagem('A imagem deve ter no máximo 5MB', 'erro');
            return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            mostrarMensagem('Apenas arquivos de imagem são permitidos', 'erro');
            return;
        }
        
        try {
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const fotoContainer = document.getElementById('foto-container');
                fotoContainer.innerHTML = `<img src="${e.target.result}" class="foto-perfil" alt="Foto do perfil">`;
            };
            reader.readAsDataURL(file);
            
            // Fazer upload para o servidor
            if (usuarioAtual && usuarioAtual.id) {
                const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioAtual.id}/foto-base64`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ foto_base64: reader.result || await fileToBase64(file) })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    usuarioAtual.foto_perfil = data.foto_url;
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
                    mostrarMensagem('Foto atualizada com sucesso!', 'sucesso');
                } else {
                    mostrarMensagem('Erro ao atualizar foto', 'erro');
                }
            }
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            mostrarMensagem('Erro ao processar imagem', 'erro');
        }
    }
}

// Função auxiliar para converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Carregar postagens do usuário
async function carregarPostagensUsuario() {
    try {
        if (!usuarioAtual || !usuarioAtual.id) {
            console.error('ID de usuário inválido ao carregar postagens');
            return;
        }
        
        const container = document.getElementById('lista-postagens');
        if (!container) return;
        
        const response = await fetch(`${API_BASE_URL}/postagens`);
        if (response.ok) {
            const todasPostagens = await response.json();
            const minhasPostagens = todasPostagens.filter(p => p.usuario_id === usuarioAtual.id);
            
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
        } else {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Erro ao carregar postagens. Por favor, tente novamente.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        document.getElementById('lista-postagens').innerHTML = '<p>Erro ao carregar postagens</p>';
    }
}

// Carregar estatísticas
async function carregarEstatisticas() {
    try {
        if (!usuarioAtual || !usuarioAtual.id) {
            console.error('ID de usuário inválido ao carregar estatísticas');
            return;
        }
        
        const totalPostagensEl = document.getElementById('total-postagens');
        const totalCurtidasEl = document.getElementById('total-curtidas');
        const totalComentariosEl = document.getElementById('total-comentarios');
        
        if (!totalPostagensEl || !totalCurtidasEl || !totalComentariosEl) return;
        
        const response = await fetch(`${API_BASE_URL}/postagens`);
        if (response.ok) {
            const todasPostagens = await response.json();
            const minhasPostagens = todasPostagens.filter(p => p.usuario_id === usuarioAtual.id);
            
            const totalPostagens = minhasPostagens.length;
            const totalCurtidas = minhasPostagens.reduce((sum, post) => sum + (post.curtidas || 0), 0);
            const totalComentarios = minhasPostagens.reduce((sum, post) => sum + (post.comentarios || 0), 0);
            
            totalPostagensEl.textContent = totalPostagens;
            totalCurtidasEl.textContent = totalCurtidas;
            totalComentariosEl.textContent = totalComentarios;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Função para exibir mensagens para o usuário
function mostrarMensagem(texto, tipo = 'info') {
    alert(texto);
}
