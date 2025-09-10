const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Listar comentários de uma postagem
router.get('/post/:postId', async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar comentário
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { postagem_id, texto } = req.body;

        if (!texto || !postagem_id) {
            return res.status(400).json({ error: 'Texto e ID da postagem são obrigatórios' });
        }

        // Verificar se a postagem existe
        const [posts] = await db.execute(
            'SELECT id FROM postagens WHERE id = ?',
            [postagem_id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        const [result] = await db.execute(
            'INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES (?, ?, ?)',
            [req.user.userId, postagem_id, texto]
        );

        res.status(201).json({
            message: 'Comentário criado com sucesso',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar comentário
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { texto } = req.body;

        // Verificar se o comentário pertence ao usuário
        const [comments] = await db.execute(
            'SELECT usuario_id FROM comentarios WHERE id = ?',
            [req.params.id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        if (comments[0].usuario_id !== req.user.userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        await db.execute(
            'UPDATE comentarios SET texto = ? WHERE id = ?',
            [texto, req.params.id]
        );

        res.json({ message: 'Comentário atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar comentário
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Verificar se o comentário pertence ao usuário
        const [comments] = await db.execute(
            'SELECT usuario_id FROM comentarios WHERE id = ?',
            [req.params.id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        if (comments[0].usuario_id !== req.user.userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        await db.execute('DELETE FROM comentarios WHERE id = ?', [req.params.id]);

        res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
