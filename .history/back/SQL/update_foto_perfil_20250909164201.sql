-- Script para atualizar a estrutura da tabela usuarios
-- Execute este script no seu banco de dados MySQL

USE micro_midia;

-- Alterar o tipo da coluna foto_perfil de BLOB para VARCHAR
ALTER TABLE usuarios MODIFY COLUMN foto_perfil VARCHAR(500);
