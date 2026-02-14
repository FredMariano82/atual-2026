# Script de Backup de Sessão
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupDir = "..\backups\session_$timestamp"

if (!(Test-Path "..\backups")) {
    New-Item -ItemType Directory -Path "..\backups"
}

Write-Host "Criando backup em $backupDir..."
Copy-Item -Path ".\*" -Destination $backupDir -Recururse -Exclude "node_modules",".next",".git"
Write-Host "Backup concluído com sucesso!"
