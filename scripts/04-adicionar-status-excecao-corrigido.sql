-- Verificar constraint atual
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'prestadores_status_check';

-- Remover constraint existente
ALTER TABLE prestadores 
DROP CONSTRAINT IF EXISTS prestadores_status_check;

-- Recriar constraint incluindo "excecao"
ALTER TABLE prestadores 
ADD CONSTRAINT prestadores_status_check 
CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'excecao', 'vencida'));

-- Verificar se foi criada corretamente
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'prestadores_status_check';

-- Testar se aceita o novo valor
SELECT 'Constraint criada com sucesso!' as resultado;
