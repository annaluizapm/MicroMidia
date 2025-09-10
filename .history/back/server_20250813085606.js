const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, nome, email, bio, foto_perfil, criado_em FROM usuarios WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar usuário
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, email, senha, bio } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        // Verificar se email já existe
        const [existingUsers] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, senha, bio || null]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            id: result.insertId,
            nome,
            email
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar usuário
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { nome, email, bio } = req.body;
        const { id } = req.params;

        await db.execute(
            'UPDATE usuarios SET nome = ?, email = ?, bio = ? WHERE id = ?',
            [nome, email, bio, id]
        );

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar usuário
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
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
            SELECT 
                p.id,
                p.conteudo,
                p.imagem,
                p.criado_em,
                u.nome as autor_nome,
                u.foto_perfil as autor_foto,
                (SELECT COUNT(*) FROM curtidas WHERE postagem_id = p.id) as total_curtidas,
                (SELECT COUNT(*) FROM comentarios WHERE postagem_id = p.id) as total_comentarios
            FROM postagens p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.criado_em DESC
        `);
        
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar postagens:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar postagem por ID
app.get('/api/postagens/:id', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT 
                p.id,
                p.conteudo,
                p.imagem,
                p.criado_em,
                p.usuario_id,
                u.nome as autor_nome,
                u.foto_perfil as autor_foto
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

// Criar postagem
app.post('/api/postagens', async (req, res) => {
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
            message: 'Postagem criada com sucesso',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar postagem
app.put('/api/postagens/:id', async (req, res) => {
    try {
        const { conteudo, imagem } = req.body;
        const { id } = req.params;

        await db.execute(
            'UPDATE postagens SET conteudo = ?, imagem = ? WHERE id = ?',
            [conteudo, imagem, id]
        );

        res.json({ message: 'Postagem atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar postagem
app.delete('/api/postagens/:id', async (req, res) => {
    try {
        // Deletar comentários e curtidas relacionadas primeiro
        await db.execute('DELETE FROM comentarios WHERE postagem_id = ?', [req.params.id]);
        await db.execute('DELETE FROM curtidas WHERE postagem_id = ?', [req.params.id]);
        
        // Deletar a postagem
        await db.execute('DELETE FROM postagens WHERE id = ?', [req.params.id]);

        res.json({ message: 'Postagem deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar postagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// ROTAS DE COMENTÁRIOS
// ================================

// Listar comentários de uma postagem
app.get('/api/comentarios/postagem/:postId', async (req, res) => {
    try {
        const [comments] = await db.execute(`
            SELECT 
                c.id,
                c.texto,
                c.criado_em,
                u.nome as autor_nome,
                u.foto_perfil as autor_foto
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.postagem_id = ?
            ORDER BY c.criado_em ASC
        `, [req.params.postId]);

        res.json(comments);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar comentário
app.post('/api/comentarios', async (req, res) => {
    try {
        const { usuario_id, postagem_id, texto } = req.body;

        if (!usuario_id || !postagem_id || !texto) {
            return res.status(400).json({ error: 'ID do usuário, ID da postagem e texto são obrigatórios' });
        }

        const [result] = await db.execute(
            'INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES (?, ?, ?)',
            [usuario_id, postagem_id, texto]
        );

        res.status(201).json({
            message: 'Comentário criado com sucesso',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar comentário
app.put('/api/comentarios/:id', async (req, res) => {
    try {
        const { texto } = req.body;
        const { id } = req.params;

        await db.execute('UPDATE comentarios SET texto = ? WHERE id = ?', [texto, id]);
        res.json({ message: 'Comentário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar comentário
app.delete('/api/comentarios/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM comentarios WHERE id = ?', [req.params.id]);
        res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// ROTAS DE CURTIDAS
// ================================

// Curtir/descurtir postagem
app.post('/api/curtidas/toggle', async (req, res) => {
    try {
        const { usuario_id, postagem_id } = req.body;

        if (!usuario_id || !postagem_id) {
            return res.status(400).json({ error: 'ID do usuário e ID da postagem são obrigatórios' });
        }

        // Verificar se já curtiu
        const [existingLike] = await db.execute(
            'SELECT id FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
            [usuario_id, postagem_id]
        );

        if (existingLike.length > 0) {
            // Remove a curtida
            await db.execute(
                'DELETE FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
                [usuario_id, postagem_id]
            );
            res.json({ message: 'Curtida removida', liked: false });
        } else {
            // Adiciona a curtida
            await db.execute(
                'INSERT INTO curtidas (usuario_id, postagem_id) VALUES (?, ?)',
                [usuario_id, postagem_id]
            );
            res.json({ message: 'Postagem curtida', liked: true });
        }
    } catch (error) {
        console.error('Erro ao curtir/descurtir:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Verificar se usuário curtiu uma postagem
app.get('/api/curtidas/check/:userId/:postId', async (req, res) => {
    try {
        const [likes] = await db.execute(
            'SELECT id FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
            [req.params.userId, req.params.postId]
        );

        res.json({ liked: likes.length > 0 });
    } catch (error) {
        console.error('Erro ao verificar curtida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter número de curtidas de uma postagem
app.get('/api/curtidas/count/:postId', async (req, res) => {
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

// ================================
// ROTA DE UPLOAD DE IMAGEM
// ================================

app.post('/api/upload', upload.single('imagem'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            message: 'Imagem enviada com sucesso',
            url: imageUrl
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ================================
// ROTA PRINCIPAL E INICIALIZAÇÃO
// ================================

// Rota principal
app.get('/', (req, res) => {
    res.json({ 
        message: 'API MicroMídia funcionando!',
        endpoints: {
            usuarios: '/api/usuarios',
            postagens: '/api/postagens',
            comentarios: '/api/comentarios',
            curtidas: '/api/curtidas',
            upload: '/api/upload'
        }
    });
});

// Criar diretório de uploads se não existir
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📖 Documentação: http://localhost:${PORT}`);
});
