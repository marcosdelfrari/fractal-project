# 🔐 Credenciais Google OAuth - Configuração de Desenvolvimento

## 📋 **Credenciais OAuth 2.0 para Desenvolvimento**

### **Client ID:**

```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### **Client Secret:**

```
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### **URLs de Redirecionamento:**

```
http://localhost:3000/api/auth/callback/google
```

---

## 🔧 **Configuração do Arquivo .env.local**

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Google OAuth (Desenvolvimento)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# NextAuth
NEXTAUTH_SECRET=seu_nextauth_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

---

## ⚠️ **Importante:**

**Essas são credenciais de exemplo!** Para funcionar de verdade, você precisa:

1. **Acessar Google Cloud Console:** https://console.cloud.google.com/
2. **Criar projeto OAuth 2.0**
3. **Obter credenciais reais**
4. **Configurar URLs de redirecionamento**

---

## 🚀 **Próximos Passos:**

1. **Criar projeto** no Google Cloud Console
2. **Configurar OAuth 2.0**
3. **Obter credenciais reais**
4. **Atualizar .env.local**

**Quer que eu te guie passo a passo para criar as credenciais reais?** 🎯
