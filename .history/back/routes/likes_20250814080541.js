const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Curtir/descurtir postagem
router.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const { postagem_id } = req.body;

        if (!postagem_id) {
            return res.status(400).json({ error: 'ID da postagem é obrigatório' });
        }

        // Verificar se a postagem existe
        const [posts] = await db.execute(
            'SELECT id FROM postagens WHERE id = ?',
            [postagem_id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        // Verificar se já curtiu
        const [existingLike] = await db.execute(
            'SELECT id FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
            [req.user.userId, postagem_id]
        );

        if (existingLike.length > 0) {
            // Remove a curtida
            await db.execute(
                'DELETE FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
                [req.user.userId, postagem_id]
            );
            res.json({ message: 'Curtida removida', liked: false });
        } else {
            // Adiciona a curtida
            await db.execute(
                'INSERT INTO curtidas (usuario_id, postagem_id) VALUES (?, ?)',
                [req.user.userId, postagem_id]
            );
            res.json({ message: 'Postagem curtida', liked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Verificar se usuário curtiu uma postagem
router.get('/check/:postId', authenticateToken, async (req, res) => {
    try {
        const [likes] = await db.execute(
            'SELECT id FROM curtidas WHERE usuario_id = ? AND postagem_id = ?',
            [req.user.userId, req.params.postId]
        );

        res.json({ liked: likes.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Obter número de curtidas de uma postagem
router.get('/count/:postId', async (req, res) => {
    try {
        const [result] = await db.execute(
            'SELECT COUNT(*) as total FROM curtidas WHERE postagem_id = ?',
            [req.params.postId]
        );

        res.json({ total: result[0].total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
