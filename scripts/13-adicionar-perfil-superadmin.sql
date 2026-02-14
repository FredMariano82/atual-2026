-- Verificar constraint atual
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'usuarios'::regclass 
AND conname LIKE '%perfil%';

-- Remover constraint antiga se existir
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

-- Adicionar nova constraint incluindo superadmin
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_perfil_check 
CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao', 'suporte', 'superadmin'));

-- Atualizar o usuário para superadmin
UPDATE usuarios 
SET perfil = 'superadmin' 
WHERE email = 'mariano.marcus@gmail.com';

-- Verificar se a atualização funcionou
SELECT nome, email, perfil 
FROM usuarios 
WHERE email = 'mariano.marcus@gmail.com';
