document.getElementById("formDiagnostico").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    // Coleta os valores do formulário
    const empresa = document.getElementById("empresa").value;
    const segmento = document.getElementById("segmento").value;
    const publico = document.getElementById("publico").value;
    const presenca = document.getElementById("presenca").value;
    const objetivo = document.getElementById("objetivo").value;

    // Cria o "prompt" (texto) com base nas respostas
    const prompt = `
Gere um diagnóstico de marketing digital para a empresa "${empresa}".
Segmento: ${segmento}.
Público-alvo: ${publico}.
Nível atual de presença digital: ${presenca}.
Objetivo principal: ${objetivo}.

Ofereça uma análise detalhada e recomendações práticas personalizadas para melhorar o desempenho digital dessa empresa.
    `;

    // Exibe o prompt no console (teste)
    console.log(prompt);

    // Exibe o prompt na tela (pode ser trocado por envio para API)
    alert("Diagnóstico gerado! Confira no console (F12).");

    // 👉 Se quiser enviar o prompt para outra página (ex: resultado.html)
    // window.location.href = `resultado.html?prompt=${encodeURIComponent(prompt)}`;
});
