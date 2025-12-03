# API de Pedidos do Usuário

## Endpoint Implementado

### GET /api/users/:id/orders

Retorna todos os pedidos de um usuário específico com informações detalhadas dos produtos.

**Parâmetros:**

- `id` (string): ID do usuário

**Query Parameters (Opcionais):**

- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máximo: 50)

**Exemplo de Requisição:**

```
GET /api/users/uuid-do-usuario/orders?page=1&limit=10
```

**Resposta de Sucesso (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva"
  },
  "orders": [
    {
      "id": "order-uuid",
      "name": "João",
      "lastname": "Silva",
      "phone": "11999999999",
      "email": "user@example.com",
      "company": "Empresa LTDA",
      "address": {
        "street": "Rua das Flores",
        "apartment": "Apto 45",
        "postalCode": "01234567",
        "city": "São Paulo",
        "country": "Brasil"
      },
      "status": "delivered",
      "orderNotice": "Entregar após 18h",
      "total": 9999,
      "dateTime": "2024-01-01T10:30:00.000Z",
      "products": [
        {
          "id": "order-product-uuid",
          "quantity": 2,
          "product": {
            "id": "product-uuid",
            "title": "Produto Exemplo",
            "mainImage": "https://example.com/image.jpg",
            "price": 4999,
            "slug": "produto-exemplo"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Resposta de Erro (404):**

```json
{
  "error": "User not found"
}
```

**Resposta de Erro (400):**

```json
{
  "error": "User ID is required"
}
```

**Resposta de Erro (400) - Paginação Inválida:**

```json
{
  "error": "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 50"
}
```

## Funcionalidades

### 🔍 Busca por Email

- Os pedidos são buscados usando o email do usuário
- Garante que apenas pedidos do usuário autenticado sejam retornados
- Verifica se o usuário existe antes de buscar pedidos

### 📊 Paginação

- **Página padrão**: 1
- **Limite padrão**: 10 itens por página
- **Limite máximo**: 50 itens por página
- Retorna informações de paginação completas

### 📦 Dados dos Produtos

- Inclui informações detalhadas dos produtos em cada pedido
- Mostra quantidade de cada produto
- Inclui dados essenciais do produto (título, imagem, preço, slug)

### 🏠 Endereço Formatado

- Organiza dados de endereço em um objeto estruturado
- Facilita o uso no frontend

### 📅 Ordenação

- Pedidos ordenados por data de criação (mais recentes primeiro)

## Segurança

### 🔒 Validações

- Verificação de existência do usuário
- Validação de parâmetros de paginação
- Sanitização de entrada

### 🚦 Rate Limiting

- Usa `userManagementLimiter` para proteção contra abuso
- Limites apropriados para operações de usuário

### 🛡️ Dados Sensíveis

- Não expõe informações sensíveis do usuário
- Retorna apenas dados necessários para exibição de pedidos

## Casos de Uso

### Frontend - Lista de Pedidos

```javascript
// Buscar pedidos do usuário
const response = await fetch("/api/users/user-id/orders?page=1&limit=10");
const data = await response.json();

// Exibir pedidos
data.orders.forEach((order) => {
  console.log(`Pedido ${order.id} - ${order.status}`);
  order.products.forEach((item) => {
    console.log(`- ${item.product.title} x${item.quantity}`);
  });
});
```

### Paginação

```javascript
// Navegar para próxima página
const nextPage = data.pagination.page + 1;
if (nextPage <= data.pagination.totalPages) {
  const nextResponse = await fetch(
    `/api/users/user-id/orders?page=${nextPage}&limit=10`
  );
}
```

## Relação com Schema

### Como Funciona

- **User**: Identificado por ID
- **Customer_order**: Identificado por email
- **Relacionamento**: Busca pedidos onde `customer_order.email = user.email`

### Vantagens

- Não requer mudanças no schema existente
- Mantém compatibilidade com sistema atual
- Funciona com usuários registrados e não registrados

### Considerações Futuras

- Se necessário, pode ser adicionado campo `userId` ao modelo `Customer_order`
- Isso permitiria relacionamento direto e melhor performance
