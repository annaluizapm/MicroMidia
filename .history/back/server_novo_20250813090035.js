const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./db_config');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// ==================== ROTAS ====================

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'API MicroMídia funcionando!' });
});

// ===== USUÁRIOS =====

// Cadastrar usuário (SEM autenticação)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, senha, bio } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        // Verificar se email já existe
        const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Inserir usuário (senha em texto simples - SEM hash)
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, senha, bio || null]
        );

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: { id: result.insertId, nome, email, bio }
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login (SEM JWT, apenas verificação simples)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [users] = await db.execute(
            'SELECT id, nome, email, bio FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            user: users[0]
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar todos os usuários
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, nome, email, bio, criado_em FROM usuarios');
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ===== POSTAGENS =====

// Listar todas as postagens
app.get('/api/posts', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT 
                p.id,
                p.conteudo,
                p.imagem,
                p.criado_em,
                u.nome as autor_nome,
                (SELECT COUNT(*) FROM curtidas WHERE postagem_id = p.id) as total_curtidas,
                (SELECT COUNT(*) FROM comentarios WHERE postagem_id = p.id) as total_comentarios
            FROM postagens p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.criado_em DESC
        `);
        res.json(posts);
    } catch (error) {
        console.error('Erro ao listar postagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova postagem
app.post('/api/posts', async (req, res) => {
    try {
        const { usuario_id, conteudo, imagem } = req.body;

        if (!usuario_id || !conteudo) {
            return res.status(400).json({ error: 'ID do usuário e conteúdo são obrigatórios' });
        }

        const [result] = await db.execute(
            'INSERT INTO postagens (usuario_id, conteudo, imagem) VALUES (?, ?, ?)',
            [usuario_id, conteudo, imagem || null]
        );

        res.status(201).json({
            success: true,
            message: 'Postagem criada com sucesso',
            id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter postagem específica
app.get('/api/posts/:id', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT 
                p.id,
                p.conteudo,
                p.imagem,
                p.criado_em,
                p.usuario_id,
                u.nome as autor_nome
            FROM postagens p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error('Erro ao buscar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ===== COMENTÁRIOS =====

// Listar comentários de uma postagem
app.get('/api/comments/post/:postId', async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT 
                c.id,
                c.texto,
                c.criado_em,
                u.nome as autor_nome
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.postagem_id = ?
            ORDER BY c.criado_em ASC
        `, [req.params.postId]);

        res.json(comments);
    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar comentário
app.post('/api/comments', async (req, res) => {
    try {
        const { usuario_id, postagem_id, texto } = req.body;

        if (!usuario_id || !postagem_id || !texto) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const [result] = await db.execute(
            'INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES (?, ?, ?)',
            [usuario_id, postagem_id, texto]
        );

        res.status(201).json({
            success: true,
            message: 'Comentário criado com sucesso',
            id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ===== CURTIDAS =====

// Curtir/Descurtir postagem
app.post('/api/likes/toggle', async (req, res) => {
    try {
        const { usuario_id, postagem_id } = req.body;

        if (!usuario_id || !postagem_id) {
            return res.status(400).json({ error: 'ID do usuário e da postagem são obrigatórios' });
        }

        // Verificar se já curtiu
        const [existing] = await db.execute(
            'SELECT id FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
            [usuario_id, postagem_id]
        );

        if (existing.length > 0) {
            // Remove curtida
            await db.execute(
                'DELETE FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
                [usuario_id, postagem_id]
            );
            res.json({ success: true, message: 'Curtida removida', liked: false });
        } else {
            // Adiciona curtida
            await db.execute(
                'INSERT INTO curtidas (usuario_id, postagem_id) VALUES (?, ?)',
                [usuario_id, postagem_id]
            );
            res.json({ success: true, message: 'Postagem curtida', liked: true });
        }

    } catch (error) {
        console.error('Erro ao curtir/descurtir:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Contar curtidas de uma postagem
app.get('/api/likes/count/:postId', async (req, res) => {
    try {
        const [result] = await db.execute(
            'SELECT COUNT(*) as total FROM curtidas WHERE postagem_id = ?',
            [req.params.postId]
        );

        res.json({ total: result[0].total });
    } catch (error) {
        console.error('Erro ao contar curtidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Upload de imagem
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    res.json({
        success: true,
        message: 'Imagem enviada com sucesso',
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}`);
    console.log(`🌐 Teste em http://localhost:${PORT}/`);
});
