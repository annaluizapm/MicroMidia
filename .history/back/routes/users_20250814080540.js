const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, nome, email, bio, foto_perfil, criado_em FROM usuarios WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { nome, bio } = req.body;
        
        await db.execute(
            'UPDATE usuarios SET nome = ?, bio = ? WHERE id = ?',
            [nome, bio, req.user.userId]
        );

        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar todos os usuários
router.get('/', async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, nome, email, bio, foto_perfil, criado_em FROM usuarios ORDER BY criado_em DESC'
        );

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
