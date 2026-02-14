-- 🗑️ LIMPEZA DA MIGRAÇÃO ABORTADA

-- 1. Remover prestadores vinculados à solicitação de migração
DELETE FROM public.prestadores 
WHERE solicitacao_id IN (
    SELECT id FROM public.solicitacoes WHERE numero = '2024-MIGRACAO'
);

-- 2. Remover a solicitação de migração
DELETE FROM public.solicitacoes 
WHERE numero = '2024-MIGRACAO';

-- 3. Remover usuário de sistema (opcional, mas bom pra limpar)
-- Nota: Delete em auth.users é protegido, vamos focar em limpar os dados públicos
DELETE FROM public.usuarios 
WHERE email LIKE 'migracao_%@sistema.com';

SELECT 'Limpeza concluída com sucesso.' as status;
