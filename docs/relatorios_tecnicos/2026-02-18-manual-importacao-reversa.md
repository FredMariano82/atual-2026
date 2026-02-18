# Manual Técnico: Importação Reversa (Carga Inicial)

**Data:** 18/02/2026
**Objetivo:** Popular o banco de dados Supabase com os usuários ativos do sistema legado (ID Control).

## 1. A Estratégia de "Pesca"

Como o sistema legado não permite "listar todos os usuários" de forma simples (devido à limitação da API), utilizamos uma estratégia alternativa de **varredura completa**.

### Passo 1: Obter Lista de IDs
O script consulta o endpoint `/api/util/getAllUndeletedIds/Users`.
*   **Retorno:** Uma lista bruta com todos os IDs de usuários que já existiram no sistema (ex: `[1001, 1002, 1005, ...]`).
*   **Volume:** Aproximadamente 8.000+ registros.

### Passo 2: Filtragem Inteligente (O Pente Fino)
O robô percorre ID por ID e aplica as seguintes regras de **negócio** para decidir quem entra no sistema novo:

1.  **Tem Data de Validade?**
    *   Se o usuário não tem `dateStartLimit` ou `dateLimit`, é considerado "lixo" ou configuração incompleta. -> **Ignora.**
2.  **Está Vencido há muito tempo?**
    *   (Opcional) Podemos configurar para ignorar quem venceu antes de 2024, por exemplo. Por padrão, traremos todo o histórico válido.

### Passo 3: Criação Dinâmica de Departamentos
Ao encontrar um usuário válido, o robô olha para os grupos dele no ID Control.
*   Se ele pertence ao grupo "Manutenção Predial", o robô verifica no Supabase:
    *   Já existe departamento "Manutenção Predial"?
    *   **Não?** -> **Cria Automaticamente** na tabela `departamentos`.
    *   **Sim?** -> Usa o ID existente.

### Passo 4: Inserção no Supabase
Com o departamento resolvido, o robô insere:
1.  **Prestador:** Nome, RG, CPF, Empresa.
2.  **Solicitação:** Cria uma solicitação com status `aprovado` (pois já está no sistema legado), datas de validade preenchidas e vinculada ao departamento correto.
3.  **Solicitante:** Como não sabemos quem pediu (dado inexistente no legado), o campo `criado_por` será preenchido com um usuário de sistema "MIGRAÇÃO" ou deixado nulo/observação.

## 2. Como Rodar a Importação

O script será salvo em `scripts/reverse-sync.js`.
Para executar (recomendado rodar em horário de baixo uso, pois pode levar horas):

```bash
node scripts/reverse-sync.js
```

## 3. Logs e Monitoramento
O script gera logs detalhados no terminal e em arquivo (`import_log.txt`) para auditoria:
*   `[IMPORT] ID 1045 - Maria Silva - Dept: Limpeza - OK`
*   `[SKIP] ID 1046 - Sem datas definidas`
*   `[NEW DEPT] Criado novo departamento: 'TI'`
