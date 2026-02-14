---
description: Sincroniza as alterações locais com o repositório GitHub ao final da sessão.
---

Este workflow automatiza o processo de commit e push para o GitHub.

1. Verifica o status do repositório
// turbo
2. Adiciona todas as alterações
   ```powershell
   git add .
   ```
// turbo
3. Realiza o commit com mensagem automática (data e hora)
   ```powershell
   $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm"
   git commit -m "Backup de sessão: $currentDate"
   ```
// turbo
4. Envia para o branch principal (main) no GitHub
   ```powershell
   git push origin main
   ```

> [!TIP]
> Use este workflow sempre que quiser salvar seu progresso no GitHub para continuar de outro computador.
