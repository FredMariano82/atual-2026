-- Adicionar coluna senha na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS senha VARCHAR(255) DEFAULT '123456';

-- Comentário explicativo
COMMENT ON COLUMN usuarios.senha IS 'Senha do usuário (em produção deve ser hash)';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'senha';
