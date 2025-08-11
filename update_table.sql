-- Script para atualizar a tabela clientes com campos de data e hora separados
-- Execute este script no seu banco de dados MySQL se a tabela já existir

-- Remover colunas antigas se existirem
ALTER TABLE clientes 
DROP COLUMN IF EXISTS data_cadastro,
DROP COLUMN IF EXISTS data_modificacao;

-- Adicionar colunas de data e hora separadas se não existirem
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS data DATE,
ADD COLUMN IF NOT EXISTS hora TIME;

-- Atualizar registros existentes com data e hora atual se os campos estiverem vazios
UPDATE clientes 
SET data = CURDATE(), hora = CURTIME() 
WHERE data IS NULL OR hora IS NULL;

-- Verificar a estrutura da tabela
DESCRIBE clientes;
