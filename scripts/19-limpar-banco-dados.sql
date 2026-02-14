-- ⚠️ ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS DO SISTEMA ⚠️
-- Ele limpa as tabelas e reinicia os contadores de ID.
-- Execute apenas se tiver certeza que quer zerar tudo.

-- Desabilita verificação de chave estrangeira temporariamente para permitir truncate em qualquer ordem
SET session_replication_role = 'replica';

-- Limpar tabelas principais
TRUNCATE TABLE public.solicitacoes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.prestadores RESTART IDENTITY CASCADE;

-- Limpar tabelas auxiliares (se existirem)
TRUNCATE TABLE public.historico_excel RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.economias RESTART IDENTITY CASCADE;

-- Habilita verificação novamente
SET session_replication_role = 'origin';

-- Confirmação
SELECT 'Banco de dados limpo com sucesso. Todos os registros foram apagados.' as status;
