-- Verificar se o usuário gestor existe
SELECT * FROM usuarios WHERE email = 'fernanda@exemplo.com';

-- Se não existir, criar o usuário gestor
INSERT INTO usuarios (nome, email, departamento, perfil) 
VALUES ('Fernanda Lima', 'fernanda@exemplo.com', 'Diretoria', 'gestor')
ON CONFLICT (email) DO NOTHING;

-- Verificar novamente
SELECT * FROM usuarios WHERE perfil = 'gestor';
