#!/bin/bash

# Script de deploy manual (alternativa ao GitHub Actions)
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy..."

# Configurações (edite conforme necessário)
VPS_USER="seu-usuario"
VPS_HOST="seu-ip-ou-dominio"
VPS_PATH="/home/seu-usuario/login-app"

# Fazer deploy via rsync
echo "📦 Enviando arquivos..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude 'users.json' \
           --exclude '.env' \
           ./ $VPS_USER@$VPS_HOST:$VPS_PATH/

# Executar comandos remotos
echo "🔧 Instalando dependências e reiniciando..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /home/seu-usuario/login-app
npm install --production
pm2 restart login-app || pm2 start server.js --name login-app
pm2 save
ENDSSH

echo "✅ Deploy concluído!"
