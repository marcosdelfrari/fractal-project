# API de Avaliações de Produtos

## Rotas Implementadas

### GET /api/reviews/product/:productId
Retorna todas as avaliações de um produto específico com informações do usuário.

**Parâmetros:**
- `productId` (string): ID do produto

**Query Parameters (Opcionais):**
- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máximo: 50)

**Resposta de Sucesso (200):**
```json
{
  "product": {
    "id": "uuid",
    "title": "Produto Exemplo"
  },
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "productId": "uuid",
      "rating": 5,
      "comment": "Excelente produto!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com",
        "photo": "https://example.com/photo.jpg"
      }
    }
  ],
  "averageRating": 4.5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /api/reviews/user/:userId
Retorna todas as avaliações feitas por um usuário específico.

**Parâmetros:**
- `userId` (string): ID do usuário

**Query Parameters (Opcionais):**
- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máximo: 50)

**Resposta de Sucesso (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "productId": "uuid",
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
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### GET /api/reviews/:reviewId
Retorna uma avaliação específica com informações do usuário e produto.

**Parâmetros:**
- `reviewId` (string): ID da avaliação

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente produto!",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "photo": "https://example.com/photo.jpg"
  },
  "product": {
    "id": "uuid",
    "title": "Produto Exemplo",
    "mainImage": "https://example.com/image.jpg",
    "slug": "produto-exemplo"
  }
}
```

### POST /api/reviews
Cria uma nova avaliação para um produto.

**Body (JSON):**
```json
{
  "userId": "uuid",
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente produto! Recomendo."
}
```

**Campos Obrigatórios:**
- `userId`: ID do usuário que está avaliando
- `productId`: ID do produto sendo avaliado
- `rating`: Nota de 1 a 5 estrelas (inteiro)

**Campos Opcionais:**
- `comment`: Comentário da avaliação (máximo 1000 caracteres)

**Validações:**
- Rating deve ser um inteiro entre 1 e 5
- Comentário deve ter no máximo 1000 caracteres
- Usuário só pode avaliar cada produto uma vez
- Usuário e produto devem existir

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "rating": 5,
  "comment": "Excelente produto! Recomendo.",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "photo": "https://example.com/photo.jpg"
  },
  "product": {
    "id": "uuid",
    "title": "Produto Exemplo",
    "mainImage": "https://example.com/image.jpg",
    "slug": "produto-exemplo"
  }
}
```

**Resposta de Erro (409) - Avaliação Duplicada:**
```json
{
  "error": "You have already reviewed this product. You can only review each product once."
}
```

### PUT /api/reviews/:reviewId
Atualiza uma avaliação existente.

**Parâmetros:**
- `reviewId` (string): ID da avaliação

**Body (JSON):**
```json
{
  "rating": 4,
  "comment": "Produto bom, mas poderia ser melhor."
}
```

**Campos Opcionais:**
- `rating`: Nova nota de 1 a 5 estrelas
- `comment`: Novo comentário (máximo 1000 caracteres)

**Validações:**
- Mesmas validações do POST
- Apenas campos fornecidos serão atualizados

**Resposta de Sucesso (200):**
Retorna a avaliação atualizada com dados do usuário e produto.

### DELETE /api/reviews/:reviewId
Remove uma avaliação.

**Parâmetros:**
- `reviewId` (string): ID da avaliação

**Resposta de Sucesso (204):**
Sem conteúdo.

**Resposta de Erro (404):**
```json
{
  "error": "Review not found"
}
```

## Funcionalidades Especiais

### ⭐ Sistema de Avaliação Única
- **Constraint única**: Um usuário só pode avaliar cada produto uma vez
- **Prevenção de duplicatas**: Verifica se já existe avaliação antes de criar
- **Atualização permitida**: Usuário pode atualizar sua avaliação existente

### 📊 Média de Avaliações
- **Cálculo automático**: Média das avaliações é calculada para cada produto
- **Precisão decimal**: Suporta médias como 4.3, 4.7, etc.
- **Fallback**: Retorna 0 se não houver avaliações

### 🔍 Paginação Inteligente
- **Padrão**: 10 itens por página
- **Máximo**: 50 itens por página
- **Ordenação**: Avaliações mais recentes primeiro
- **Informações completas**: Total, páginas, página atual

### 👤 Dados do Usuário
- **Informações seguras**: Apenas dados públicos do usuário
- **Foto opcional**: Inclui foto se disponível
- **Anonimização**: Email pode ser mascarado se necessário

## Segurança e Validações

### 🔒 Validações de Campo
- **Rating**: Deve ser inteiro entre 1 e 5
- **Comment**: Máximo 1000 caracteres, sanitização automática
- **IDs**: Validação de formato UUID
- **Existência**: Verifica se usuário e produto existem

### 🚦 Rate Limiting
- **userManagementLimiter**: Proteção contra spam de avaliações
- **Limites apropriados**: Balanceamento entre usabilidade e segurança

### 🛡️ Proteções de Dados
- **Dados sensíveis**: Não expõe informações privadas do usuário
- **Sanitização**: Trim automático em comentários
- **Validação de entrada**: Verificação rigorosa de todos os campos

## Casos de Uso

### Frontend - Exibir Avaliações do Produto
```javascript
// Buscar avaliações de um produto
const response = await fetch('/api/reviews/product/product-id?page=1&limit=10');
const data = await response.json();

// Exibir avaliações
data.reviews.forEach(review => {
  console.log(`${review.user.name}: ${review.rating} estrelas`);
  if (review.comment) {
    console.log(`Comentário: ${review.comment}`);
  }
});

// Exibir média
console.log(`Média de avaliações: ${data.averageRating}`);
```

### Frontend - Criar Avaliação
```javascript
// Criar nova avaliação
const reviewData = {
  userId: 'user-id',
  productId: 'product-id',
  rating: 5,
  comment: 'Excelente produto!'
};

const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reviewData)
});

if (response.status === 201) {
  console.log('Avaliação criada com sucesso!');
} else if (response.status === 409) {
  console.log('Você já avaliou este produto.');
}
```

### Frontend - Atualizar Avaliação
```javascript
// Atualizar avaliação existente
const updateData = {
  rating: 4,
  comment: 'Produto bom, mas poderia ser melhor.'
};

const response = await fetch('/api/reviews/review-id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});
```

## Relação com Schema

### Modelo Review
```prisma
model Review {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  rating    Int      // 1-5 estrelas
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId]) // Um usuário só pode avaliar um produto uma vez
}
```

### Relacionamentos
- **User ↔ Review**: Um usuário pode fazer múltiplas avaliações
- **Product ↔ Review**: Um produto pode ter múltiplas avaliações
- **Cascade Delete**: Se usuário ou produto for deletado, avaliações são removidas

### Índices e Performance
- **Constraint única**: Garante integridade dos dados
- **Timestamps**: Controle automático de criação e atualização
- **Relacionamentos**: Otimizados para consultas eficientes
