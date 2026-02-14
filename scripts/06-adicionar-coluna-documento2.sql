-- Adicionar coluna documento2 na tabela prestadores
DO $$
BEGIN
    -- Verificar se a coluna já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'prestadores' 
        AND column_name = 'documento2'
    ) THEN
        -- Adicionar a coluna documento2
        ALTER TABLE prestadores ADD COLUMN documento2 VARCHAR(50);
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_prestadores_documento2 ON prestadores(documento2);
        
        RAISE NOTICE 'Coluna documento2 adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna documento2 já existe!';
    END IF;
END $$;

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prestadores' 
ORDER BY ordinal_position;
