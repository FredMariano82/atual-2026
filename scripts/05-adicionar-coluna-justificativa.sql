-- PRODUÇÃO REAL: Adicionar coluna justificativa na tabela prestadores
DO $$
BEGIN
    -- Verificar se a coluna justificativa já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'prestadores' 
        AND column_name = 'justificativa'
    ) THEN
        -- Adicionar a coluna justificativa
        ALTER TABLE prestadores 
        ADD COLUMN justificativa TEXT;
        
        RAISE NOTICE '✅ PRODUÇÃO: Coluna justificativa adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ PRODUÇÃO: Coluna justificativa já existe!';
    END IF;
    
    -- Verificar se existe dados de justificativa em observacoes e migrar
    UPDATE prestadores 
    SET justificativa = observacoes 
    WHERE observacoes IS NOT NULL 
    AND justificativa IS NULL;
    
    RAISE NOTICE '✅ PRODUÇÃO: Dados migrados de observacoes para justificativa!';
END $$;

-- Verificar a estrutura da tabela em PRODUÇÃO
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'prestadores'
ORDER BY ordinal_position;

-- Verificar dados reais de justificativa
SELECT 
    COUNT(*) as total_prestadores,
    COUNT(justificativa) as com_justificativa,
    COUNT(observacoes) as com_observacoes
FROM prestadores;
