# API de Perfil do Usuário

## Rotas Implementadas

### GET /api/users/:id/profile

Retorna o perfil completo do usuário incluindo endereços, avaliações e wishlist.

**Parâmetros:**

- `id` (string): ID do usuário

**Resposta de Sucesso (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678901",
  "photo": "https://example.com/photo.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "addresses": [
    {
      "id": "uuid",
      "label": "Casa",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567",
      "country": "Brasil",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excelente produto!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": "uuid",
        "title": "Produto Exemplo",
        "mainImage": "https://example.com/image.jpg",
        "slug": "produto-exemplo"
      }
    }
  ],
  "Wishlist": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "title": "Produto na Wishlist",
        "mainImage": "https://example.com/image.jpg",
        "price": 9999,
        "slug": "produto-wishlist"
      }
    }
  ]
}
```

**Resposta de Erro (404):**

```json
{
  "error": "User not found"
}
```

### PUT /api/users/:id/profile

Atualiza os dados do perfil do usuário (apenas campos permitidos).

**Parâmetros:**

- `id` (string): ID do usuário

**Body (JSON):**

```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678901",
  "photo": "https://example.com/photo.jpg"
}
```

**Campos Permitidos:**

- `name` (string, opcional): Nome do usuário (mínimo 2 caracteres)
- `phone` (string, opcional): Telefone (mínimo 10 caracteres)
- `cpf` (string, opcional): CPF (exatamente 11 dígitos)
- `photo` (string, opcional): URL da foto do usuário

**Validações:**

- Nome deve ter pelo menos 2 caracteres
- Telefone deve ter pelo menos 10 caracteres
- CPF deve ter exatamente 11 dígitos
- Campos vazios são convertidos para `null`

**Resposta de Sucesso (200):**
Retorna o perfil completo atualizado (mesmo formato do GET).

**Respostas de Erro:**

- `400`: Dados inválidos
- `404`: Usuário não encontrado

**Exemplo de Erro (400):**

```json
{
  "error": "Name must be at least 2 characters long"
}
```

## Segurança

- A senha nunca é retornada nas respostas
- Campos sensíveis como `email` e `role` não podem ser alterados via perfil
- Validação rigorosa de todos os campos de entrada
- Sanitização automática de strings (trim)

## Ordenação

- **Endereços**: Ordenados por `isDefault` (padrão primeiro)
- **Avaliações**: Ordenadas por data de criação (mais recentes primeiro)
- **Wishlist**: Ordenada por ID (mais recentes primeiro)
