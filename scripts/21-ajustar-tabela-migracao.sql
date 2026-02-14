-- 🛠️ AJUSTE DE TABELA PARA MIGRAÇÃO
-- Adiciona colunas de data que estão faltando e libera permissões

-- 1. Cria colunas de data (se não existirem)
ALTER TABLE public.prestadores 
ADD COLUMN IF NOT EXISTS data_inicial TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS data_final TIMESTAMP WITH TIME ZONE;

-- 2. Garante que empresa existe também
ALTER TABLE public.prestadores 
ADD COLUMN IF NOT EXISTS empresa TEXT;

-- 3. Desativa segurança (RLS) para permitir a carga em massa
ALTER TABLE public.prestadores DISABLE ROW LEVEL SECURITY;

-- Confirmação
SELECT 'Tabela ajustada e segurança liberada com sucesso.' as status;
