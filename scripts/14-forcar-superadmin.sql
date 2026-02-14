-- Script alternativo para forçar a criação do superadmin

-- Primeiro, verificar se o usuário existe
SELECT * FROM usuarios WHERE email = 'mariano.marcus@gmail.com';

-- Remover todas as constraints de perfil temporariamente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS check_perfil;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS perfil_check;

-- Atualizar o perfil diretamente
UPDATE usuarios 
SET perfil = 'superadmin' 
WHERE email = 'mariano.marcus@gmail.com';

-- Recriar a constraint com todos os perfis
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_perfil_check 
CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao', 'suporte', 'superadmin'));

-- Confirmar a mudança
SELECT 'SUCESSO: Usuário atualizado para superadmin' as resultado
WHERE EXISTS (
    SELECT 1 FROM usuarios 
    WHERE email = 'mariano.marcus@gmail.com' 
    AND perfil = 'superadmin'
);
