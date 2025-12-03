# 📋 Plano de Implementação - Área do Usuário + Deploy Gratuito

## 📊 Visão Geral

Este plano detalha a implementação completa de:

- ✅ Área do usuário com dashboard personalizado
- ✅ Google OAuth e Login por PIN (sem senha)
- ✅ Sistema de dupla home page (Landing + Home Normal)
- ✅ Checkout como convidado melhorado
- ✅ Deploy 100% gratuito (Vercel + Render + PlanetScale + Cloudinary)

---

## 🎯 Tarefas Ordenadas por Prioridade e Dependência

### **ETAPA 1: Banco de Dados (Fundação)** 🗄️

> Preparar toda a estrutura de dados antes de criar as funcionalidades

1. [x] Adicionar models Address e Review ao schema.prisma, atualizar User model
2. [x] Adicionar model VerificationToken para login por PIN
3. [x] Rodar migration no banco local: `npx prisma migrate dev`
4. [x] Gerar Prisma Client atualizado: `npx prisma generate`

**Arquivos afetados:**

- `/prisma/schema.prisma`
- `/server/prisma/schema.prisma`

---

### **ETAPA 2: Backend APIs (Infraestrutura)** 🔧

> Criar todas as rotas e controllers necessários

5. [x] Criar controller e rota para gerenciar perfil do usuário (GET/PUT /api/users/:id/profile)
6. [x] Criar CRUD completo para endereços do usuário (controller + rotas)
7. [x] Criar endpoint para buscar pedidos do usuário (GET /api/users/:id/orders)
8. [x] Criar CRUD para avaliações de produtos (controller + rotas)
9. [x] Integrar serviço de email (Resend ou Nodemailer) para envio de PIN
10. [x] Criar rotas para login por PIN (POST /api/auth/send-pin e /api/auth/verify-pin)

**Arquivos a criar:**

- `/server/controllers/userProfile.js`
- `/server/controllers/addresses.js`
- `/server/controllers/reviews.js`
- `/server/controllers/authPin.js`
- `/server/routes/userProfile.js`
- `/server/routes/addresses.js`
- `/server/routes/reviews.js`
- `/server/routes/authPin.js`
- `/server/utils/emailService.js`

**Dependências:** ETAPA 1 concluída

---

### **ETAPA 3: Autenticação e Middleware (Segurança)** 🔐

> Implementar todos os métodos de autenticação e proteção de rotas

11. [x] Criar função requireUser() em /utils/auth.ts similar ao requireAdmin()
12. [x] Atualizar middleware.ts para proteger rotas /user/\* com requireUser()
13. [x] Ativar Google OAuth - descomentar GoogleProvider em NextAuth config
14. [x] Configurar Google OAuth (credenciais do Google Cloud Console)
15. [x] Adicionar botões "Entrar com Google" nas páginas de login/registro
16. [x] Testar fluxo completo de autenticação (Google + Credentials)

**Arquivos a modificar/criar:**

- `/utils/auth.ts` - adicionar requireUser()
- `/middleware.ts` - adicionar proteção /user/\*
- `/app/api/auth/[...nextauth]/route.ts` - ativar Google
- `/app/login/page.tsx` - adicionar botão Google
- `/app/register/page.tsx` - adicionar botão Google

**Dependências:** ETAPA 2 concluída

---

### **ETAPA 4: Sistema de Dupla Home Page (Marketing)** 🎨

> Criar experiência diferenciada para primeira visita vs usuários recorrentes

18. [x] ~~Criar página /promo (landing page promocional) com design moderno~~ (CANCELADO)
19. [x] ~~Design da landing page com hero, benefícios, CTAs e social proof~~ (CANCELADO)
20. [x] ~~Criar componente de botão "Entrar na Loja" que seta cookie~~ (CANCELADO)
21. [x] ~~Atualizar middleware.ts para verificar cookie "has_visited"~~ (CANCELADO)
22. [x] ~~Implementar lógica de redirecionamento baseada em cookie/autenticação~~ (CANCELADO)
23. [x] ~~Testar fluxo: primeira visita → promo → cookie → home normal~~ (CANCELADO - Removido sistema promocional)

**Sistema promocional removido completamente.**

**Arquivos removidos:**

