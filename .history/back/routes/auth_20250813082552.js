const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, bio } = req.body;

        // Verificar se o usuário já existe
        const [existingUser] = await db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Inserir usuário
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, bio) VALUES (?, ?, ?, ?)',
            [nome, email, hashedPassword, bio || null]
        );

        // Gerar token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: result.insertId,
                nome,
                email,
                bio
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT id, nome, email, senha, bio, foto_perfil FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];

        // Verificar senha
        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                bio: user.bio,
                foto_perfil: user.foto_perfil
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
