@echo off
REM Script de inicialização do projeto para Windows
REM Este script inicia o frontend e backend em paralelo

echo.
echo ================================
echo  Finanças Inteligentes - Setup
echo ================================
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Instalando dependências Node.js...
    call npm install
)

REM Verificar se venv existe
if not exist "venv" (
    echo Criando ambiente Python...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

REM Verificar .env
if not exist ".env" (
    echo.
    echo ⚠️  Ficheiro .env não encontrado!
    echo Por favor, crie um ficheiro .env com base em .env.example
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Setup concluído!
echo.
echo Para iniciar o projeto:
echo   Terminal 1: npm run dev         (Frontend - http://localhost:5174)
echo   Terminal 2: python app.py       (Backend - http://localhost:5000)
echo.
pause
