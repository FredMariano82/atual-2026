-- Ajuste para simplificar o login (trocando email por nome de usuário)

-- Social 1 -> Social 01
UPDATE usuarios 
SET email = 'Social 01' 
WHERE email = 'social1@hebraica.org.br';

-- Social 2 -> Social 02
UPDATE usuarios 
SET email = 'Social 02' 
WHERE email = 'social2@hebraica.org.br';

-- Social 3 -> Social 03
UPDATE usuarios 
SET email = 'Social 03' 
WHERE email = 'social3@hebraica.org.br';

-- Verificação
SELECT * FROM usuarios WHERE departamento = 'Social';
