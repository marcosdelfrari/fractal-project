#!/bin/bash
# Script para executar seed no Railway
# Uso: railway run bash scripts/seed-railway.sh

echo "🌱 Iniciando seed do banco de dados..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não está configurada"
  exit 1
fi

# Executar o seed
npm run db:seed

if [ $? -eq 0 ]; then
  echo "✅ Seed executado com sucesso!"
else
  echo "❌ Erro ao executar seed"
  exit 1
fi
