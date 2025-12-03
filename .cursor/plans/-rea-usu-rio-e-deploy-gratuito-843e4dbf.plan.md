<!-- 843e4dbf-ebd4-4c1c-a598-69d15a8d2379 c1c3fcb1-885f-4431-94e4-3fe0ddcc35b6 -->

# Plano: Área do Usuário + Deploy Gratuito

## FASE 1: Criação da Área do Usuário (Prioridade Máxima)

### 1.1 Estrutura de Rotas e Layout

Criar nova estrutura de pastas para área do usuário:

```
/app/(dashboard)/user/
  ├── layout.tsx (layout com sidebar de usuário)
  ├── page.tsx (dashboard principal)
  ├── perfil/page.tsx
  ├── pedidos/
  │   ├── page.tsx (lista de pedidos)
  │   └── [id]/page.tsx (detalhes do pedido)
  ├── enderecos/page.tsx
  └── avaliacoes/page.tsx
```

### 1.2 Componentes Necessários

- `UserSidebar.tsx` - Sidebar específica para usuários com menu de navegação
- `UserStats.tsx` - Cards com estatísticas (total gasto, pedidos, etc)
- `OrderCard.tsx` - Card para exibir pedidos na lista
- `AddressCard.tsx` - Card para gerenciar endereços
- `UserProfileForm.tsx` - Formulário de edição de perfil

### 1.3 Schema do Banco de Dados

Adicionar novos models ao Prisma:

- `Address` - Endereços de entrega do usuário
- `Review` - Avaliações de produtos
- Atualizar `User` para incluir mais campos (telefone, CPF, foto)

### 1.4 Backend - Novas Rotas API

Criar controllers e rotas em `/server`:

- `/api/users/:id/profile` - GET/PUT para perfil
- `/api/users/:id/addresses` - CRUD de endereços
- `/api/users/:id/reviews` - CRUD de avaliações
- `/api/users/:id/orders` - GET pedidos do usuário

### 1.5 Atualização do Header e Middleware

- Adicionar link "Minha Conta" no Header para usuários logados
- Atualizar `middleware.ts` para proteger rotas `/user/*`
- Adicionar função `requireUser()` similar ao `requireAdmin()`

---

## FASE 1.5: Novos Métodos de Autenticação

### 1.5.1 Google OAuth (Já Parcialmente Implementado)

**Status atual:** Provider já existe mas está comentado no código

Ativar e configurar:

- Descomentar `GoogleProvider` em `/app/api/auth/[...nextauth]/route.ts`
- Criar aplicação OAuth no Google Cloud Console
- Obter `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- Adicionar botão "Entrar com Google" nas páginas de login/registro
- Testar fluxo completo de autenticação

### 1.5.2 Magic Link - Login Sem Senha (PIN por Email)

**Nova funcionalidade:** Sistema de autenticação por código PIN enviado ao email

**Estrutura necessária:**

- Novo model `VerificationToken` no Prisma:
  ```prisma
  model VerificationToken {
    id         String   @id @default(uuid())
    email      String
    token      String   @unique
    pin        String   // Código de 6 dígitos
    expiresAt  DateTime
    createdAt  DateTime @default(now())
  }
  ```

**Backend - Novas rotas:**

- `POST /api/auth/send-pin` - Envia PIN por email
- `POST /api/auth/verify-pin` - Valida PIN e faz login

**Frontend - Novas páginas:**

- `/app/login-pin/page.tsx` - Página para solicitar PIN
- `/app/verify-pin/page.tsx` - Página para inserir PIN

**Integração com email:**

- Usar Resend.com (FREE: 100 emails/dia, 3000/mês)
- Ou Nodemailer com Gmail SMTP (grátis)
- Template de email com código PIN

### 1.5.3 Checkout como Convidado (Já Implementado)

**Status:** Checkout já permite compra sem login ✅

**Melhorias a fazer:**

- Adicionar opção explícita "Continuar como Convidado"
- Sugerir criação de conta após finalizar pedido
- Salvar email para futuras compras
- Enviar email de confirmação do pedido

**Página de conversão:**

- `/app/order-success/page.tsx` - Após checkout bem-sucedido
- Oferecer criar conta com os dados já preenchidos
- Explicar benefícios (rastrear pedidos, favoritos, etc)

---

## FASE 1.6: Sistema de Dupla Home Page (Landing vs Home Normal)

**Nova funcionalidade:** Criar duas experiências diferentes na raiz do site

### Estrutura de Páginas:

**Página 1 - Landing Page Promocional (`/promo`):**

- Design focado em conversão e marketing
- Hero section impactante com CTA principal
- Seções de benefícios e destaques
- Depoimentos/social proof
- Call-to-action para "Entrar na Loja"
- Design moderno e atraente para primeira visita

**Página 2 - Home Normal (`/` quando autenticado):**

- Layout atual da home do e-commerce
- Produtos em destaque
- Categorias
- Promoções
- Acesso direto ao catálogo

### Middleware com Cookie de Acesso:

**Arquivo: `/middleware.ts` (atualizar)**

Lógica de redirecionamento:

```typescript
1. Verificar se usuário tem cookie "has_visited" ou está autenticado
2. SE cookie existe OU usuário logado:
   - Permitir acesso à home normal (/)
   - Permitir acesso a todas as rotas
