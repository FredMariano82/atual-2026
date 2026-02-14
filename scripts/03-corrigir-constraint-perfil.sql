-- Primeiro, vamos ver a constraint atual
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'usuarios'::regclass AND contype = 'c';

-- Remover a constraint antiga
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

-- Criar nova constraint com todos os perfis
ALTER TABLE usuarios ADD CONSTRAINT usuarios_perfil_check 
CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao'));

-- Agora criar o usuário gestor
INSERT INTO usuarios (nome, email, departamento, perfil) 
VALUES ('Fernanda Lima', 'fernanda@exemplo.com', 'Diretoria', 'gestor')
ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT * FROM usuarios WHERE perfil = 'gestor';
