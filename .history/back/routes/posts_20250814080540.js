const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Listar todas as postagens
router.get('/', async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter uma postagem específica
router.get('/:id', async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova postagem
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { conteudo, imagem } = req.body;

        if (!conteudo) {
            return res.status(400).json({ error: 'Conteúdo é obrigatório' });
        }

        const [result] = await db.execute(
            'INSERT INTO postagens (usuario_id, conteudo, imagem) VALUES (?, ?, ?)',
            [req.user.userId, conteudo, imagem || null]
        );

        res.status(201).json({
            message: 'Postagem criada com sucesso',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar postagem
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { conteudo, imagem } = req.body;

        // Verificar se a postagem pertence ao usuário
        const [posts] = await db.execute(
            'SELECT usuario_id FROM postagens WHERE id = ?',
            [req.params.id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        if (posts[0].usuario_id !== req.user.userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        await db.execute(
            'UPDATE postagens SET conteudo = ?, imagem = ? WHERE id = ?',
            [conteudo, imagem || null, req.params.id]
        );

        res.json({ message: 'Postagem atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar postagem
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Verificar se a postagem pertence ao usuário
        const [posts] = await db.execute(
            'SELECT usuario_id FROM postagens WHERE id = ?',
            [req.params.id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        if (posts[0].usuario_id !== req.user.userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        // Deletar comentários e curtidas relacionadas primeiro
        await db.execute('DELETE FROM comentarios WHERE postagem_id = ?', [req.params.id]);
        await db.execute('DELETE FROM curtidas WHERE postagem_id = ?', [req.params.id]);
        
        // Deletar a postagem
        await db.execute('DELETE FROM postagens WHERE id = ?', [req.params.id]);

        res.json({ message: 'Postagem deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