3. SE NÃO tem cookie E NÃO está logado:
   - Redirecionar de / para /promo
   - Ao clicar "Entrar na Loja" em /promo, setar cookie
   - Cookie expira em 30 dias
```

### Implementação Técnica:

**Backend - Cookie Management:**

- Nome do cookie: `has_visited` ou `store_access`
- Duração: 30 dias
- HttpOnly: false (precisa ser acessível no client)
- Secure: true (em produção)
- SameSite: Lax

**Frontend - Componentes:**

- `/app/promo/page.tsx` - Landing page promocional
- Botão "Entrar na Loja" que seta o cookie e redireciona
- Design responsivo e otimizado para conversão

**Fluxo do Usuário:**

1. Primeira visita → `/promo` (landing page)
2. Clica "Entrar na Loja" → cookie setado → redireciona para `/`
3. Próximas visitas → direto para `/` (home normal)
4. Se fizer login → sempre vai para `/` (home normal)

### Benefícios:

- ✅ Conversão melhor para novos visitantes
- ✅ Experiência otimizada para clientes recorrentes
- ✅ Possibilidade de A/B testing
- ✅ Marketing direcionado na primeira visita
- ✅ UX fluída para quem já conhece a loja

---

## FASE 2: Melhorias de Layout e UX

### 2.1 Layout Responsivo

- Melhorar sidebar colapsável em mobile
- Ajustar espaçamentos e breakpoints
- Adicionar menu hambúrguer para áreas dashboard

### 2.2 Navegação

- Adicionar breadcrumbs em todas as páginas de usuário
- Melhorar indicação de página ativa na sidebar
- Adicionar loading states e skeletons

### 2.3 Componentes Visuais

- Cards padronizados com design system
- Botões com estados hover/active/disabled
- Modal para confirmações (deletar endereço, etc)

---

## FASE 3: Deploy 100% Gratuito

### 3.1 Frontend - Vercel (FREE ✅)

**Configuração:**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Limites Free Tier:**

- ✅ Banda ilimitada para hobby projects
- ✅ SSL automático
- ✅ 100GB bandwidth/mês
- ✅ Build time: 6000 min/mês

### 3.2 Backend - Render.com (FREE ✅)

**Por que Render Free Tier:**

- ✅ 750 horas/mês grátis
- ✅ Auto-deploy do GitHub
- ✅ SSL incluído
- ⚠️ "Dorme" após 15min inativo (primeiro request demora ~30s)

**Alternativa:** Railway ($5 crédito inicial = ~1 mês grátis)

### 3.3 Banco de Dados - PlanetScale (FREE ✅)

**Limites Free Tier:**

- ✅ 5GB armazenamento
- ✅ 1 bilhão row reads/mês
- ✅ 10 milhões row writes/mês
- ✅ MySQL compatível (Prisma funciona perfeitamente)

**Migração:**

```bash
# Atualizar DATABASE_URL para PlanetScale
# Rodar migrations
npx prisma migrate deploy
```

### 3.4 Imagens - Cloudinary (FREE ✅)

**Limites Free Tier:**

- ✅ 25 GB armazenamento
- ✅ 25 GB bandwidth/mês
- ✅ CDN global incluído
- ✅ Transformações de imagem

**Mudanças necessárias:**

- Instalar `cloudinary` no backend
- Atualizar `mainImages.js` e `productImages.js`
- Configurar upload direto para Cloudinary

### 3.5 Variáveis de Ambiente

Criar `.env.production` com:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=https://seu-backend.onrender.com
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui

# Backend (.env)
DATABASE_URL=mysql://user:pass@host.us-east-3.psdb.cloud/db?sslaccept=strict
CLOUDINARY_CLOUD_NAME=seu-cloud
CLOUDINARY_API_KEY=sua-key
CLOUDINARY_API_SECRET=seu-secret
FRONTEND_URL=https://seu-app.vercel.app
NODE_ENV=production
```

