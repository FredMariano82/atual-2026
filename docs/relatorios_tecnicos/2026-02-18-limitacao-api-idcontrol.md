# Relatório Técnico: Limitação da API ID Control (Sincronização de Usuários)

**Data:** 18/02/2026
**Assunto:** Falha nos endpoints de Listagem e Busca de Usuários
**Impacto:** Impossibilidade de resolução automática de conflitos de RG (Smart Conflict Resolution).

## 1. Contexto
Durante a implementação da funcionalidade de "Resolução Inteligente de Conflitos" (onde o sistema verificaria o CPF de um RG duplicado para decidir se é uma atualização ou um erro), foi necessário utilizar a API do ID Control para buscar usuários existentes pelo número do RG ou listar todos os usuários para filtragem em memória.

## 2. O Problema
Todas as tentativas de listar usuários ou buscar usuários específicos falharam ou retornaram dados insuficientes. Foram testados diversos endpoints documentados e não documentados (via engenharia reversa), com os seguintes resultados:

### Endpoints Testados e Falhas:

| Método | Endpoint | Payload / Query | Resultado | Observação |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/user/list` | `{ "pagination": { "page": 0, "size": 10 } }` | **Erro 400** | Retornou Bad Request (provável falha interna ou de permissão). |
| **POST** | `/api/user/list` | `{ "active": true }` | **Erro 400** | Idem acima. |
| **POST** | `/api/user/list` | `{}` (Vazio) | **Erro 400** | Idem acima. |
| **GET** | `/api/users` | `?page=0&size=10` | **Erro 404** | Endpoint não encontrado (Not Found). |
| **GET** | `/api/user` | `?size=10` | **Erro 405** | Método não permitido (Method Not Allowed). |
| **POST** | `/api/user/search` | `{}` | **Erro 405** | Método não permitido. |
| **POST** | `/api/user/query` | `{}` | **Erro 405** | Método não permitido. |
| **GET** | `/api/util/getAllUndeletedIds/Users` | - | **Sucesso (200)** | Retorna lista de IDs, **MAS** não temos como saber qual ID pertence a qual RG sem consultar um por um. |
| **POST** | `/api/util/load` | `{ "entity": "Users", "ids": [...] }` | **Erro 404** | Endpoint de carregamento em lote não encontrado. |

## 3. Consequências Técnicas
Sem um endpoint funcional de listagem (`list`) ou busca (`search`):
1.  **Cegueira do Script:** O script de sincronização não consegue "ver" o banco de dados do ID Control. Ele só consegue atuar sobre um ID que ele já conhece (salvo no banco local) ou tentar criar um novo.
2.  **Falha na Resolução de Conflito:** Quando tentamos criar um usuário com RG já existente, a API devolve erro `400: RG já cadastrado`. Como não conseguimos consultar *quem* é esse usuário (para checar o CPF), não podemos decidir automaticamente se devemos liberar o RG ou bloquear.
3.  **Fallback Atual:** O sistema captura o erro `400` e converte em status `Reprovado [ERRO RG]`, exigindo intervenção manual.

## 4. Recomendações para Solução Definitiva
Para habilitar a "Resolução Inteligente de Conflitos", é necessário que a equipe responsável pelo ID Control (ou fabricante do software/ti da infraestrutura) verifique:
1.  **Habilitar Endpoint de Listagem:** Garantir que `POST /api/user/list` ou `GET /api/users` esteja funcional e acessível para o usuário da API (`mariano`).
2.  **Permissões:** Verificar se o usuário da API possui permissão de "Visualizar" (View/List) na entidade Usuários.
3.  **Versão da API:** Confirmar a documentação da versão específica instalada (pode ser uma versão antiga com endpoints diferentes).

---
**Status Atual no Código:**
A lógica de resolução de conflitos está implementada no arquivo `scripts/sync-id-control-hebraica.js`, mas depende do retorno da função `fetchAllUsers()`. Assim que a API responder com uma lista válida, a feature funcionará automaticamente sem necessidade de alteração no código.
