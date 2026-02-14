-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('solicitante', 'aprovador', 'administrador', 'gestor', 'recepcao')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpar dados existentes
DELETE FROM usuarios;

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, departamento, perfil) VALUES
('João Silva', 'joao@exemplo.com', 'Manutenção', 'solicitante'),
('Maria Oliveira', 'maria@exemplo.com', 'Tecnologia da Informação', 'solicitante'),
('Carlos Santos', 'carlos@exemplo.com', 'Eventos', 'solicitante'),
('Ana Pereira', 'ana@exemplo.com', 'Esportes', 'solicitante'),
('Pedro Costa', 'pedro@exemplo.com', 'Segurança', 'aprovador'),
('Lucia Ferreira', 'lucia@exemplo.com', 'Recursos Humanos', 'aprovador'),
('Roberto Almeida', 'roberto@exemplo.com', 'Diretoria', 'administrador'),
('Fernanda Lima', 'fernanda@exemplo.com', 'Diretoria', 'gestor'),
('Ricardo Souza', 'ricardo@exemplo.com', 'Recepção', 'recepcao'),
('Camila Rocha', 'camila@exemplo.com', 'Recepção', 'recepcao');

-- Criar tabela de solicitações se não existir
CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(20) NOT NULL UNIQUE,
  solicitante VARCHAR(255) NOT NULL,
  departamento VARCHAR(255) NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  data_solicitacao DATE NOT NULL,
  hora_solicitacao TIME NOT NULL,
  tipo_solicitacao VARCHAR(50) NOT NULL CHECK (tipo_solicitacao IN ('checagem_liberacao', 'somente_liberacao')),
  finalidade VARCHAR(50) NOT NULL CHECK (finalidade IN ('evento', 'obra')),
  local VARCHAR(255) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  data_inicial DATE NOT NULL,
  data_final DATE NOT NULL,
  status_geral VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status_geral IN ('pendente', 'aprovado', 'reprovado', 'parcial')),
  observacoes_gerais TEXT,
  economia VARCHAR(50) CHECK (economia IN ('sustentavel', 'dispendioso', 'economico')),
  custo_checagem NUMERIC(10, 2) DEFAULT 0,
  economia_gerada NUMERIC(10, 2) DEFAULT 0,
  despesa_gerada NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de prestadores se não existir
CREATE TABLE IF NOT EXISTS prestadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitacao_id UUID REFERENCES solicitacoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'reprovada', 'vencida', 'excecao')),
  cadastro VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (cadastro IN ('pendente', 'urgente', 'vencida', 'Ok', 'Não Ok')),
  checagem_valida_ate DATE,
  observacoes TEXT,
  aprovado_por VARCHAR(255),
  data_avaliacao TIMESTAMP WITH TIME ZONE,
  horas_restantes INTEGER,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