---

## FASE 4: Otimizações Pós-Deploy

### 4.1 Performance

- Adicionar cache de queries frequentes
- Implementar ISR em páginas de produto
- Otimizar imagens com Cloudinary transformations

### 4.2 Monitoramento

- Configurar Sentry (free tier) para error tracking
- Logs de requisições
- Uptime monitoring (UptimeRobot - free)

### 4.3 SEO

- Atualizar metadata dinâmico
- Sitemap.xml
- robots.txt

---

## 📊 Custo Total: R$ 0,00/mês

| Serviço | Plano | Custo |

|---------|-------|-------|

| Vercel | Hobby | FREE |

| Render | Free Tier | FREE |

| PlanetScale | Hobby | FREE |

| Cloudinary | Free Tier | FREE |

| **TOTAL** | | **R$ 0,00** |

**Limitações:**

- Backend dorme após 15min (Render)
- 5GB banco de dados (suficiente para começar)
- 25GB imagens/mês (Cloudinary)

**Quando escalar (futuro):**

- Render: $7/mês (sempre ativo)
- PlanetScale: $29/mês (10GB, produção)
- Total: ~$36/mês (~R$ 180/mês) quando crescer

### To-dos (Ordenados por Prioridade e Dependência)

**ETAPA 1: Banco de Dados (Fundação)**

1. [ ] Adicionar models Address e Review ao schema.prisma, atualizar User model
2. [ ] Adicionar model VerificationToken para login por PIN
3. [ ] Rodar migration no banco local: `npx prisma migrate dev`
4. [ ] Gerar Prisma Client atualizado: `npx prisma generate`

**ETAPA 2: Backend APIs (Infraestrutura)**

5. [ ] Criar controller e rota para gerenciar perfil do usuário (GET/PUT /api/users/:id/profile)
6. [ ] Criar CRUD completo para endereços do usuário (controller + rotas)
7. [ ] Criar endpoint para buscar pedidos do usuário (GET /api/users/:id/orders)
8. [ ] Criar CRUD para avaliações de produtos (controller + rotas)
9. [ ] Integrar serviço de email (Resend ou Nodemailer) para envio de PIN
10. [ ] Criar rotas para login por PIN (POST /api/auth/send-pin e /api/auth/verify-pin)

**ETAPA 3: Autenticação e Middleware (Segurança)**

11. [ ] Criar função requireUser() em /utils/auth.ts similar ao requireAdmin()
12. [ ] Atualizar middleware.ts para proteger rotas /user/\* com requireUser()
13. [ ] Ativar Google OAuth - descomentar GoogleProvider em NextAuth config
14. [ ] Configurar Google OAuth (credenciais do Google Cloud Console)
15. [ ] Criar páginas de login por PIN (/login-pin e /verify-pin)
16. [ ] Adicionar botões "Entrar com Google" nas páginas de login/registro
17. [ ] Testar fluxo completo de autenticação (Google + PIN + Credentials)

**ETAPA 4: Sistema de Dupla Home Page (Marketing)**

18. [ ] Criar página /promo (landing page promocional) com design moderno
19. [ ] Design da landing page com hero, benefícios, CTAs e social proof
20. [ ] Criar componente de botão "Entrar na Loja" que seta cookie
21. [ ] Atualizar middleware.ts para verificar cookie "has_visited"
22. [ ] Implementar lógica de redirecionamento baseada em cookie/autenticação
23. [ ] Testar fluxo: primeira visita → promo → cookie → home normal

**ETAPA 5: Componentes Reutilizáveis (UI)**

24. [ ] Criar componente UserStats.tsx (cards de estatísticas)
25. [ ] Criar componente OrderCard.tsx (card para lista de pedidos)
26. [ ] Criar componente AddressCard.tsx (card de endereços)
27. [ ] Criar componente UserProfileForm.tsx (formulário de perfil)
28. [ ] Criar componente UserSidebar.tsx com navegação

