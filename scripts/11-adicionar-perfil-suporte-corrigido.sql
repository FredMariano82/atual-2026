-- Adicionar perfil 'suporte' à constraint existente
ALTER TABLE usuarios 
DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_perfil_check 
CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao', 'suporte'));

-- Inserir usuário de suporte para testes (sem senha_hash)
INSERT INTO usuarios (nome, email, departamento, perfil) 
VALUES (
  'Suporte Sistema',
  'suporte@hebraica.com.br',
  'TI - Suporte',
  'suporte'
) 
ON CONFLICT (email) DO UPDATE SET
  perfil = 'suporte',
  departamento = 'TI - Suporte';

-- Verificar se foi criado
SELECT nome, email, perfil, departamento 
FROM usuarios 
WHERE perfil = 'suporte';
