const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db_config');

const app = express();
const PORT = 3000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS simplificado
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// ================================
// ROTAS DE TESTE
// ================================

app.get('/', (req, res) => {
    console.log('Rota raiz chamada!');
    res.status(200).json({ 
        message: 'API MicroMídia funcionando!',
        timestamp: new Date().toISOString(),
        endpoints: {
            test: '/api/test',
            usuarios: '/api/usuarios',
            postagens: '/api/postagens',
            auth: '/api/auth'
        }
    });
});

app.get('/api/test', (req, res) => {
    console.log('Rota de teste chamada!');
    res.status(200).json({ 
        message: 'Servidor funcionando perfeitamente!', 
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// ================================
// ROTAS DE AUTENTICAÇÃO
// ================================

// Registro de usuário
app.post('/api/auth/register', async (req, res) => {
    console.log('Tentativa de registro:', req.body);
    
    try {
        const { nome, email, senha, bio } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        // Verificar se o email já existe
        const [existingUsers] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Este email já está cadastrado' });
        }

        // Inserir novo usuário
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, senha, bio || '']
        );

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: result.insertId,
                nome,
                email,
                bio: bio || ''
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
    console.log('Tentativa de login:', req.body);
    
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT id, nome, email, bio, foto_perfil FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];
        
        res.json({
            message: 'Login realizado com sucesso!',
            usuario: user
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// ROTAS DE USUÁRIOS
// ================================

// Listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, nome, email, bio, foto_perfil, criado_em FROM usuarios ORDER BY criado_em DESC');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// ROTAS DE POSTAGENS
// ================================

// Listar todas as postagens
app.get('/api/postagens', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.*, u.nome as autor_nome, u.foto_perfil as autor_foto,
                   COUNT(DISTINCT c.id) as total_comentarios,
                   COUNT(DISTINCT l.id) as total_curtidas
            FROM postagens p
            LEFT JOIN usuarios u ON p.autor_id = u.id
            LEFT JOIN comentarios c ON p.id = c.postagem_id
            LEFT JOIN curtidas l ON p.id = l.postagem_id
            GROUP BY p.id
            ORDER BY p.criado_em DESC
        `);
        
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar postagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova postagem
app.post('/api/postagens', async (req, res) => {
    try {
        const { titulo, conteudo, categoria, autor_id } = req.body;

        if (!titulo || !conteudo || !autor_id) {
            return res.status(400).json({ error: 'Título, conteúdo e autor são obrigatórios' });
        }

        const [result] = await db.execute(
            'INSERT INTO postagens (titulo, conteudo, categoria, autor_id) VALUES (?, ?, ?, ?)',
            [titulo, conteudo, categoria || 'geral', autor_id]
        );

        // Buscar a postagem criada com dados do autor
        const [newPost] = await db.execute(`
            SELECT p.*, u.nome as autor_nome, u.foto_perfil as autor_foto
            FROM postagens p
            LEFT JOIN usuarios u ON p.autor_id = u.id
            WHERE p.id = ?
        `, [result.insertId]);

        res.status(201).json({
            message: 'Postagem criada com sucesso!',
            postagem: newPost[0]
        });

    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// INICIALIZAÇÃO DO SERVIDOR
// ================================

// Criar diretório de uploads se não existir
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Iniciar servidor
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📖 Acesse: http://127.0.0.1:${PORT}`);
    console.log(`🧪 Teste: http://127.0.0.1:${PORT}/api/test`);
});

module.exports = app;
