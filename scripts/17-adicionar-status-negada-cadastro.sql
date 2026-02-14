-- Adicionar status 'negada' ao campo cadastro da tabela prestadores
-- Data: 2025-01-24

-- Remover constraint existente
ALTER TABLE prestadores DROP CONSTRAINT IF EXISTS prestadores_cadastro_check;

-- Criar nova constraint incluindo 'negada'
ALTER TABLE prestadores ADD CONSTRAINT prestadores_cadastro_check 
CHECK (cadastro::text = ANY (ARRAY[
    'ok'::character varying, 
    'pendente'::character varying, 
    'urgente'::character varying, 
    'negada'::character varying
]::text[]));

-- Verificar se a constraint foi criada corretamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name = 'prestadores_cadastro_check';
