-- 1. Garante que o Departamento 'Social' existe
INSERT INTO departamentos (nome)
SELECT 'Social'
WHERE NOT EXISTS (SELECT 1 FROM departamentos WHERE nome = 'Social');

-- 2. Remove usuários antigos (para evitar erro de "duplicate key" ou sujeira)
DELETE FROM usuarios WHERE email IN ('social1@hebraica.org.br', 'social2@hebraica.org.br', 'social3@hebraica.org.br');
DELETE FROM usuarios WHERE email IN ('Social 01', 'Social 02', 'Social 03');

-- 3. Insere os usuários novos com Login Simples
-- A senha é '123456'
INSERT INTO usuarios (nome, email, senha, perfil, departamento, departamento_id)
VALUES 
    ('Pessoa Social 1', 'Social 01', '123456', 'solicitante', 'Social', (SELECT id FROM departamentos WHERE nome = 'Social')),
    ('Pessoa Social 2', 'Social 02', '123456', 'solicitante', 'Social', (SELECT id FROM departamentos WHERE nome = 'Social')),
    ('Pessoa Social 3', 'Social 03', '123456', 'solicitante', 'Social', (SELECT id FROM departamentos WHERE nome = 'Social'));
