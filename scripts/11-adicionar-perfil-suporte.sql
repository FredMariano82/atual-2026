-- Adicionar perfil 'suporte' à constraint existente
ALTER TABLE usuarios 
DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_perfil_check 
CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao', 'suporte'));

-- Inserir usuário de suporte para testes
INSERT INTO usuarios (nome, email, departamento, perfil, senha_hash) 
VALUES (
  'Suporte Sistema',
  'suporte@hebraica.com.br',
  'TI - Suporte',
  'suporte',
  '$2b$10$exemplo_hash_senha_suporte'
) 
ON CONFLICT (email) DO UPDATE SET
  perfil = 'suporte',
  departamento = 'TI - Suporte';

-- Verificar se foi criado
SELECT nome, email, perfil, departamento 
FROM usuarios 
WHERE perfil = 'suporte';
