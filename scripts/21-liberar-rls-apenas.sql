-- 🔓 DESATIVAR SEGURANÇA PARA MIGRAÇÃO (SEM MUDAR ESTRUTURA)
-- Apenas libera as tabelas para inserção do script

ALTER TABLE public.solicitacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestadores DISABLE ROW LEVEL SECURITY;

-- Confirmação
SELECT 'Permissões liberadas em solicitacoes e prestadores.' as status;
