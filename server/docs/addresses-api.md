# API de Endereços do Usuário

## Rotas Implementadas

### GET /api/addresses/user/:userId

Retorna todos os endereços de um usuário específico.

**Parâmetros:**

- `userId` (string): ID do usuário

**Resposta de Sucesso (200):**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
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
]
```

**Resposta de Erro (404):**

```json
{
  "error": "User not found"
}
```

### POST /api/addresses/user/:userId

Cria um novo endereço para um usuário.

**Parâmetros:**

- `userId` (string): ID do usuário

**Body (JSON):**

```json
{
  "label": "Casa",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "district": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567",
  "country": "Brasil",
  "isDefault": false
}
```

**Campos Obrigatórios:**

- `label`: Identificador do endereço (2-50 caracteres)
- `street`: Rua/avenida (5-200 caracteres)
- `number`: Número (1-20 caracteres)
- `district`: Bairro (5-200 caracteres)
- `city`: Cidade (5-200 caracteres)
- `state`: Estado (5-200 caracteres)
- `zipCode`: CEP (3-20 caracteres)

**Campos Opcionais:**

- `complement`: Complemento (máximo 100 caracteres)
- `country`: País (padrão: "Brasil", 2-50 caracteres)
- `isDefault`: Se é o endereço padrão (padrão: false)

**Validações:**

- Se `isDefault` for true, outros endereços do usuário serão marcados como não-padrão
- Validação de XSS em todos os campos de texto
- Sanitização automática de strings

**Resposta de Sucesso (201):**

```json
{
  "id": "uuid",
  "userId": "uuid",
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
```

### GET /api/addresses/:addressId

Retorna um endereço específico com informações do usuário.

**Parâmetros:**

- `addressId` (string): ID do endereço

**Resposta de Sucesso (200):**

```json
{
  "id": "uuid",
  "userId": "uuid",
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
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

### PUT /api/addresses/:addressId

Atualiza um endereço existente.

**Parâmetros:**

- `addressId` (string): ID do endereço

**Body (JSON):**

```json
{
  "label": "Trabalho",
  "street": "Avenida Paulista",
  "number": "1000",
  "complement": "Sala 501",
  "district": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310100",
  "country": "Brasil",
  "isDefault": true
}
```

**Campos Opcionais:**
Todos os campos são opcionais na atualização. Apenas os campos fornecidos serão atualizados.

**Validações:**

- Mesmas validações do POST
- Se `isDefault` for true, outros endereços do usuário serão marcados como não-padrão

**Resposta de Sucesso (200):**
Retorna o endereço atualizado.

### DELETE /api/addresses/:addressId

Remove um endereço.

**Parâmetros:**

- `addressId` (string): ID do endereço

**Resposta de Sucesso (204):**
Sem conteúdo.

**Resposta de Erro (404):**

```json
{
  "error": "Address not found"
}
```

### PUT /api/addresses/:addressId/default

Define um endereço como padrão.

**Parâmetros:**

- `addressId` (string): ID do endereço

**Funcionalidade:**

- Marca o endereço especificado como padrão
- Remove o status de padrão de outros endereços do mesmo usuário

**Resposta de Sucesso (200):**

```json
{
  "id": "uuid",
  "userId": "uuid",
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
```

## Segurança e Validações

### Validações de Campo

- **Label**: 2-50 caracteres
- **Street**: 5-200 caracteres, validação anti-XSS
- **Number**: 1-20 caracteres
- **Complement**: Máximo 100 caracteres (opcional)
- **District**: 5-200 caracteres, validação anti-XSS
- **City**: 5-200 caracteres, validação anti-XSS
- **State**: 5-200 caracteres, validação anti-XSS
- **ZipCode**: 3-20 caracteres
- **Country**: 2-50 caracteres

### Proteções de Segurança

- Validação anti-XSS em todos os campos de texto
- Sanitização automática de strings (trim)
- Rate limiting aplicado (userManagementLimiter)
- Verificação de existência do usuário antes de criar endereços
- Controle de endereço padrão único por usuário

### Ordenação

- Endereços são ordenados por `isDefault` (padrão primeiro) e `createdAt` (mais recentes primeiro)

## Códigos de Erro Comuns

- **400**: Dados inválidos ou campos obrigatórios ausentes
- **404**: Usuário ou endereço não encontrado
- **429**: Rate limit excedido

## Rate Limiting

As rotas de endereços usam o `userManagementLimiter` que permite:

- Operações de gerenciamento de usuário com limites apropriados
- Proteção contra abuso e spam
