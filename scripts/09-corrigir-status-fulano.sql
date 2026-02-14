-- Corrigir status do Fulano para testar a lógica
-- LIBERAÇÃO = "Ok" + CHECAGEM = "Aprovada" → Mostrar ambas as datas

UPDATE prestadores 
SET cadastro = 'ok'
WHERE documento = '222222222' 
   OR documento2 = '222222222'
   OR nome ILIKE '%fulano%';

-- Verificar se a atualização funcionou
SELECT 
    nome,
    documento,
    documento2,
    status as checagem_status,
    cadastro as liberacao_status,
    checagem_valida_ate,
    data_avaliacao
FROM prestadores 
WHERE documento = '222222222' 
   OR documento2 = '222222222'
   OR nome ILIKE '%fulano%';
