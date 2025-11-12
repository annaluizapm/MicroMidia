-- ================================================
-- BANCO DE DADOS COMPLETO - MicroMídia
-- Rede Social para Microempreendedores
-- ================================================

CREATE DATABASE IF NOT EXISTS micro_midia;
USE micro_midia;

-- Remover banco existente se necessário (CUIDADO: apaga todos os dados!)
-- DROP DATABASE IF EXISTS micro_midia;
-- CREATE DATABASE micro_midia;
-- USE micro_midia;

-- ================================================
-- TABELA: USUÁRIOS
-- ================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    bio TEXT,
    foto_perfil VARCHAR(500),
    empresa VARCHAR(100),
    segmento VARCHAR(50),
    cargo VARCHAR(100),
    site_empresa VARCHAR(255),
    linkedin VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- ================================================
-- TABELA: NEGÓCIOS
-- ================================================

CREATE TABLE negocios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),
    site VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
);

-- ================================================
-- TABELA: POSTAGENS
-- ================================================

CREATE TABLE postagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Geral',
    tags TEXT,
    imagem VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_criado (criado_em)
);

-- ================================================
-- TABELA: CURTIDAS (Compatibilidade com sistema antigo)
-- ================================================

CREATE TABLE curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (usuario_id, postagem_id),
    INDEX idx_postagem (postagem_id)
);

-- ================================================
-- TABELA: REAÇÕES (RF3 - Sistema completo de reações)
-- ================================================

CREATE TABLE reacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    tipo ENUM('curtir', 'apoiar', 'inspirador', 'util', 'celebrar') DEFAULT 'curtir',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reacao (usuario_id, postagem_id),
    INDEX idx_postagem (postagem_id),
    INDEX idx_tipo (tipo)
);

-- ================================================
-- TABELA: COMENTÁRIOS
-- ================================================

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    INDEX idx_postagem (postagem_id),
    INDEX idx_criado (criado_em)
);

-- ================================================
-- RF2: SISTEMA DE CHAT/MENSAGENS
-- ================================================

CREATE TABLE conversas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('privada', 'grupo') DEFAULT 'privada',
    nome VARCHAR(100),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo)
);

CREATE TABLE participantes_conversa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    ultima_leitura DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participante (conversa_id, usuario_id),
    INDEX idx_usuario (usuario_id)
);

CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    remetente_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_conversa (conversa_id),
    INDEX idx_criado (criado_em)
);

-- ================================================
-- RF5: SISTEMA DE DIAGNÓSTICO COM IA
-- ================================================

CREATE TABLE diagnosticos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empresa VARCHAR(100),
    segmento VARCHAR(50),
    publico_alvo TEXT,
    presenca_digital VARCHAR(50),
    objetivo VARCHAR(50),
    respostas JSON,
    relatorio_ia TEXT,
    score INT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_criado (criado_em)
);

CREATE TABLE recomendacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnostico_id INT NOT NULL,
    categoria VARCHAR(50),
    titulo VARCHAR(200),
    descricao TEXT,
    prioridade ENUM('alta', 'media', 'baixa') DEFAULT 'media',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id) ON DELETE CASCADE,
    INDEX idx_diagnostico (diagnostico_id)
);

-- ================================================
-- FIM DO SCRIPT
-- ================================================