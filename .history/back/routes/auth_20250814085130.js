const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Registro de usuário (simplificado)
router.post('/register', async (req, res) => {
    console.log('📝 Cadastro recebido:', req.body);
    
    try {
        const { nome, email, senha, bio } = req.body;
        
        // Verificar campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        // Verificar se usuário já existe
        const [existingUser] = await db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Inserir usuário (sem hash de senha para simplificar)
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, senha, bio || null]
        );

        console.log('✅ Usuário criado com ID:', result.insertId);
        
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: result.insertId,
                nome,
                email,
                bio
            }
        });

    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro interno: ' + error.message });
    }
});

// Login simplificado (sem JWT)
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT id, nome, email, bio FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];

        res.json({
            message: 'Login realizado com sucesso',
            user: user
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro interno: ' + error.message });
    }
});

module.exports = router;
