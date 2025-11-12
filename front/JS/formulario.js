// Definir a URL base da API
const API_BASE_URL = 'http://127.0.0.1:3002/api';

// Funções para mostrar/esconder campos "outro"
function verificarOutroSegmento() {
    const select = document.getElementById('segmento');
    const inputOutro = document.getElementById('segmento-outro');
    
    if (select.value === 'outro') {
        inputOutro.style.display = 'block';
        inputOutro.required = true;
    } else {
        inputOutro.style.display = 'none';
        inputOutro.required = false;
        inputOutro.value = '';
    }
}

function verificarOutroPresenca() {
    const select = document.getElementById('presenca');
    const inputOutro = document.getElementById('presenca-outro');
    
    if (select.value === 'outro') {
        inputOutro.style.display = 'block';
        inputOutro.required = true;
    } else {
        inputOutro.style.display = 'none';
        inputOutro.required = false;
        inputOutro.value = '';
    }
}

function verificarOutroObjetivo() {
    const select = document.getElementById('objetivo');
    const inputOutro = document.getElementById('objetivo-outro');
    
    if (select.value === 'outro') {
        inputOutro.style.display = 'block';
        inputOutro.required = true;
    } else {
        inputOutro.style.display = 'none';
        inputOutro.required = false;
        inputOutro.value = '';
    }
}

document.getElementById("formDiagnostico").addEventListener("submit", async function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    // Coleta os valores do formulário
    const empresa = document.getElementById("empresa").value;
    
    let segmento = document.getElementById("segmento").value;
    if (segmento === 'outro') {
        segmento = document.getElementById("segmento-outro").value || 'Outro';
    }
    
    const publico = document.getElementById("publico").value;
    
    let presenca = document.getElementById("presenca").value;
    if (presenca === 'outro') {
        presenca = document.getElementById("presenca-outro").value || 'Outro';
    }
    
    let objetivo = document.getElementById("objetivo").value;
    if (objetivo === 'outro') {
        objetivo = document.getElementById("objetivo-outro").value || 'Outro';
    }

    // Mostra loading no lugar do botão
    const formContainer = document.querySelector('.form-container');
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '⏳ Gerando diagnóstico...';

    try {
        // Envia os dados para o backend
        const response = await fetch(`${API_BASE_URL}/diagnostico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                empresa,
                segmento,
                publico,
                presenca,
                objetivo
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar diagnóstico');
        }

        const data = await response.json();
        
        // Substitui o conteúdo do formulário pelo resultado
        formContainer.innerHTML = `
            <h2>📊 Seu Diagnóstico de Marketing Digital</h2>
            <div id="resultado-conteudo">
                ${formatarDiagnostico(data.diagnostico)}
            </div>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 30px;">✨ Fazer Novo Diagnóstico</button>
        `;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erro ao gerar diagnóstico:', error);
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        
        alert('❌ Erro ao gerar diagnóstico. Por favor, tente novamente.');
    }
});

// Função para formatar o diagnóstico em HTML
function formatarDiagnostico(texto) {
    // Remove todas as hashtags (#) do início das linhas
    texto = texto.replace(/^#{1,6}\s+/gm, '');
    
    // Substitui quebras de linha por <br> e formata títulos
    let html = texto
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Identifica listas
    html = html.replace(/- (.*?)(<br>|$)/g, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    return `<div style="white-space: pre-wrap;">${html}</div>`;
}