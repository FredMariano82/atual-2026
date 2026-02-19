# Roadmap de Expansão do Sistema

Este documento registra as ideias e planos futuros para a evolução do sistema, visando centralizar operações e eliminar dependências externas.

## 1. Substituição do Airtable (Prioridade Média)
**Objetivo:** Eliminar custos e limitações de automação da plataforma Airtable, migrando fluxos de trabalho para o ecossistema Next.js + Supabase.

### Problemas Atuais
- Limite mensal de execuções de automação ("gatilhos").
- Interrupção de serviços críticos no final do mês.
- Dependência de plataforma de terceiro (Vendor Lock-in).

### Solução Proposta
- **Banco de Dados:** Migrar tabelas do Airtable para o PostgreSQL (Supabase).
- **Automação:** Substituir gatilhos do Airtable por:
    - **Supabase Database Webhooks:** Para reagir a mudanças de dados em tempo real.
    - **Cron Jobs (pg_cron):** Para tarefas agendadas (ex: relatórios diários, varreduras).
    - **Edge Functions:** Para lógicas complexas de integração.
- **Interface:** Recriar as "Views" do Airtable (Grid, Kanban, Calendário) dentro da aplicação atual, customizadas para a necessidade exata da operação.

---

## 2. Monitoramento Inteligente de CFTV (DVRs Tecvoz) - (Visão Futura)
**Objetivo:** Automatizar a verificação de funcionamento e posicionamento de câmeras de segurança.

### Conceito
Um "robô" de software que acessa os DVRs periodicamente e valida a saúde do sistema de câmeras.

### Funcionalidades Planejadas
1.  **Varredura Diária (Horário Fixo):**
    - A comparação **deve** ocorrer apenas 1 vez ao dia, preferencialmente no mesmo horário (ex: 12:00h) para evitar erros causados por mudança de iluminação (dia vs noite).
2.  **Snapshot de Referência:** O sistema armazena uma "foto modelo" (Golden Image) de como cada câmera *deveria* estar.
3.  **Comparação Visual (Computer Vision):**
    - O sistema captura o frame atual da câmera.
    - Compara com a "foto modelo".
    - Algoritmo de diferença de imagem (Pixel Diff / SSIM) detecta alterações significativas.
4.  **Dashboard de Status:** Visualização simplificada (Matriz de Bolinhas):
    - 🟢 **Verde:** Imagem OK (similaridade alta com o modelo).
    - 🟡 **Amarelo:** Alerta de Posicionamento (câmera mexeu, obstrução, foco ruim).
    - 🔴 **Vermelho:** Offline / Perda de Sinal (tela preta, "No Signal").

### Desafios Técnicos & Requisitos
- **Acesso RTSP/Snapshot:** Precisamos descobrir se os DVRs Tecvoz permitem pegar uma foto via URL (ex: `http://dvr-ip/snapshot.jpg`). Se tiverem API ou RTSP, é totalmente viável.
- **Processamento de Imagem:** Utilizar bibliotecas como `sharp` (Node.js) ou serviços de IA para a comparação visual.
- **Rede Local:** O servidor (ou um "agente" na rede local) precisará ter acesso direto aos IPs dos DVRs.

---

## Próximos Passos Sugeridos
1.  **Concluir Migração ID Control:** Foco total até fechar a integração de usuários.
2.  **Mapear Fluxos Airtable:** Documentar quais automações são críticas para priorizar na migração.
3.  **Prova de Conceito (POC) DVR:** Testar manualmente se conseguimos pegar um snapshot de um DVR via navegador/código.
