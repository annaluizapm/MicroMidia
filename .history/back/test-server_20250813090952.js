const express = require('express');
const app = express();
const PORT = 3001;

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Rota simples de teste
app.get('/test', (req, res) => {
    console.log('Rota /test foi chamada!');
    res.json({ 
        message: 'Teste funcionando!', 
        timestamp: new Date().toISOString() 
    });
});

// Rota raiz
app.get('/', (req, res) => {
    console.log('Rota / foi chamada!');
    res.json({ message: 'Servidor de teste funcionando!' });
});

app.listen(PORT, () => {
    console.log(`🧪 Servidor de teste rodando na porta ${PORT}`);
    console.log(`Teste em: http://localhost:${PORT}/test`);
});
