# Solução: Erro ao Carregar Produtos no Vercel

## Problema Identificado

A aplicação no Vercel está mostrando "Não foi possível carregar os produtos no momento" mesmo que a API esteja funcionando corretamente em `https://fractal-project-production-64a4.up.railway.app/api/products`.

## Causas

1. **Variável de ambiente não configurada no Vercel**: A aplicação precisa da variável `NEXT_PUBLIC_API_BASE_URL` configurada
2. **CORS não configurado no Railway**: O backend precisa permitir requisições da origem do Vercel

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

1. Acesse o painel do Vercel: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione a seguinte variável:
   - **Nome**: `NEXT_PUBLIC_API_BASE_URL`
   - **Valor**: `https://fractal-project-production-64a4.up.railway.app`
   - **Environment**: Selecione **Production**, **Preview** e **Development** (ou apenas Production se preferir)
5. Clique em **Save**
6. **IMPORTANTE**: Faça um novo deploy ou redeploy da aplicação para que as variáveis sejam aplicadas

### 2. Configurar CORS no Railway (Backend)

1. Acesse o painel do Railway: https://railway.app/dashboard
2. Selecione seu projeto do backend
3. Vá em **Variables**
4. Adicione ou atualize as seguintes variáveis:
   - **Nome**: `FRONTEND_URL`
   - **Valor**: A URL completa do seu site no Vercel (ex: `https://seu-projeto.vercel.app`)
   - **OU** use `NEXTAUTH_URL` com a mesma URL do Vercel
5. Salve as alterações
6. O Railway irá reiniciar automaticamente o serviço

### 3. Verificar Configuração

Após configurar ambas as plataformas:

1. **No Vercel**: Faça um novo deploy
2. **No Railway**: Aguarde o reinício do serviço
3. Teste a aplicação no Vercel

## Variáveis de Ambiente Necessárias

### Vercel (Frontend)

```
NEXT_PUBLIC_API_BASE_URL=https://fractal-project-production-64a4.up.railway.app
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui
```

### Railway (Backend)

```
FRONTEND_URL=https://seu-projeto.vercel.app
NEXTAUTH_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

## Como Verificar se Está Funcionando

1. Abra o DevTools do navegador (F12)
2. Vá na aba **Network**
3. Recarregue a página
4. Procure por requisições para `/api/products`
5. Verifique se:
   - A URL está correta (deve apontar para o Railway)
   - O status da resposta é 200 (sucesso)
   - Não há erros de CORS no console

## Troubleshooting

### Se ainda não funcionar:

1. **Verifique os logs do Vercel**: Vá em **Deployments** → Selecione o último deploy → **Functions** → Veja os logs
2. **Verifique os logs do Railway**: Vá em **Deployments** → Veja os logs do serviço
3. **Teste a API diretamente**: Acesse `https://fractal-project-production-64a4.up.railway.app/api/products` no navegador
4. **Verifique o console do navegador**: Pode haver erros de JavaScript que impedem o carregamento

## Nota Importante

Após adicionar variáveis de ambiente no Vercel, você **DEVE** fazer um novo deploy para que as mudanças tenham efeito. As variáveis não são aplicadas automaticamente aos deploys existentes.
