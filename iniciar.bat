@echo off
echo.
echo ========================================
echo Sistema de Fila de Atendimento
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Instale o Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha na instalacao das dependencias
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias ja estao instaladas
)

echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.
echo Acesse as interfaces em:
echo.
echo   Usuario (Retirada de Senha):
echo   http://localhost:3000/usuario
echo.
echo   Atendente (Chamada de Senhas):
echo   http://localhost:3000/atendente
echo.
echo   Painel Publico (Exibicao em TV):
echo   http://localhost:3000/painel
echo.
echo   Admin (Gerenciamento):
echo   http://localhost:3000/admin
echo.
echo   Senha de Admin: AGR.Senhas
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

node server.js
