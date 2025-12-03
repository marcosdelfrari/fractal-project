# 🔐 Configuração Google OAuth - Guia Completo

## 📋 **Informações Necessárias**

Para configurar o Google OAuth, preciso das seguintes informações do seu projeto:

### 🎯 **Dados do Projeto:**

1. **Nome do Projeto:** (ex: "Fractal Shop")
2. **Domínio de Produção:** (ex: "fractalshop.com" ou "meuapp.vercel.app")
3. **Email de Contato:** (seu email para notificações)

### 🔧 **URLs de Redirecionamento:**

- **Desenvolvimento:** `http://localhost:3000/api/auth/callback/google`
- **Produção:** `https://seudominio.com/api/auth/callback/google`

---

## 🚀 **Passo a Passo - Google Cloud Console**

### **1. Acessar Google Cloud Console**

- Vá para: https://console.cloud.google.com/
- Faça login com sua conta Google

### **2. Criar/Selecionar Projeto**

- Clique em "Selecionar Projeto" (canto superior)
- Clique em "Novo Projeto"
- Digite o nome do projeto
- Clique em "Criar"

### **3. Ativar Google+ API**

- No menu lateral: "APIs e Serviços" > "Biblioteca"
- Procure por "Google+ API" ou "Google Identity"
- Clique em "Ativar"

### **4. Configurar Tela de Consentimento**

- "APIs e Serviços" > "Tela de consentimento OAuth"
- Escolha "Externo" (para desenvolvimento)
- Preencha:
  - **Nome do aplicativo:** Fractal Shop
  - **Email de suporte:** seu email
  - **Domínios autorizados:** localhost (desenvolvimento)
- Clique em "Salvar e Continuar"

### **5. Criar Credenciais OAuth**

- "APIs e Serviços" > "Credenciais"
- Clique em "+ Criar Credenciais" > "ID do cliente OAuth 2.0"
- Tipo de aplicativo: "Aplicativo da Web"
- Nome: "Fractal Shop Web Client"

### **6. Configurar URLs de Redirecionamento**

- **URIs de redirecionamento autorizados:**
  ```
  http://localhost:3000/api/auth/callback/google
  https://seudominio.com/api/auth/callback/google
  ```
- **Origens JavaScript autorizadas:**
  ```
  http://localhost:3000
  https://seudominio.com
  ```

### **7. Obter Credenciais**

- Após criar, você receberá:
  - **Client ID:** `123456789-abcdefg.apps.googleusercontent.com`
  - **Client Secret:** `GOCSPX-abcdefghijklmnop`

---

## 📝 **Arquivo .env.local**

Crie/atualize o arquivo `.env.local` na raiz do projeto:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# NextAuth
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔧 **Como Gerar NEXTAUTH_SECRET**

Execute no terminal:

```bash
openssl rand -base64 32
```

---

## ✅ **Verificação**

Após configurar, teste:

1. Reinicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/login`
3. Clique em "Entrar com Google"
4. Deve redirecionar para Google OAuth

---

## 🆘 **Precisa de Ajuda?**

Me informe:

1. **Nome do projeto** que você quer usar
2. **Domínio de produção** (se tiver)
3. **Seu email** para contato
4. **Se já tem conta Google Cloud Console**

Com essas informações, posso te guiar passo a passo! 🚀
