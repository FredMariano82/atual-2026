-- Adicionar coluna observacoes na tabela prestadores se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna observacoes já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prestadores' 
        AND column_name = 'observacoes'
    ) THEN
        -- Adicionar a coluna observacoes
        ALTER TABLE prestadores ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada com sucesso na tabela prestadores';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe na tabela prestadores';
    END IF;
    
    -- Verificar se o valor 'negada' já existe no enum (se for enum)
    -- Como estamos usando TEXT, não precisamos alterar enum
    
END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prestadores' 
AND column_name IN ('observacoes', 'cadastro')
ORDER BY column_name;
