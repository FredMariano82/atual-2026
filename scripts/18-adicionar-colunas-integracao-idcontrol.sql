-- Adiciona colunas para controle da integração com ID Control

ALTER TABLE public.prestadores
ADD COLUMN IF NOT EXISTS integrado_id_control BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_control_id BIGINT,
ADD COLUMN IF NOT EXISTS data_integracao TIMESTAMP WITH TIME ZONE;

-- Cria um índice para facilitar a busca dos não-integrados
CREATE INDEX IF NOT EXISTS idx_prestadores_integracao 
ON public.prestadores(integrado_id_control) 
WHERE status = 'aprovado';

COMMENT ON COLUMN public.prestadores.id_control_id IS 'ID do usuário no sistema ID Control (catraca)';
COMMENT ON COLUMN public.prestadores.integrado_id_control IS 'Indica se o registro já foi sincronizado com o ID Control';
