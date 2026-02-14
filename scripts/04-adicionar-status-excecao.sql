-- Adicionar o status "excecao" à constraint existente
ALTER TABLE prestadores 
DROP CONSTRAINT IF EXISTS prestadores_status_check;

-- Recriar a constraint incluindo "excecao"
ALTER TABLE prestadores 
ADD CONSTRAINT prestadores_status_check 
CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'excecao', 'vencida'));

-- Verificar se a constraint foi criada corretamente
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'prestadores_status_check';
