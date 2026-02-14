-- Criar tabela para contabilizar economias do sistema
CREATE TABLE IF NOT EXISTS economias_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitante VARCHAR(255) NOT NULL,
    prestador_nome VARCHAR(255) NOT NULL,
    prestador_documento VARCHAR(50) NOT NULL,
    tipo_economia VARCHAR(20) NOT NULL CHECK (tipo_economia IN ('maxima', 'operacional', 'evitado')),
    valor_economizado DECIMAL(10,2) DEFAULT 20.00,
    data_deteccao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detalhes TEXT,
    solicitacao_origem UUID REFERENCES solicitacoes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_economias_solicitante ON economias_sistema(solicitante);
CREATE INDEX IF NOT EXISTS idx_economias_data ON economias_sistema(data_deteccao);
CREATE INDEX IF NOT EXISTS idx_economias_tipo ON economias_sistema(tipo_economia);

-- Comentários para documentação
COMMENT ON TABLE economias_sistema IS 'Registra todas as economias detectadas pelo sistema em tempo real';
COMMENT ON COLUMN economias_sistema.tipo_economia IS 'maxima: prestador já tem tudo | operacional: evita duplicação | evitado: bloqueia inválidos';
COMMENT ON COLUMN economias_sistema.valor_economizado IS 'Valor em reais economizado (padrão R$ 20,00 por checagem evitada)';
COMMENT ON COLUMN economias_sistema.detalhes IS 'Descrição detalhada do que foi detectado pelo sistema';
