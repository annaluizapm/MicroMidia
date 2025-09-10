CREATE DATABASE IF NOT EXISTS micro_midia;
USE micro_midia;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    bio TEXT,
    foto_perfil VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE negocios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),
    site VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE postagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    imagem VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (usuario_id, postagem_id)
);

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    postagem_id INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (postagem_id) REFERENCES postagens(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO usuarios (nome, email, senha, bio) VALUES
('Anna Luiza', 'anna@example.com', '$2a$10$example.hash.here', 'Empreendedora apaixonada por inovação'),
('Duda Lisboa', 'duda@example.com', '$2a$10$example.hash.here', 'Consultora em marketing digital');

INSERT INTO postagens (usuario_id, conteudo) VALUES
(1, 'Olá pessoal! Acabei de abrir meu novo negócio e estou cheia de dúvidas sobre marketing digital. Alguém tem dicas?'),
(2, 'Dica importante: sempre validem suas ideias de negócio antes de investir muito dinheiro. Façam pesquisas de mercado!');

INSERT INTO comentarios (usuario_id, postagem_id, texto) VALUES
(2, 1, 'Oi Anna! Parabéns pelo novo negócio! Te mando algumas dicas por DM.'),
(1, 2, 'Excelente dica, Duda! Muito obrigada por compartilhar.');
