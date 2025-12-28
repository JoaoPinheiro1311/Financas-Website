#!/bin/bash
# Script de inicialização do projeto para macOS/Linux

echo ""
echo "================================"
echo "  Finanças Inteligentes - Setup"
echo "================================"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências Node.js..."
    npm install
fi

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo "Criando ambiente Python..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Ficheiro .env não encontrado!"
    echo "Por favor, crie um ficheiro .env com base em .env.example"
    echo ""
    exit 1
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o projeto:"
echo "   Terminal 1: npm run dev         (Frontend - http://localhost:5174)"
echo "   Terminal 2: python app.py       (Backend - http://localhost:5000)"
echo ""
