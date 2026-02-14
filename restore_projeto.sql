-- Script de Restauração Gerado Automaticamente (Corrigido para FKs)
-- Copie e cole este conteúdo no SQL Editor do Supabase

CREATE TABLE public.economias_sistema (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    solicitante character varying(255) NOT NULL,
    prestador_nome character varying(255) NOT NULL,
    prestador_documento character varying(50) NOT NULL,
    tipo_economia character varying(20) NOT NULL,
    valor_economizado numeric(10,2) DEFAULT 20.00,
    data_deteccao timestamp with time zone DEFAULT now(),
    detalhes text,
    solicitacao_origem uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT economias_sistema_tipo_economia_check CHECK (((tipo_economia)::text = ANY (ARRAY[('maxima'::character varying)::text, ('operacional'::character varying)::text, ('evitado'::character varying)::text])))
);

CREATE TABLE public.logs_alteracao (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    solicitacao_id uuid,
    prestador_id uuid,
    usuario_id uuid,
    data_alteracao timestamp with time zone DEFAULT now(),
    campo_alterado character varying(100) NOT NULL,
    valor_anterior text,
    valor_novo text,
    justificativa text
);

CREATE TABLE public.prestadores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    solicitacao_id uuid,
    nome character varying(255) NOT NULL,
    documento character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pendente'::character varying,
    checagem_valida_ate date,
    cadastro character varying(20) DEFAULT 'pendente'::character varying,
    justificativa text,
    aprovado_por character varying(255),
    data_avaliacao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    documento2 character varying(50),
    empresa text,
    observacoes text,
    ativo boolean DEFAULT true,
    data_exclusao timestamp without time zone,
    excluido_por character varying(255),
    motivo_exclusao text,
    CONSTRAINT prestadores_cadastro_check CHECK (((cadastro)::text = ANY (ARRAY[('ok'::character varying)::text, ('pendente'::character varying)::text, ('urgente'::character varying)::text, ('negada'::character varying)::text]))),
    CONSTRAINT prestadores_status_check CHECK (((status)::text = ANY (ARRAY[('pendente'::character varying)::text, ('aprovado'::character varying)::text, ('reprovado'::character varying)::text, ('excecao'::character varying)::text, ('vencida'::character varying)::text])))
);

CREATE TABLE public.solicitacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero character varying(50) NOT NULL,
    solicitante character varying(255) NOT NULL,
    departamento character varying(100) NOT NULL,
    usuario_id uuid,
    data_solicitacao date NOT NULL,
    hora_solicitacao time without time zone NOT NULL,
    tipo_solicitacao character varying(30) NOT NULL,
    finalidade character varying(20) NOT NULL,
    local text NOT NULL,
    empresa character varying(255) NOT NULL,
    data_inicial date NOT NULL,
    data_final date NOT NULL,
    status_geral character varying(20) DEFAULT 'pendente'::character varying,
    observacoes_gerais text,
    economia character varying(20),
    custo_checagem numeric(10,2) DEFAULT 0,
    economia_gerada numeric(10,2) DEFAULT 0,
    aprovado_por character varying(255),
    aprovado_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    eh_renovacao boolean DEFAULT false,
    CONSTRAINT solicitacoes_economia_check CHECK (((economia)::text = ANY (ARRAY[('economia1'::character varying)::text, ('economia2'::character varying)::text]))),
    CONSTRAINT solicitacoes_finalidade_check CHECK (((finalidade)::text = ANY (ARRAY[('evento'::character varying)::text, ('obra'::character varying)::text]))),
    CONSTRAINT solicitacoes_status_geral_check CHECK (((status_geral)::text = ANY (ARRAY[('pendente'::character varying)::text, ('aprovado'::character varying)::text, ('reprovado'::character varying)::text, ('parcial'::character varying)::text]))),
    CONSTRAINT solicitacoes_tipo_solicitacao_check CHECK (((tipo_solicitacao)::text = ANY (ARRAY[('checagem_liberacao'::character varying)::text, ('somente_liberacao'::character varying)::text])))
);

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    departamento character varying(100) NOT NULL,
    perfil character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    senha character varying(255) DEFAULT '123456'::character varying,
    CONSTRAINT usuarios_perfil_check CHECK (((perfil)::text = ANY (ARRAY[('solicitante'::character varying)::text, ('aprovador'::character varying)::text, ('administrador'::character varying)::text, ('gestor'::character varying)::text, ('recepcao'::character varying)::text, ('suporte'::character varying)::text, ('superadmin'::character varying)::text])))
);