**ETAPA 6: Área do Usuário (Funcionalidades)**

29. [ ] Criar estrutura /app/(dashboard)/user/ com layout.tsx
30. [ ] Criar página dashboard do usuário (user/page.tsx) com estatísticas
31. [ ] Criar página de perfil (user/perfil/page.tsx) com formulário de edição
32. [ ] Criar página de listagem de pedidos (user/pedidos/page.tsx) com filtros
33. [ ] Criar página de detalhes do pedido (user/pedidos/[id]/page.tsx)
34. [ ] Criar página de gerenciamento de endereços (user/enderecos/page.tsx)
35. [ ] Criar página de avaliações (user/avaliacoes/page.tsx)
36. [ ] Adicionar link 'Minha Conta' no Header.tsx para usuários logados

**ETAPA 7: Melhorias de Checkout (Conversão)**

37. [ ] Melhorar checkout para destacar opção "Continuar como Convidado"
38. [ ] Criar página /order-success com resumo do pedido
39. [ ] Adicionar em /order-success opção de criar conta com dados preenchidos
40. [ ] Implementar envio de email de confirmação após pedido

**ETAPA 8: UX e Responsividade (Polish)**

41. [ ] Melhorar responsividade de sidebars (admin + user)
42. [ ] Adicionar menu hambúrguer mobile para dashboards
43. [ ] Adicionar breadcrumbs em todas as páginas de usuário
44. [ ] Implementar loading states e skeletons em todas as páginas
45. [ ] Ajustar espaçamentos e breakpoints gerais
46. [ ] Criar modals de confirmação (deletar endereço, etc)

**ETAPA 9: Deploy e Infraestrutura (Produção)**

47. [ ] Configurar conta no Cloudinary (free tier)
48. [ ] Instalar cloudinary no backend: `npm install cloudinary`
49. [ ] Migrar upload de imagens para Cloudinary (mainImages.js + productImages.js)
50. [ ] Criar conta no PlanetScale e configurar banco de dados
51. [ ] Criar arquivos .env.production com todas as variáveis
52. [ ] Rodar migrations no PlanetScale: `npx prisma migrate deploy`
53. [ ] Configurar e fazer deploy do backend no Render.com
54. [ ] Configurar e fazer deploy do frontend na Vercel
55. [ ] Testar aplicação completa em produção

**ETAPA 10: Otimizações Finais (Performance)**

56. [ ] Configurar Sentry para error tracking
57. [ ] Implementar cache de queries frequentes no backend
58. [ ] Otimizar imagens com transformações do Cloudinary
59. [ ] Adicionar sitemap.xml e robots.txt
60. [ ] Configurar UptimeRobot para monitoramento

### To-dos

- [ ] Criar estrutura de pastas /app/(dashboard)/user/ com layout e páginas principais
- [ ] Criar componente UserSidebar.tsx com navegação para área do usuário
- [ ] Criar página dashboard do usuário com overview de pedidos, favoritos e estatísticas
- [ ] Criar página e formulário de edição de perfil do usuário
- [ ] Criar página listagem de pedidos do usuário com filtros e status
- [ ] Criar página de detalhes de pedido individual com rastreamento
- [ ] Adicionar models Address e Review ao schema.prisma, atualizar User model
- [ ] Criar controller e rota para gerenciar perfil do usuário (GET/PUT /api/users/:id/profile)
- [ ] Criar CRUD completo para endereços do usuário (controller + rotas)
- [ ] Criar CRUD para avaliações de produtos (controller + rotas)
- [ ] Atualizar middleware.ts para proteger rotas /user/\* e criar requireUser()
- [ ] Adicionar link 'Minha Conta' no Header.tsx para usuários logados
- [ ] Criar página de gerenciamento de endereços com CRUD
- [ ] Criar página de avaliações com lista de produtos avaliados
- [ ] Melhorar responsividade de sidebars e adicionar menu hambúrguer mobile
- [ ] Configurar Cloudinary e migrar upload de imagens do filesystem para Cloudinary
- [ ] Criar arquivos .env.production com variáveis para deploy
- [ ] Configurar e fazer deploy do frontend na Vercel
- [ ] Criar banco de dados no PlanetScale e migrar schema
- [ ] Configurar e fazer deploy do backend no Render.com
