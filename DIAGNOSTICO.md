# Diagnóstico: Erro ao Carregar Produtos

## ✅ Variáveis Configuradas no Vercel

Você já tem as variáveis configuradas no Vercel. Agora precisamos verificar outras possíveis causas.

## 🔍 Passos para Diagnosticar

### 1. Verificar se Fez Deploy Após Adicionar Variáveis

**IMPORTANTE**: Após adicionar variáveis de ambiente no Vercel, você DEVE fazer um novo deploy!

1. Vá em **Deployments** no Vercel
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para forçar um novo deploy

### 2. Verificar CORS no Railway (Backend)

O problema mais provável é que o Railway está bloqueando requisições do Vercel por CORS.

**No Railway:**
1. Acesse https://railway.app/dashboard
2. Selecione seu projeto do backend
3. Vá em **Variables**
4. Verifique se existe a variável `FRONTEND_URL` ou `NEXTAUTH_URL` com a URL do seu site no Vercel
5. Se não existir, adicione:
   - **Nome**: `FRONTEND_URL`
   - **Valor**: A URL completa do seu site no Vercel (ex: `https://fractal-project-sage.vercel.app`)
6. Salve e aguarde o reinício automático

### 3. Verificar Logs do Vercel

1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Vá em **Functions** ou **Logs**
4. Procure por mensagens como:
   - `[Config] API Base URL: ...`
   - `[API Client] Making request to: ...`
   - `[API Client] Response status: ...`
   - Erros relacionados a CORS ou conexão

### 4. Verificar Logs do Railway

1. No Railway, vá em **Deployments**
2. Veja os logs do serviço
3. Procure por:
   - Erros de CORS
   - Requisições recebidas
   - Status das respostas

### 5. Testar a API Diretamente

Abra o DevTools do navegador (F12) e execute no console:

```javascript
fetch('https://fractal-project-production-64a4.up.railway.app/api/products')
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', [...res.headers.entries()]);
    return res.json();
  })
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));
```

Se der erro de CORS, confirma que o problema é no backend do Railway.

### 6. Verificar Console do Navegador

1. Abra o site no Vercel
2. Abra o DevTools (F12)
3. Vá na aba **Console**
4. Procure por erros relacionados a:
   - CORS
   - Network errors
   - Failed to fetch

### 7. Verificar Network Tab

1. No DevTools, vá na aba **Network**
2. Recarregue a página
3. Procure por requisições para `/api/products`
4. Clique na requisição e veja:
   - **Status Code**: Deve ser 200 (sucesso) ou outro código de erro
   - **Request URL**: Deve apontar para o Railway
   - **Response**: Veja se há mensagens de erro

## 🐛 Problemas Comuns e Soluções

### Problema: Erro de CORS no Console

**Sintoma**: No console aparece `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solução**: Configure `FRONTEND_URL` no Railway com a URL do Vercel

### Problema: 404 Not Found

**Sintoma**: Status 404 nas requisições

**Solução**: Verifique se a URL da API está correta em `NEXT_PUBLIC_API_BASE_URL`

### Problema: Timeout ou Network Error

**Sintoma**: Erro de rede ou timeout

**Solução**: 
- Verifique se o Railway está rodando
- Verifique se há problemas de rede
- Aumente o timeout se necessário

### Problema: Variável não está sendo usada

**Sintoma**: Os logs mostram `http://localhost:3001` mesmo em produção

**Solução**: 
- Verifique se fez deploy após adicionar a variável
- Verifique se a variável está configurada para o ambiente correto (Production)
- Verifique se o nome da variável está correto: `NEXT_PUBLIC_API_BASE_URL`

## 📝 Checklist

- [ ] Fez deploy no Vercel após adicionar variáveis?
- [ ] Configurou `FRONTEND_URL` no Railway?
- [ ] Verificou os logs do Vercel?
- [ ] Verificou os logs do Railway?
- [ ] Testou a API diretamente no navegador?
- [ ] Verificou o console do navegador?
- [ ] Verificou a aba Network no DevTools?

## 🔧 Melhorias Implementadas

Adicionei logs detalhados no código para facilitar o diagnóstico:

1. **lib/config.ts**: Loga a URL da API sendo usada
2. **lib/api.ts**: Loga cada requisição e resposta
3. **components/ProductsSection.tsx**: Logs mais detalhados de erros

Após fazer um novo deploy, esses logs aparecerão no Vercel e ajudarão a identificar o problema.