- ~~`/app/promo/page.tsx` - landing page promocional~~
- ~~`/components/EnterStoreButton.tsx` - botão que seta cookie~~
- ~~`/components/PromoHero.tsx` - hero promocional~~
- ~~`/components/PromoCountdown.tsx` - contador regressivo~~
- ~~`/components/PromoFeatures.tsx` - benefícios~~
- ~~`/components/PromoTestimonials.tsx` - depoimentos~~
- ~~`/components/PromoCTA.tsx` - call-to-action~~
- ~~`/lib/promoCookies.ts` - gerenciamento de cookies promocionais~~
- ~~`/lib/middlewareCookies.ts` - cookies do middleware~~
- ~~`/lib/redirectManager.ts` - gerenciador de redirecionamentos~~
- ~~`/hooks/useUserBehavior.ts` - hook de comportamento do usuário~~
- ~~`/hooks/useRedirectManager.ts` - hook de redirecionamento~~
- ~~`/app/test/page.tsx` - página de testes~~

**Middleware restaurado ao estado original:**

- Apenas proteção de rotas admin/user
- Sem redirecionamentos promocionais
- Sem cookies de tracking

**Dependências:** ETAPA 3 concluída

---

### **ETAPA 5: Componentes Reutilizáveis (UI)** 🧩

> Criar todos os componentes necessários para as páginas

24. [x] Criar componente UserStats.tsx (cards de estatísticas)
25. [x] Criar componente OrderCard.tsx (card para lista de pedidos)
26. [x] Criar componente AddressCard.tsx (card de endereços)
27. [x] Criar componente UserProfileForm.tsx (formulário de perfil)
28. [x] Criar componente UserSidebar.tsx com navegação

**Arquivos criados:**

- ✅ `/components/UserStats.tsx` - Cards de estatísticas do usuário
- ✅ `/components/OrderCard.tsx` - Card para exibir pedidos
- ✅ `/components/AddressCard.tsx` - Card para gerenciar endereços
- ✅ `/components/UserProfileForm.tsx` - Formulário de edição de perfil
- ✅ `/components/UserSidebar.tsx` - Sidebar de navegação do usuário

**Atualizado:**

- ✅ `/components/index.ts` - Todos os novos componentes exportados

**Dependências:** Nenhuma (pode ser feito em paralelo)

---

### **ETAPA 6: Área do Usuário (Funcionalidades)** 👤

> Criar todas as páginas da área do usuário

29. [x] Criar estrutura /app/(dashboard)/user/ com layout.tsx
30. [x] Criar página dashboard do usuário (user/page.tsx) com estatísticas
31. [x] Criar página de perfil (user/perfil/page.tsx) com formulário de edição
32. [x] Criar página de listagem de pedidos (user/pedidos/page.tsx) com filtros
33. [x] Criar página de detalhes do pedido (user/pedidos/[id]/page.tsx)
34. [x] Criar página de gerenciamento de endereços (user/enderecos/page.tsx)
35. [x] Criar página de avaliações (user/avaliacoes/page.tsx)
36. [x] Adicionar link 'Minha Conta' no Header.tsx para usuários logados

**Estrutura de pastas:**

```
/app/(dashboard)/user/
  ├── layout.tsx
  ├── page.tsx
  ├── perfil/
  │   └── page.tsx
  ├── pedidos/
  │   ├── page.tsx
  │   └── [id]/
  │       └── page.tsx
  ├── enderecos/
  │   └── page.tsx
  └── avaliacoes/
      └── page.tsx
```

**Arquivos a modificar:**

- `/components/Header.tsx` - adicionar link "Minha Conta"

**Dependências:** ETAPA 2, 3 e 5 concluídas

---

### **ETAPA 7: Melhorias de Checkout (Conversão)** 💳

> Otimizar checkout para aumentar conversão

37. [ ] Melhorar checkout para destacar opção "Continuar como Convidado"
38. [ ] Criar página /order-success com resumo do pedido
39. [ ] Adicionar em /order-success opção de criar conta com dados preenchidos
40. [ ] Implementar envio de email de confirmação após pedido

**Arquivos a modificar/criar:**

- `/app/checkout/page.tsx` - destacar guest checkout
- `/app/order-success/page.tsx` - nova página
- `/server/controllers/customer_orders.js` - adicionar envio de email

**Dependências:** ETAPA 3 concluída

---

### **ETAPA 8: UX e Responsividade (Polish)** ✨

> Melhorar experiência do usuário em todos os dispositivos

41. [ ] Melhorar responsividade de sidebars (admin + user)
42. [ ] Adicionar menu hambúrguer mobile para dashboards
43. [ ] Adicionar breadcrumbs em todas as páginas de usuário
44. [ ] Implementar loading states e skeletons em todas as páginas
45. [ ] Ajustar espaçamentos e breakpoints gerais
46. [ ] Criar modals de confirmação (deletar endereço, etc)

