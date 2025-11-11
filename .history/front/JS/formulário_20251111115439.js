// Definir a URL base da API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `http://${window.location.hostname}:3002/api`
    : '/api';

document.getElementById("formDiagnostico").addEventListener("submit", async function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    // Coleta os valores do formulário
    const empresa = document.getElementById("empresa").value;
    const segmento = document.getElementById("segmento").value;
    const publico = document.getElementById("publico").value;
    const presenca = document.getElementById("presenca").value;
    const objetivo = document.getElementById("objetivo").value;

    // Mostra a seção de resultado e o loading
    const resultadoContainer = document.getElementById("resultado-container");
    const loading = document.getElementById("loading");
    const resultadoConteudo = document.getElementById("resultado-conteudo");
    const btnNovo = document.getElementById("btn-novo");
    
    resultadoContainer.style.display = "block";
    loading.style.display = "block";
    resultadoConteudo.style.display = "none";
    btnNovo.style.display = "none";
    
    // Rola suavemente até o resultado
    resultadoContainer.scrollIntoView({ behavior: 'smooth' });

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
        
        // Esconde o loading e mostra o resultado
        loading.style.display = "none";
        resultadoConteudo.style.display = "block";
        btnNovo.style.display = "block";
        
        // Formata e exibe o diagnóstico
        resultadoConteudo.innerHTML = formatarDiagnostico(data.diagnostico);
        
    } catch (error) {
        console.error('Erro ao gerar diagnóstico:', error);
        loading.style.display = "none";
        resultadoConteudo.style.display = "block";
        resultadoConteudo.innerHTML = `
            <div style="color: #dc3545; padding: 20px; text-align: center;">
                <h4>❌ Erro ao gerar diagnóstico</h4>
                <p>Não foi possível gerar seu diagnóstico no momento. Por favor, tente novamente mais tarde.</p>
                <p style="font-size: 14px; color: #666;">Erro: ${error.message}</p>
            </div>
        `;
        btnNovo.style.display = "block";
    }
});

// Função para formatar o diagnóstico em HTML
function formatarDiagnostico(texto) {
    // Substitui quebras de linha por <br> e formata títulos
    let html = texto
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^### (.*?)$/gm, '<h4>$1</h4>')
        .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^# (.*?)$/gm, '<h2>$1</h2>');
    
    // Identifica listas
    html = html.replace(/- (.*?)(<br>|$)/g, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    
    return `<div style="white-space: pre-wrap;">${html}</div>`;
}

// Função para voltar ao formulário
function voltarFormulario() {
    document.getElementById("resultado-container").style.display = "none";
    document.getElementById("formDiagnostico").reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

