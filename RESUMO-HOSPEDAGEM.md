# 📋 Resumo Executivo - Hospedagem Backend e Banco

## 🎯 Situação Atual

- ✅ **Frontend**: Next.js (será hospedado no **Vercel**)
- ⚠️ **Backend**: Node.js/Express na pasta `server/` (precisa hospedar)
- ⚠️ **Banco de Dados**: MySQL com Prisma (precisa hospedar)

---

## 🏆 Recomendação Principal

### **Railway** (Melhor para começar)

**Por quê?**
- ✅ Plano gratuito generoso ($5 crédito/mês)
- ✅ MySQL gerenciado incluído
- ✅ Deploy automático via GitHub
- ✅ Configuração simples
- ✅ SSL automático
- ✅ Suporte nativo ao Prisma

**O que fazer:**
1. Criar conta no Railway (https://railway.app)
2. Adicionar MySQL Database
3. Deploy do backend (pasta `server/`)
4. Configurar variáveis de ambiente
5. Executar migrações do Prisma

**Custo**: Gratuito para começar, depois ~$5-20/mês conforme uso

---

## 🔄 Alternativas

### Opção 2: Render (Gratuito, mas com limitações)
- Backend "dorme" após 15min de inatividade
- Precisa migrar para PostgreSQL (não tem MySQL gratuito)
- **Melhor para**: Projetos pessoais/testes

### Opção 3: PlanetScale + Fly.io (Mais escalável)
- PlanetScale: MySQL serverless excelente
- Fly.io: Backend sempre ativo
- **Melhor para**: Produção séria

---

## 📝 Checklist Rápido

### 1. Preparação
- [ ] Conta criada no Railway (ou alternativa)
- [ ] Repositório no GitHub conectado
- [ ] Variáveis de ambiente listadas

### 2. Banco de Dados
- [ ] MySQL criado no Railway
- [ ] `DATABASE_URL` copiada
- [ ] Migrações executadas (`npx prisma migrate deploy`)

### 3. Backend
- [ ] Serviço Node.js criado no Railway
- [ ] Root directory configurado como `server`
- [ ] Variáveis de ambiente configuradas
- [ ] CORS atualizado com URL do Vercel
- [ ] Deploy realizado com sucesso
- [ ] Health check funcionando (`/health`)

### 4. Frontend (Vercel)
- [ ] Variável `NEXT_PUBLIC_API_URL` apontando para backend
- [ ] `NEXTAUTH_URL` configurado
- [ ] Deploy testado

---

## 🔗 Arquivos de Referência

1. **GUIA-HOSPEDAGEM-BACKEND-BANCO.md** - Guia completo detalhado
2. **VARIAVEIS-AMBIENTE-PRODUCAO.md** - Todas as variáveis necessárias
3. **server/railway.json** - Configuração do Railway
4. **server/render.yaml** - Configuração do Render (alternativa)

---

## ⚡ Quick Start - Railway

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar MySQL
# (Faça pelo dashboard: New → Database → MySQL)

# 5. Linkar ao projeto
railway link

# 6. Adicionar variáveis
railway variables set DATABASE_URL="<url-do-mysql>"
railway variables set FRONTEND_URL="https://seu-app.vercel.app"
railway variables set NEXTAUTH_URL="https://seu-app.vercel.app"

# 7. Executar migrações
cd server
railway run npx prisma migrate deploy
railway run npx prisma generate

# 8. Deploy
railway up
```

---

## 🆘 Problemas Comuns

### Backend não conecta ao banco
- Verifique se `DATABASE_URL` está correta
- Confirme que o banco permite conexões externas
- Verifique SSL (alguns serviços requerem `?sslmode=REQUIRED`)

### CORS errors
- Adicione URL do Vercel em `allowedOrigins` no `server/app.js`
- Verifique se `FRONTEND_URL` está configurada

### Migrações falhando
- Use `prisma migrate deploy` (não `dev`) em produção
- Verifique se o banco está acessível
- Confirme que o schema está atualizado

---

## 💰 Estimativa de Custos

| Serviço | Plano Inicial | Crescimento |
|---------|---------------|-------------|
| **Railway** | Gratuito ($5 crédito) | ~$5-20/mês |
| **Render** | Gratuito | ~$7-25/mês |
| **PlanetScale** | Gratuito (1GB) | ~$29/mês (escalar) |
| **Fly.io** | Gratuito (3 VMs) | ~$5-15/mês |

**Total estimado para começar**: **$0-5/mês**

---

## 📞 Próximos Passos

1. ✅ Leia **GUIA-HOSPEDAGEM-BACKEND-BANCO.md** completo
2. ✅ Configure variáveis em **VARIAVEIS-AMBIENTE-PRODUCAO.md**
3. ✅ Crie conta no Railway
4. ✅ Siga o Quick Start acima
5. ✅ Teste a conexão backend ↔ banco
6. ✅ Configure CORS para Vercel
7. ✅ Faça deploy do frontend no Vercel
8. ✅ Teste tudo funcionando

---

**🎉 Boa sorte com o deploy!**



