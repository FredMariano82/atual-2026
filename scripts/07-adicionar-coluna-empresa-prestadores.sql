-- Adicionar coluna empresa na tabela prestadores se não existir
ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS empresa TEXT;

-- Comentário explicativo
COMMENT ON COLUMN prestadores.empresa IS 'Empresa específica do prestador. Se NULL, usar empresa da solicitação.';

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prestadores' AND column_name = 'empresa';
