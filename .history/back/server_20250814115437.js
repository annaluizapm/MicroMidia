const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3002;

// ================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ================================
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aninha2007', 
    database: 'micro_midia',
    connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);
const db = pool.promise();

// Testar conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
    } else {
        console.log('✅ Conectado ao MySQL com sucesso!');
        connection.release();
    }
});

// ================================
// MIDDLEWARES
// ================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS simples
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ================================
// ROTAS DE TESTE
// ================================
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API MicroMídia Simples funcionando!',
        timestamp: new Date().toLocaleString(),
        endpoints: {
            usuarios: '/api/usuarios',
            postagens: '/api/postagens'
        }
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API funcionando perfeitamente!',
        timestamp: new Date().toLocaleString()
    });
});

// ================================
// CRUD USUÁRIOS
// ================================

// GET - Listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, nome, email, created_at FROM usuarios ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET - Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.execute('SELECT id, nome, email, created_at FROM usuarios WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Criar novo usuário
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        // Verificar se email já existe
        const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senha]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            usuario: {
                id: result.insertId,
                nome,
                email
            }
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT - Atualizar usuário
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email } = req.body;
        
        if (!nome || !email) {
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }

        const [result] = await db.execute(
            'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
            [nome, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE - Deletar usuário
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// CRUD POSTAGENS
// ================================

// GET - Listar todas as postagens
app.get('/api/postagens', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.*, u.nome as usuario_nome 
            FROM postagens p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id 
            ORDER BY p.created_at DESC
        `);
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar postagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET - Buscar postagem por ID
app.get('/api/postagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [posts] = await db.execute(`
            SELECT p.*, u.nome as usuario_nome 
            FROM postagens p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.id = ?
        `, [id]);
        
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }
        
        res.json(posts[0]);
    } catch (error) {
        console.error('Erro ao buscar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Criar nova postagem
app.post('/api/postagens', async (req, res) => {
    try {
        const { conteudo, usuario_id } = req.body;
        
        if (!conteudo || !usuario_id) {
            return res.status(400).json({ error: 'Conteúdo e ID do usuário são obrigatórios' });
        }

        // Verificar se usuário existe
        const [user] = await db.execute('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
        if (user.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const [result] = await db.execute(
            'INSERT INTO postagens (conteudo, usuario_id) VALUES (?, ?)',
            [conteudo, usuario_id]
        );

        res.status(201).json({
            message: 'Postagem criada com sucesso!',
            postagem: {
                id: result.insertId,
                conteudo,
                usuario_id
            }
        });
    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT - Atualizar postagem
app.put('/api/postagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { conteudo } = req.body;
        
        if (!conteudo) {
            return res.status(400).json({ error: 'Conteúdo é obrigatório' });
        }

        const [result] = await db.execute(
            'UPDATE postagens SET conteudo = ? WHERE id = ?',
            [conteudo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        res.json({ message: 'Postagem atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE - Deletar postagem
app.delete('/api/postagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.execute('DELETE FROM postagens WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }
        
        res.json({ message: 'Postagem deletada com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// INICIAR SERVIDOR
// ================================
app.listen(PORT, () => {
    console.log('🚀 Servidor rodando em http://localhost:' + PORT);
    console.log('📊 Endpoints disponíveis:');
    console.log('   GET    /api/usuarios       - Listar usuários');
    console.log('   POST   /api/usuarios       - Criar usuário');
    console.log('   GET    /api/usuarios/:id   - Buscar usuário');
    console.log('   PUT    /api/usuarios/:id   - Atualizar usuário');
    console.log('   DELETE /api/usuarios/:id   - Deletar usuário');
    console.log('   GET    /api/postagens      - Listar postagens');
    console.log('   POST   /api/postagens      - Criar postagem');
    console.log('   GET    /api/postagens/:id  - Buscar postagem');
    console.log('   PUT    /api/postagens/:id  - Atualizar postagem');
    console.log('   DELETE /api/postagens/:id  - Deletar postagem');
});
        }
    });
});

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Servidor OK', timestamp: new Date().toISOString() });
});

// ================================
// AUTENTICAÇÃO (sem JWT)
// ================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, senha, bio } = req.body;
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }
        const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Este email já está cadastrado' });
        }
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, senha, bio || '']
        );
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            usuario: { id: result.insertId, nome, email, bio: bio || '' }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        const [users] = await db.execute(
            'SELECT id, nome, email, bio, foto_perfil FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );
        if (users.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos' });
        res.json({ message: 'Login realizado com sucesso!', usuario: users[0] });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// USUÁRIOS
// ================================
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
// POSTAGENS
// ================================
app.get('/api/postagens', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT p.*, u.nome as autor_nome, u.foto_perfil as autor_foto,
                   COUNT(DISTINCT c.id) as total_comentarios,
                   COUNT(DISTINCT l.id) as total_curtidas
            FROM postagens p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
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

app.post('/api/postagens', async (req, res) => {
    try {
        const { conteudo, usuario_id } = req.body;
        if (!conteudo || !usuario_id) return res.status(400).json({ error: 'Conteúdo e usuário são obrigatórios' });
        const [result] = await db.execute('INSERT INTO postagens (conteudo, usuario_id) VALUES (?, ?)', [conteudo, usuario_id]);
        const [newPost] = await db.execute(`
            SELECT p.*, u.nome as autor_nome, u.foto_perfil as autor_foto
            FROM postagens p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [result.insertId]);
        res.status(201).json({ message: 'Postagem criada com sucesso!', postagem: newPost[0] });
    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// COMENTÁRIOS
// ================================
app.get('/api/comentarios/:postagem_id', async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT c.*, u.nome as autor_nome, u.foto_perfil as autor_foto
            FROM comentarios c
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.postagem_id = ?
            ORDER BY c.criado_em ASC
        `, [req.params.postagem_id]);
        res.json(comments);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/comentarios', async (req, res) => {
    try {
        const { usuario_id, postagem_id, texto } = req.body;
        const missing = [];
        if (!usuario_id) missing.push('usuario_id');
        if (!postagem_id) missing.push('postagem_id');
        if (!texto) missing.push('texto');
        if (missing.length) return res.status(400).json({ error: 'Campos obrigatórios ausentes', campos: missing });
        const [result] = await db.execute('INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES (?, ?, ?)', [usuario_id, postagem_id, texto]);
        res.status(201).json({ success: true, message: 'Comentário criado', id: result.insertId });
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Compatibilidade de comentários
app.get('/api/comments/post/:postId', async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT c.id, c.texto, c.criado_em, u.nome as autor_nome
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.postagem_id = ?
            ORDER BY c.criado_em ASC
        `, [req.params.postId]);
        res.json(comments);
    } catch (error) {
        console.error('Erro ao listar comentários (compat):', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/comments', async (req, res) => {
    try {
        const { usuario_id, postagem_id, texto } = req.body;
        const missing = [];
        if (!usuario_id) missing.push('usuario_id');
        if (!postagem_id) missing.push('postagem_id');
        if (!texto) missing.push('texto');
        if (missing.length) return res.status(400).json({ error: 'Campos obrigatórios auscentes', campos: missing });
        const [result] = await db.execute('INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES (?, ?, ?)', [usuario_id, postagem_id, texto]);
        res.status(201).json({ success: true, message: 'Comentário criado', id: result.insertId });
    } catch (error) {
        console.error('Erro ao criar comentário (compat):', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// CURTIDAS
// ================================
app.post('/api/curtidas', async (req, res) => {
    try {
        const { postagem_id, usuario_id } = req.body;
        if (!postagem_id || !usuario_id) return res.status(400).json({ error: 'ID da postagem e usuário são obrigatórios' });
        const [existing] = await db.execute('SELECT id FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postagem_id, usuario_id]);
        if (existing.length > 0) {
            await db.execute('DELETE FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postagem_id, usuario_id]);
            return res.json({ message: 'Curtida removida', curtiu: false });
        }
        await db.execute('INSERT INTO curtidas (postagem_id, usuario_id) VALUES (?, ?)', [postagem_id, usuario_id]);
        res.json({ message: 'Postagem curtida', curtiu: true });
    } catch (error) {
        console.error('Erro ao curtir:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Compatibilidade de curtidas
app.get('/api/likes/check/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.query.userId || req.headers['user-id'];
        if (!userId) return res.json({ curtiu: false });
        const [result] = await db.execute('SELECT id FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postId, userId]);
        res.json({ curtiu: result.length > 0 });
    } catch (error) {
        console.error('Erro ao verificar curtida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/likes/toggle', async (req, res) => {
    try {
        const { postId, userId } = req.body;
        if (!postId || !userId) return res.status(400).json({ error: 'ID da postagem e usuário são obrigatórios' });
        const [existing] = await db.execute('SELECT id FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postId, userId]);
        if (existing.length > 0) {
            await db.execute('DELETE FROM curtidas WHERE postagem_id = ? AND usuario_id = ?', [postId, userId]);
            return res.json({ message: 'Curtida removida', curtiu: false });
        }
        await db.execute('INSERT INTO curtidas (postagem_id, usuario_id) VALUES (?, ?)', [postId, userId]);
        res.json({ message: 'Postagem curtida', curtiu: true });
    } catch (error) {
        console.error('Erro ao curtir (compat):', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/likes/count/:postId', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT COUNT(*) as total FROM curtidas WHERE postagem_id = ?', [req.params.postId]);
        res.json({ total: result[0].total });
    } catch (error) {
        console.error('Erro ao contar curtidas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Upload de imagem
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    res.json({ success: true, message: 'Imagem enviada com sucesso', filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`� Acesse: http://127.0.0.1:${PORT}`);
    console.log(`🧪 Teste: http://127.0.0.1:${PORT}/api/test`);
});
