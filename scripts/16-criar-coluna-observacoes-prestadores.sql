-- Criar coluna observacoes na tabela prestadores
ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prestadores' 
AND column_name = 'observacoes';

-- Comentário da coluna
COMMENT ON COLUMN prestadores.observacoes IS 'Observações do administrador quando o status é negado';

-- Verificar estrutura completa da tabela prestadores
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prestadores' 
ORDER BY ordinal_position;
