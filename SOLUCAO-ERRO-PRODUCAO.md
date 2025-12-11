# 🔧 Solução: Erro de Server Components em Produção

## 📋 Problema Identificado

O erro **"Something went wrong - An error occurred in the Server Components render"** em produção no Vercel geralmente ocorre por um dos seguintes motivos:

### 1. **Variáveis de Ambiente Não Configuradas**

- `NEXT_PUBLIC_API_BASE_URL` não está configurada no Vercel
- Sem essa variável, o app tenta conectar em `http://localhost:3001` (que não existe em produção)

### 2. **Backend Inacessível**

- O backend não está rodando ou não está acessível
- A URL do backend está incorreta
- Problemas de CORS

### 3. **Erro na Conexão com Banco de Dados**

- `DATABASE_URL` incorreta ou ausente
- Problemas de SSL no MySQL (comum em Railway, PlanetScale, etc)
- Banco de dados não acessível

### 4. **Falta de Tratamento de Erro nos Server Components**

- Server Components fazendo chamadas à API sem tratamento de erro
- Quando a API falha, o componente quebra e mostra o erro genérico

---

## ✅ Soluções Implementadas

### 1. **Tratamento de Erro nos Server Components**

Adicionado tratamento de erro adequado em:

- `components/ProductsSection.tsx`
- `components/Products.tsx`
- `app/product/[productSlug]/page.tsx`

**Antes:**

```typescript
const data = await apiClient.get("/api/products");
const products = await data.json();
```

**Depois:**

```typescript
try {
  const data = await apiClient.get("/api/products");
  if (!data.ok) {
    // Retorna estado vazio ao invés de quebrar
    return <EmptyState />;
  }
  products = await data.json();
} catch (error) {
  console.error("Error:", error);
  return <EmptyState />;
}
```

### 2. **Melhorias no Componente de Erro Global**

Atualizado `app/error.tsx` para:

- Mostrar mensagens mais amigáveis
- Incluir botão "Tentar novamente"
- Mostrar código de erro (digest) para debugging

### 3. **Validação de Configuração**

Adicionada validação em `lib/config.ts` para:

- Verificar variáveis obrigatórias em produção
- Logar erros de configuração
- Avisar sobre problemas sem quebrar o app

### 4. **Melhorias na Conexão com Banco de Dados**

Atualizado `utils/db.ts` para:

- Validar formato da `DATABASE_URL`
- Configurar SSL automaticamente para MySQL em produção
- Melhor tratamento de erros

---

## 🔍 Como Diagnosticar o Problema

### Passo 1: Verificar Variáveis de Ambiente no Vercel

1. Acesse o dashboard do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Verifique se estas variáveis estão configuradas:

```
NEXT_PUBLIC_API_BASE_URL=https://seu-backend.up.railway.app
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta
DATABASE_URL=mysql://...
```

### Passo 2: Verificar Logs do Vercel

1. No dashboard do Vercel, vá em **Deployments**
2. Clique no deployment mais recente
3. Vá em **Functions** → **View Function Logs**
4. Procure por erros relacionados a:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_API_BASE_URL`
   - Conexão com banco de dados
   - Erros de API

### Passo 3: Testar Backend

Certifique-se de que o backend está:

- ✅ Rodando e acessível
- ✅ Respondendo em `/api/products`
- ✅ Configurado com CORS para aceitar requisições do Vercel

### Passo 4: Verificar Conexão com Banco

Se o problema for com o banco de dados:

1. **Para MySQL (Railway, PlanetScale, etc):**

   - Certifique-se de que a `DATABASE_URL` inclui parâmetros SSL:

   ```
   mysql://user:password@host:port/database?sslmode=REQUIRED
   ```

2. **Teste a conexão:**
   ```bash
   # No backend, teste a conexão
   npx prisma db pull
   ```

---

## 🚀 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_API_BASE_URL` configurada no Vercel
- [ ] `NEXTAUTH_URL` configurada no Vercel
- [ ] `NEXTAUTH_SECRET` configurada no Vercel
- [ ] `DATABASE_URL` configurada (se necessário no frontend)
- [ ] Backend está rodando e acessível
- [ ] CORS configurado no backend para aceitar requisições do Vercel
- [ ] Banco de dados acessível e migrações executadas
- [ ] Testado localmente com variáveis de produção

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to API"

**Causa:** `NEXT_PUBLIC_API_BASE_URL` não configurada ou backend inacessível

**Solução:**

1. Configure `NEXT_PUBLIC_API_BASE_URL` no Vercel
2. Verifique se o backend está rodando
3. Teste a URL do backend manualmente

### Erro: "Database connection failed"

**Causa:** `DATABASE_URL` incorreta ou problemas de SSL

**Solução:**

1. Verifique a `DATABASE_URL` no Vercel
2. Para MySQL, adicione `?sslmode=REQUIRED` na URL
3. Verifique se o banco permite conexões externas

### Erro: "CORS policy"

**Causa:** Backend não configurado para aceitar requisições do Vercel

**Solução:**

1. Adicione a URL do Vercel em `allowedOrigins` no backend
2. Verifique a configuração de CORS em `server/app.js`

---

## 📝 Notas Importantes

1. **Em produção, o Next.js oculta detalhes de erro** para segurança. Use os logs do Vercel para ver erros completos.

2. **Server Components são renderizados no servidor**, então erros de API aparecem como erros de renderização.

3. **Sempre teste localmente** com variáveis de ambiente de produção antes de fazer deploy.

4. **Monitore os logs** do Vercel após cada deploy para identificar problemas rapidamente.

---

## 🔗 Recursos Úteis

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
