-- Verificar a estrutura da tabela solicitacoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'solicitacoes' 
ORDER BY ordinal_position;

-- Mostrar algumas solicitações para entender a estrutura
SELECT * FROM solicitacoes LIMIT 3;
