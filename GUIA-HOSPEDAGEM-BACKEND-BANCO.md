# 🚀 Guia de Hospedagem - Backend e Banco de Dados

## 📋 Visão Geral do Projeto

- **Frontend**: Next.js (hospedado no Vercel)
- **Backend**: Node.js/Express (pasta `server/`, porta 3001)
- **Banco de Dados**: MySQL (usando Prisma ORM)

---

## 🎯 Opções Recomendadas

### **Opção 1: Railway (RECOMENDADO) ⭐**

Railway é a melhor opção para começar rapidamente com plano gratuito e fácil configuração.

#### ✅ Vantagens:
- Plano gratuito generoso ($5 de crédito/mês)
- Deploy automático via GitHub
- MySQL gerenciado incluído
- SSL automático
- Variáveis de ambiente fáceis de configurar
- Suporte a Prisma nativamente

#### 📦 O que hospedar:
1. **Backend Node.js** (servidor Express)
2. **MySQL Database** (banco de dados gerenciado)

#### 🔗 Links:
- Website: https://railway.app
- Documentação: https://docs.railway.app

---

### **Opção 2: Render**

Render oferece planos gratuitos com algumas limitações, mas é muito confiável.

#### ✅ Vantagens:
- Plano gratuito disponível
- Deploy automático via GitHub
- MySQL gerenciado disponível
- SSL automático
- Fácil configuração

#### ⚠️ Limitações do Plano Gratuito:
- Backend "dorme" após 15 minutos de inatividade (primeira requisição pode ser lenta)
- Banco de dados pode ser deletado após 90 dias de inatividade

#### 📦 O que hospedar:
1. **Web Service** (backend Node.js)
2. **PostgreSQL** (Render não oferece MySQL gratuito, mas você pode migrar para PostgreSQL)

#### 🔗 Links:
- Website: https://render.com
- Documentação: https://render.com/docs

---

### **Opção 3: PlanetScale (Banco) + Fly.io (Backend)**

Combinação poderosa: PlanetScale para MySQL e Fly.io para o backend.

#### ✅ Vantagens:
- **PlanetScale**: MySQL serverless, plano gratuito generoso, branching de banco
- **Fly.io**: Backend sempre ativo, plano gratuito, excelente performance

#### 📦 O que hospedar:
1. **PlanetScale**: MySQL Database
2. **Fly.io**: Backend Node.js

#### 🔗 Links:
- PlanetScale: https://planetscale.com
- Fly.io: https://fly.io

---

## 🛠️ Configuração Detalhada - Railway (Recomendado)

### Passo 1: Criar Conta no Railway

1. Acesse https://railway.app
2. Faça login com GitHub
3. Aceite os termos e crie um novo projeto

### Passo 2: Adicionar Banco de Dados MySQL

1. No dashboard do Railway, clique em **"New"**
2. Selecione **"Database"** → **"Add MySQL"**
3. Railway criará automaticamente:
   - Nome do banco
   - Usuário
   - Senha
   - Host
   - Porta

4. **Copie a variável `DATABASE_URL`** que aparece no dashboard (ela já vem no formato correto)

### Passo 3: Deploy do Backend

1. No dashboard do Railway, clique em **"New"** → **"GitHub Repo"**
2. Selecione seu repositório
3. Railway detectará automaticamente que é um projeto Node.js
4. Configure o **Root Directory** como `server` (já que o backend está na pasta server)
5. Configure as variáveis de ambiente:

```env
NODE_ENV=production
DATABASE_URL=<cole a DATABASE_URL do banco criado>
PORT=3001
FRONTEND_URL=https://seu-app.vercel.app
NEXTAUTH_URL=https://seu-app.vercel.app
```

6. Railway fará o deploy automaticamente
7. Após o deploy, você receberá uma URL como: `https://seu-backend.up.railway.app`

### Passo 4: Configurar CORS no Backend

Atualize o arquivo `server/app.js` para incluir a URL do Vercel:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXTAUTH_URL,
  process.env.FRONTEND_URL,
  "https://seu-app.vercel.app", // Adicione sua URL do Vercel
].filter(Boolean);
```

### Passo 5: Executar Migrações do Prisma

No Railway, você pode executar comandos via CLI ou adicionar um script de deploy:

1. Instale o Railway CLI: `npm i -g @railway/cli`
2. Faça login: `railway login`
3. Conecte ao projeto: `railway link`
4. Execute as migrações:

```bash
cd server
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### Passo 6: Configurar Variáveis no Vercel

No dashboard do Vercel, adicione as variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=https://seu-backend.up.railway.app
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=<sua-chave-secreta>
DATABASE_URL=<mesma-do-railway-se-precisar-no-frontend>
```


## 📝 Checklist de Deploy

- [ ] Banco de dados criado e migrações executadas
- [ ] Backend deployado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado para aceitar requisições do Vercel
- [ ] Health check funcionando (`/health`)
- [ ] Frontend configurado com URL do backend
- [ ] Testes de API funcionando

---

## 🔒 Segurança

### Variáveis Sensíveis
Nunca commite no Git:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- Senhas e tokens

### CORS
Configure apenas as origens necessárias no backend.

### Rate Limiting
Seu backend já tem rate limiting configurado - mantenha ativo em produção.

---

## 💰 Comparação de Custos

| Serviço | Plano Gratuito | Limitações |
|---------|---------------|------------|
| **Railway** | $5 crédito/mês | Suficiente para começar |
| **Render** | Disponível | Backend "dorme" após 15min |
| **PlanetScale** | 1 banco, 1GB | Sem limitações críticas |
| **Fly.io** | 3 VMs compartilhadas | Suficiente para começar |

---

## 🆘 Troubleshooting

### Backend não conecta ao banco
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco permite conexões externas
- Verifique firewall/security groups

### CORS errors
- Adicione a URL do Vercel em `allowedOrigins`
- Verifique se `FRONTEND_URL` está configurada

### Migrações falhando
- Execute `npx prisma migrate deploy` (não `dev`)
- Verifique se o banco está acessível
- Confirme que o schema está atualizado

---

## 📚 Recursos Adicionais

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)

---

## 🎯 Recomendação Final

**Para começar rapidamente**: Use **Railway** para backend e banco de dados.

**Para produção escalável**: Use **PlanetScale** (MySQL) + **Fly.io** ou **Railway** (backend).

**Para orçamento zero**: Use **Render** (backend) + **PlanetScale** (MySQL gratuito).