**Componentes a criar:**

- `/components/Breadcrumb.tsx` (já existe, melhorar)
- `/components/MobileMenu.tsx`
- `/components/LoadingSkeleton.tsx`
- `/components/ConfirmModal.tsx`

**Dependências:** ETAPA 6 concluída

---

### **ETAPA 9: Deploy e Infraestrutura (Produção)** 🚀

> Colocar aplicação no ar 100% grátis

47. [ ] Configurar conta no Cloudinary (free tier)
48. [ ] Instalar cloudinary no backend: `npm install cloudinary`
49. [ ] Migrar upload de imagens para Cloudinary (mainImages.js + productImages.js)
50. [ ] Criar conta no PlanetScale e configurar banco de dados
51. [ ] Criar arquivos .env.production com todas as variáveis
52. [ ] Rodar migrations no PlanetScale: `npx prisma migrate deploy`
53. [ ] Configurar e fazer deploy do backend no Render.com
54. [ ] Configurar e fazer deploy do frontend na Vercel
55. [ ] Testar aplicação completa em produção

**Serviços Gratuitos:**

- ✅ **Vercel** (Frontend) - Hobby Plan
- ✅ **Render.com** (Backend) - Free Tier
- ✅ **PlanetScale** (Banco) - Hobby Plan
- ✅ **Cloudinary** (Imagens) - Free Tier

**Custo Total: R$ 0,00/mês** 💰

**Limitações Free Tier:**

- Backend dorme após 15min inativo (Render)
- 5GB banco de dados (PlanetScale)
- 25GB imagens/mês (Cloudinary)

**Arquivos a modificar:**

- `/server/controllers/mainImages.js`
- `/server/controllers/productImages.js`

**Arquivos a criar:**

- `/.env.production`
- `/server/.env.production`

**Dependências:** Todas as funcionalidades testadas localmente

---

### **ETAPA 10: Otimizações Finais (Performance)** ⚡

> Adicionar monitoramento e melhorar performance

56. [ ] Configurar Sentry para error tracking
57. [ ] Implementar cache de queries frequentes no backend
58. [ ] Otimizar imagens com transformações do Cloudinary
59. [ ] Adicionar sitemap.xml e robots.txt
60. [ ] Configurar UptimeRobot para monitoramento

**Ferramentas (todas gratuitas):**

- 🔴 **Sentry** - Error tracking
- 📊 **UptimeRobot** - Uptime monitoring
- 🗺️ **sitemap.xml** - SEO

**Arquivos a criar:**

- `/public/sitemap.xml`
- `/public/robots.txt`

**Dependências:** ETAPA 9 concluída (app em produção)

---

## 📈 Progresso

**Total de Tarefas:** 60

**Por Etapa:**

- ETAPA 1: 4 tarefas
- ETAPA 2: 6 tarefas
- ETAPA 3: 7 tarefas
- ETAPA 4: 6 tarefas
- ETAPA 5: 5 tarefas
- ETAPA 6: 8 tarefas
- ETAPA 7: 4 tarefas
- ETAPA 8: 6 tarefas
- ETAPA 9: 9 tarefas
- ETAPA 10: 5 tarefas

---

## 🎯 Ordem de Implementação Recomendada

```
ETAPA 1 (Banco)
    ↓
ETAPA 2 (Backend APIs)
    ↓
ETAPA 3 (Autenticação)
    ↓
┌───────────┴───────────┐
│                       │
ETAPA 4 (Dupla Home)  ETAPA 5 (Componentes) ← Paralelo
│                       │
└───────────┬───────────┘
    ↓
ETAPA 6 (Área Usuário)
    ↓
ETAPA 7 (Checkout)
    ↓
ETAPA 8 (UX Polish)
    ↓
ETAPA 9 (Deploy)
    ↓
ETAPA 10 (Otimizações)
```

---

## ✅ Como Usar Este Plano

1. **Trabalhe etapa por etapa** - Não pule etapas
2. **Complete uma etapa antes da próxima** - Teste tudo
3. **Marque as tarefas concluídas** - Use `[x]` ao invés de `[ ]`
4. **Documente problemas** - Adicione notas se necessário
5. **Faça commits frequentes** - Um por tarefa concluída

---

## 🚀 Pronto para Começar!

Comece pela **ETAPA 1** e siga em frente! 💪
