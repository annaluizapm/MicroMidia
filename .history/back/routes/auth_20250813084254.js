const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
    console.log('📝 Tentativa de cadastro recebida');
    console.log('📦 Body da requisição:', req.body);
    
    try {
        const { nome, email, senha, bio } = req.body;
        
        console.log('🔍 Dados extraídos:', { nome, email, senha: senha ? '[PRESENTE]' : '[AUSENTE]', bio });

        // Verificar se todos os campos obrigatórios estão presentes
        if (!nome || !email || !senha) {
            console.log('❌ Campos obrigatórios ausentes');
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        console.log('🔍 Verificando se usuário já existe...');
        // Verificar se o usuário já existe
        const [existingUser] = await db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            console.log('❌ Email já cadastrado:', email);
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        console.log('🔐 Criando hash da senha...');
        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        console.log('💾 Inserindo usuário no banco...');
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
