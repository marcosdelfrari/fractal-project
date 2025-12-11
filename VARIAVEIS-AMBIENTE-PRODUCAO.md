# 🔐 Variáveis de Ambiente para Produção

Este documento lista todas as variáveis de ambiente necessárias para o deploy em produção.

---

## 📦 Backend (Railway/Render/Fly.io)

### Variáveis Obrigatórias

```env
# Ambiente
NODE_ENV=production
PORT=3001

# Banco de Dados
DATABASE_URL="mysql://usuario:senha@host:porta/nome_banco?sslmode=REQUIRED"

# URLs do Frontend (Vercel)
FRONTEND_URL=https://seu-app.vercel.app
NEXTAUTH_URL=https://seu-app.vercel.app

# Resend Email (se estiver usando)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@seudominio.com
APP_NAME=Fractal Shop

# JWT Secret (gere uma chave forte)
JWT_SECRET=uma-chave-super-secreta-e-longa-aqui

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/
```

### Como Gerar NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use um gerador online: https://generate-secret.vercel.app/32

---

## 🌐 Frontend (Vercel)

### Variáveis Obrigatórias

```env
# NextAuth
NEXTAUTH_SECRET=<mesma-chave-do-backend>
NEXTAUTH_URL=https://seu-app.vercel.app

# API Backend
NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app

# Google OAuth (se estiver usando)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Database (se o frontend precisar acessar diretamente - geralmente não)
DATABASE_URL=<mesma-do-backend-se-necessario>
```

---

## 📝 Exemplo Completo - Railway

### Backend Service

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${{MySQL.DATABASE_URL}}
FRONTEND_URL=https://fractal-shop.vercel.app
NEXTAUTH_URL=https://fractal-shop.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fractalshop.com
APP_NAME=Fractal Shop
JWT_SECRET=chave-gerada-com-openssl-rand-base64-32
```

### MySQL Database (Railway gera automaticamente)

Railway cria automaticamente a `DATABASE_URL` no formato:
```
mysql://root:senha@containers-us-west-xxx.railway.app:porta/railway
```

---

## 📝 Exemplo Completo - Render

### Backend Web Service

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<url-do-postgresql-ou-planetscale>
FRONTEND_URL=https://fractal-shop.vercel.app
NEXTAUTH_URL=https://fractal-shop.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fractalshop.com
APP_NAME=Fractal Shop
JWT_SECRET=chave-gerada-com-openssl-rand-base64-32
```

**Nota**: Render usa porta `10000` por padrão, não `3001`.

---

## 📝 Exemplo Completo - PlanetScale + Fly.io

### PlanetScale (MySQL)

PlanetScale fornece a `DATABASE_URL` automaticamente no formato:
```
mysql://usuario:senha@aws.connect.psdb.cloud/nome_banco?sslaccept=strict
```

### Fly.io Backend

```env
DATABASE_URL=<url-do-planetscale>
FRONTEND_URL=https://fractal-shop.vercel.app
NEXTAUTH_URL=https://fractal-shop.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@fractalshop.com
APP_NAME=Fractal Shop
JWT_SECRET=chave-gerada-com-openssl-rand-base64-32
NODE_ENV=production
PORT=8080
```

**Nota**: Fly.io usa porta `8080` por padrão.

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca commite** variáveis de ambiente no Git
2. Use **chaves diferentes** para desenvolvimento e produção
3. **Gere secrets fortes** (mínimo 32 caracteres)
4. **Rotacione secrets** periodicamente
5. Use **variáveis de ambiente** do serviço de hospedagem, não arquivos `.env`

### ⚠️ Variáveis Sensíveis

Nunca exponha publicamente:
- `DATABASE_URL` (contém senha)
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- Qualquer token ou chave de API

---

## 🧪 Testar Variáveis

### Backend

Crie um endpoint de teste (apenas em desenvolvimento):

```javascript
// server/app.js (apenas para debug)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/env', (req, res) => {
    res.json({
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      frontendUrl: process.env.FRONTEND_URL,
      // NUNCA retorne valores reais de secrets
    });
  });
}
```

### Frontend

No Vercel, você pode verificar variáveis em:
- Dashboard → Settings → Environment Variables

---

## 📚 Referências

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Fly.io Secrets](https://fly.io/docs/reference/secrets/)

