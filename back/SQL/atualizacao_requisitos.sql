-- ================================================
-- ATUALIZAÇÃO DO BANCO DE DADOS - MicroMídia
-- Implementação dos Requisitos Funcionais RF2, RF3, RF4, RF5
-- ================================================

USE micro_midia;

-- ================================================
-- RF4: Perfis Personalizáveis Completos
-- Adicionar campos de negócio, habilidades e interesses aos usuários
-- ================================================

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS empresa VARCHAR(100),
ADD COLUMN IF NOT EXISTS segmento VARCHAR(50),
ADD COLUMN IF NOT EXISTS cargo VARCHAR(100),
ADD COLUMN IF NOT EXISTS habilidades TEXT,
ADD COLUMN IF NOT EXISTS interesses TEXT,
ADD COLUMN IF NOT EXISTS site_empresa VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);

-- ================================================
-- RF2: Sistema de Chat/Mensagens
-- Tabelas para conversas privadas e em grupo
-- ================================================

CREATE TABLE IF NOT EXISTS conversas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('privada', 'grupo') DEFAULT 'privada',
    nome VARCHAR(100),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participantes_conversa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    ultima_leitura DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participante (conversa_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    remetente_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_conversa (conversa_id),
    INDEX idx_criado_em (criado_em)
);

-- ================================================
-- RF3: Sistema de Reações (além de curtidas)
-- Permitir diferentes tipos de reações nas postagens
-- ================================================

CREATE TABLE IF NOT EXISTS reacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    tipo ENUM('curtir', 'apoiar', 'inspirador', 'util', 'celebrar') DEFAULT 'curtir',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reacao (usuario_id, postagem_id)
);

-- ================================================
-- RF5: Formulário de Diagnóstico com IA
-- Armazenar respostas e relatórios gerados
-- ================================================

CREATE TABLE IF NOT EXISTS diagnosticos (
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
    INDEX idx_criado_em (criado_em)
);

CREATE TABLE IF NOT EXISTS recomendacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnostico_id INT NOT NULL,
    categoria VARCHAR(50),
    titulo VARCHAR(200),
    descricao TEXT,
    prioridade ENUM('alta', 'media', 'baixa') DEFAULT 'media',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id) ON DELETE CASCADE
);

-- ================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_postagens_usuario ON postagens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_postagens_criado ON postagens(criado_em);
CREATE INDEX IF NOT EXISTS idx_comentarios_postagem ON comentarios(postagem_id);
CREATE INDEX IF NOT EXISTS idx_curtidas_postagem ON curtidas(postagem_id);

-- ================================================
-- FIM DA ATUALIZAÇÃO
-- ================================================