ALTER TABLE ONLY public.economias_sistema
    ADD CONSTRAINT economias_sistema_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.logs_alteracao
    ADD CONSTRAINT logs_alteracao_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.prestadores
    ADD CONSTRAINT prestadores_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT solicitacoes_numero_key UNIQUE (numero);

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT solicitacoes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.economias_sistema
    ADD CONSTRAINT economias_sistema_solicitacao_origem_fkey FOREIGN KEY (solicitacao_origem) REFERENCES public.solicitacoes(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.logs_alteracao
    ADD CONSTRAINT logs_alteracao_prestador_id_fkey FOREIGN KEY (prestador_id) REFERENCES public.prestadores(id);

ALTER TABLE ONLY public.logs_alteracao
    ADD CONSTRAINT logs_alteracao_solicitacao_id_fkey FOREIGN KEY (solicitacao_id) REFERENCES public.solicitacoes(id);

ALTER TABLE ONLY public.logs_alteracao
    ADD CONSTRAINT logs_alteracao_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);

ALTER TABLE ONLY public.prestadores
    ADD CONSTRAINT prestadores_solicitacao_id_fkey FOREIGN KEY (solicitacao_id) REFERENCES public.solicitacoes(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT solicitacoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- Data for usuarios
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('9c6d1d07-615e-4b3f-a188-fbb87f353055', 'Solicitante MVM', 'solicitante@mvm.com', 'Eventos', 'solicitante', '2025-06-10 15:05:26.054552+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('90235bca-21df-4610-96c5-dd429a9af460', 'Administrador 03', 'administrador03@mvm.com', 'ADM', 'administrador', '2025-06-24 14:23:24.046084+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('150c0b96-83aa-4790-8cd3-835521cb489e', 'Administrador 04', 'administrador04@mvm.com', 'ADM', 'administrador', '2025-06-24 14:23:24.046084+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('daf3875b-6e43-4f20-89bb-dc65710659db', 'Aprovador MVM', 'aprovador@mvm.com', 'Checagem', 'aprovador', '2025-06-10 15:05:26.054552+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('fcfdf327-7fad-4062-87e1-18a77d807f24', 'Administrador MVM', 'admin@mvm.com', 'ADM', 'administrador', '2025-06-10 15:05:26.054552+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('0e598d72-5ccb-450c-b08f-e9cfeba04dbc', 'Patrimônio 02', 'patrimonio02@mvm.com', 'Patrimônio', 'solicitante', '2025-06-24 13:41:58.174703+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('449b5b0c-6749-4da8-b8c0-a1ad55dd989e', 'Patrimônio 03', 'patrimonio03@mvm.com', 'Patrimônio', 'solicitante', '2025-06-24 13:41:58.174703+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('3f378893-7b5d-46e7-91f6-2a440a6baf6b', 'Patrimônio 04', 'patrimonio04@mvm.com', 'Patrimônio', 'solicitante', '2025-06-24 13:41:58.174703+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('355cfb37-099f-4e37-b72e-e7fd8d508457', 'Tatiana', 'tatiana@mvm.com', 'ADM', 'administrador', '2025-06-24 14:23:24.046084+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('e1cb4104-954b-49cb-8036-581ea3795411', 'Carlos Moda', 'carlos.moda@mvm.com', 'Patrimônio', 'solicitante', '2025-06-24 13:41:58.174703+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('e6044617-0217-4c71-8ed2-9c83617710c7', 'Mariano', 'mariano.marcus@gmail.com', 'TI - Suporte', 'superadmin', '2025-06-22 02:01:50.027025+00', '428182');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('ae5a48dd-963f-4a22-b08c-4c3a47daaa79', 'Eventos 01', 'eventos01@mvm.com', 'Eventos', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('53cc90ca-f3cb-40b1-8894-1ad4d6c9cf9a', 'Eventos 02', 'eventos02@mvm.com', 'Eventos', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('ef2f2f5e-f0a0-48cf-b3cf-1ac5f678188f', 'Eventos 03', 'eventos03@mvm.com', 'Eventos', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('4bdc9a43-c9c5-4d0b-9c41-f48dab010cb0', 'Eventos 04', 'eventos04@mvm.com', 'Eventos', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('caec51ac-acb7-4f5e-a72e-64df140529af', 'Social 01', 'social01@mvm.com', 'Social', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('0668aa98-a380-4672-a5c0-c6a9f55affb7', 'Social 02', 'social02@mvm.com', 'Social', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('2e43e5c5-569b-4780-a27b-21808637c033', 'Social 03', 'social03@mvm.com', 'Social', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('31754901-6e08-4c40-93a0-773584976743', 'Social 04', 'social04@mvm.com', 'Social', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('9a0a7a57-42e1-4042-9e8a-a3aa6e6b49f4', 'Agenda 01', 'agenda01@mvm.com', 'Agenda', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('4efbc990-6038-4e32-be28-5f84f124ad25', 'Agenda 02', 'agenda02@mvm.com', 'Agenda', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('9722b3c7-8327-487b-8f58-fe662ace0201', 'Agenda 03', 'agenda03@mvm.com', 'Agenda', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('ea82d2ae-cbdb-430e-a084-a11d38686041', 'Agenda 04', 'agenda04@mvm.com', 'Agenda', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('88bef24d-7d8e-42cb-91ea-4a941f8fa558', 'Esportivo 01', 'esportivo01@mvm.com', 'Esportivo', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('678d0b42-7c1f-4476-8645-e49fd5cf86d5', 'Esportivo 02', 'esportivo02@mvm.com', 'Esportivo', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('f11c2889-df74-436c-b7cd-afe9f6cc3c5f', 'Esportivo 03', 'esportivo03@mvm.com', 'Esportivo', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('1652cec0-9a03-468c-8f66-38ce94e3b18c', 'Esportivo 04', 'esportivo04@mvm.com', 'Esportivo', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('9e44351e-f52d-42cc-8cdd-b97ba26de652', 'Concessões 01', 'concessoes01@mvm.com', 'Concessões', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('7ad926c8-a700-44ec-b4ef-e0a6176a4ead', 'Concessões 02', 'concessoes02@mvm.com', 'Concessões', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('01982ad8-d16e-44b8-a35a-6739955536f7', 'Concessões 03', 'concessoes03@mvm.com', 'Concessões', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('2af8ca4e-9e32-4f64-b8ef-ec1880c0f218', 'Concessões 04', 'concessoes04@mvm.com', 'Concessões', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('b37640c8-e954-4fb9-a7ad-7e094d7cb405', 'Cultural 01', 'cultural01@mvm.com', 'Cultural', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('de14b3e1-3486-4d72-a68c-1850b9335068', 'Cultural 02', 'cultural02@mvm.com', 'Cultural', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('6441f712-5f15-45b7-a785-c451d60f27ef', 'Cultural 03', 'cultural03@mvm.com', 'Cultural', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('5e165fce-26ad-47da-b240-cb2e8e917456', 'Cultural 04', 'cultural04@mvm.com', 'Cultural', 'solicitante', '2025-06-24 14:21:22.154854+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('3e265496-52b5-46ab-b37e-77929d99133e', 'Ruth', 'ruth@mvm.com', 'ADM', 'administrador', '2025-06-24 14:23:24.046084+00', '123456');
INSERT INTO public.usuarios (id, nome, email, departamento, perfil, created_at, senha) VALUES ('9c1ca1cd-3e18-41c2-bf67-39d31b77c7c6', 'Daniel Cohen', 'cohen@mvm.com', 'Diretoria', 'gestor', '2025-06-14 12:51:57.730268+00', '123456');

-- Data for solicitacoes
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('76174872-703d-4384-9cb1-d01be993665c', '2025-000001', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-04', '14:56:37', 'checagem_liberacao', 'evento', 'Teatro Arthur / Bat Mitzva', 'MVM', '2025-07-04', '2025-07-05', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-07-04 17:55:59.748716+00', '2025-07-04 17:56:58.794+00', 'f');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('54e616f6-d6fd-44a7-8134-3fbd3e26145c', '2025-000002', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-04', '14:58:51', 'somente_liberacao', 'evento', 'Teatro Arthur / Bat Mitzva', 'MVM', '2025-07-04', '2025-07-06', 'pendente', NULL, NULL, '0.00', '0.00', NULL, NULL, '2025-07-04 17:58:13.400348+00', '2025-07-04 17:58:13.400348+00', 't');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('427bbf06-707e-4cf1-a7d1-4eb404c6a1ee', '2025-000003', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-04', '15:29:55', 'checagem_liberacao', 'obra', 'tEATRO', 'MVM', '2025-07-04', '2025-07-05', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-07-04 18:29:17.036179+00', '2025-07-04 18:30:09.016+00', 'f');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('92d5eec3-a10d-4312-a7c3-d56eb938e326', '2025-000005', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-04', '17:12:02', 'checagem_liberacao', 'evento', 'Departamento Medico', 'SAUDE', '2025-07-04', '2025-07-04', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-07-04 20:11:24.606741+00', '2025-07-04 20:12:43.401+00', 'f');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('368e5b68-db8d-4110-bd1b-7e9b285f3f99', '2025-000004', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-04', '16:41:05', 'checagem_liberacao', 'evento', 'Central de Monitoramento', 'MT', '2025-07-04', '2025-09-01', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-07-04 19:40:27.080171+00', '2025-07-04 20:12:48.443+00', 'f');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('b8a0b7e9-ed6f-498b-a26a-62df65bb981a', '2025-000006', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-05', '06:22:10', 'somente_liberacao', 'obra', 'tEATRO', 'MVM', '2025-07-05', '2025-07-08', 'pendente', NULL, NULL, '0.00', '0.00', NULL, NULL, '2025-07-05 09:22:10.31334+00', '2025-07-05 09:22:10.31334+00', 't');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('6e309c78-a5ca-4548-afac-463bbfff7eb9', '2025-000007', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-07-05', '06:23:45', 'checagem_liberacao', 'evento', 'Teatriok', 'gggg', '2025-07-05', '2025-07-07', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-07-05 09:23:45.184361+00', '2025-07-09 14:42:13.679+00', 'f');
INSERT INTO public.solicitacoes (id, numero, solicitante, departamento, usuario_id, data_solicitacao, hora_solicitacao, tipo_solicitacao, finalidade, local, empresa, data_inicial, data_final, status_geral, observacoes_gerais, economia, custo_checagem, economia_gerada, aprovado_por, aprovado_em, created_at, updated_at, eh_renovacao) VALUES ('a4d7d5ef-072f-4b0f-b0db-2046e9ba1815', '2025-000008', 'Carlos Moda', 'Patrimônio', 'e1cb4104-954b-49cb-8036-581ea3795411', '2025-08-04', '00:26:53', 'checagem_liberacao', 'obra', 'Quadra de Tênis', 'HMD', '2025-08-06', '2025-08-08', 'aprovado', NULL, NULL, '20.00', '0.00', NULL, NULL, '2025-08-04 03:26:53.720957+00', '2025-08-04 03:29:55.644+00', 'f');

-- Data for prestadores
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('1066ae29-ea68-4df2-9cf3-26a453827505', 'b8a0b7e9-ed6f-498b-a26a-62df65bb981a', 'Ligia', '222222', 'aprovado', '2026-01-04', 'ok', NULL, NULL, NULL, '2025-07-05 09:22:10.410777+00', '2025-07-09 14:44:53.29+00', NULL, 'MVM', NULL, 'f', '2025-07-09 14:44:53.29', 'Carlos Moda', 'Limpeza da interface - Solicitação 2025-000006');
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('f0491a44-8d38-4855-990c-f5c02a2a7387', '76174872-703d-4384-9cb1-d01be993665c', 'Mariano', '111111', 'aprovado', '2026-01-04', 'ok', NULL, 'Sistema', '2025-07-04 17:56:58.491+00', '2025-07-04 17:55:59.793343+00', '2025-07-04 17:58:51.954+00', NULL, 'MVM', NULL, 'f', '2025-07-04 17:58:51.954', 'Carlos Moda', 'Renovação para 2025-000002');
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('4dc9e12c-99d8-4346-828a-a50d7d7ee17a', '54e616f6-d6fd-44a7-8134-3fbd3e26145c', 'Mariano', '111111', 'aprovado', '2026-01-04', 'ok', NULL, NULL, NULL, '2025-07-04 17:58:13.440356+00', '2025-07-04 18:10:19.48+00', NULL, 'MVM', NULL, 'f', '2025-07-04 18:10:19.48', 'Carlos Moda', 'Excluído da interface de liberações - Solicitação 2025-000002');
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('bf7b1267-aa15-46b5-aec6-ef63b245775f', '427bbf06-707e-4cf1-a7d1-4eb404c6a1ee', 'Ligia', '222222', 'aprovado', '2026-01-04', 'ok', NULL, 'Sistema', '2025-07-04 18:30:08.759+00', '2025-07-04 18:29:17.084067+00', '2025-07-05 09:22:10.708+00', NULL, 'MVM', NULL, 'f', '2025-07-05 09:22:10.708', 'Carlos Moda', 'Renovação para 2025-000006');
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('695c42cd-0879-4a8b-876a-0ac7f3b151e2', '92d5eec3-a10d-4312-a7c3-d56eb938e326', 'Tiago', '555555', 'aprovado', '2026-01-04', 'ok', NULL, 'Sistema', '2025-07-04 20:12:43.139+00', '2025-07-04 20:11:24.659418+00', '2025-07-05 09:22:32.857+00', NULL, 'SAUDE', NULL, 'f', '2025-07-05 09:22:32.857', 'Carlos Moda', 'Limpeza da interface - Solicitação 2025-000005');
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('767223a5-378d-4986-8c14-376a50de53f5', '6e309c78-a5ca-4548-afac-463bbfff7eb9', 'Lima', '666666', 'aprovado', '2026-01-09', 'ok', NULL, 'Sistema', '2025-07-09 14:42:13.371+00', '2025-07-05 09:23:45.223377+00', '2025-07-09 14:42:57.027+00', NULL, 'gggg', NULL, 't', NULL, NULL, NULL);
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('168d61a2-735c-4b34-84a2-a00949a9e0ac', '368e5b68-db8d-4110-bd1b-7e9b285f3f99', 'Mariano', '111111', 'aprovado', '2026-01-04', 'ok', NULL, 'Sistema', '2025-07-04 20:12:48.162+00', '2025-07-04 19:40:27.161098+00', '2025-07-09 14:43:09.406+00', NULL, 'MT', NULL, 't', NULL, NULL, NULL);
INSERT INTO public.prestadores (id, solicitacao_id, nome, documento, status, checagem_valida_ate, cadastro, justificativa, aprovado_por, data_avaliacao, created_at, updated_at, documento2, empresa, observacoes, ativo, data_exclusao, excluido_por, motivo_exclusao) VALUES ('7f2c5256-b908-40c1-8cda-dce5bfc4f90e', 'a4d7d5ef-072f-4b0f-b0db-2046e9ba1815', 'Mariano', '444444', 'aprovado', '2026-02-04', 'ok', NULL, 'Sistema', '2025-08-04 03:29:55.429+00', '2025-08-04 03:26:53.844168+00', '2025-08-04 03:33:12.076+00', NULL, 'HMD', NULL, 't', NULL, NULL, NULL);

-- Data for logs_alteracao

-- Data for economias_sistema
INSERT INTO public.economias_sistema (id, solicitante, prestador_nome, prestador_documento, tipo_economia, valor_economizado, data_deteccao, detalhes, solicitacao_origem, created_at) VALUES ('23a6a683-2d36-4535-bd21-a11ed801667c', 'Carlos Moda', 'Ligia', '222222', 'maxima', '20.00', '2025-07-04 19:47:33.651183+00', 'Checagem desnecessária evitada - válida até 04/01/2026', NULL, '2025-07-04 19:47:33.651183+00');
INSERT INTO public.economias_sistema (id, solicitante, prestador_nome, prestador_documento, tipo_economia, valor_economizado, data_deteccao, detalhes, solicitacao_origem, created_at) VALUES ('87edcc6d-c264-41e3-8936-e26fb6b2dfbe', 'Carlos Moda', 'Mariano', '444444', 'maxima', '20.00', '2025-08-04 03:39:49.238146+00', 'Checagem desnecessária evitada - válida até 04/02/2026', NULL, '2025-08-04 03:39:49.238146+00');
