@echo off
echo ===============================================
echo      SALVANDO ALTERACOES NO GIT (BASE LOCAL)
echo ===============================================

echo 1. Adicionando todos os arquivos...
git add .

echo 2. Criando commit com data e hora atual...
set "timestamp=%date% %time%"
git commit -m "Backup automatico: %timestamp%"

echo ===============================================
echo      PRONTO! ALTERACOES SALVAS LOCALMENTE.
echo      Abra o GitHub Desktop para enviar (Push) se necessario.
echo ===============================================
pause
