-- 🔓 DESATIVAR SEGURANÇA PARA MIGRAÇÃO 🔓
-- Este comando desativa as regras de bloqueio (RLS) da tabela prestadores.
-- Isso permite que o script preencha o banco sem erros de permissão.

ALTER TABLE public.prestadores DISABLE ROW LEVEL SECURITY;

-- Confirmação
SELECT 'Segurança desativada. Pode rodar a migração!' as status;
