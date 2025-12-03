const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const userProfileController = require("../controllers/userProfile");

/**
 * Rotas para gerenciamento de perfil do usuário
 * Implementa GET e PUT para /api/users/:id/profile
 */

// Rate limiting específico para perfil do usuário
const profileRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operações por IP a cada 15 minutos
  message: {
    success: false,
    message: "Muitas operações de perfil. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para atualizações
const updateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 atualizações por IP a cada 15 minutos
  message: {
    success: false,
    message: "Muitas atualizações de perfil. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/users/:id/profile
 * Busca o perfil de um usuário específico
 *
 * Parâmetros:
 * - id: ID do usuário
 *
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "name": "João Silva",
 *     "phone": "(11) 99999-9999",
 *     "cpf": "000.000.000-00",
 *     "photo": "https://example.com/photo.jpg",
 *     "role": "user",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z",
 *     "stats": {
 *       "totalAddresses": 2,
 *       "totalReviews": 5,
 *       "totalWishlist": 3
 *     }
 *   }
 * }
 *
 * Response Error (404):
 * {
 *   "success": false,
 *   "message": "Usuário não encontrado"
 * }
 */
router.get(
  "/:id/profile",
  profileRateLimit,
  userProfileController.getUserProfile
);

/**
 * PUT /api/users/:id/profile
 * Atualiza o perfil de um usuário
 *
 * Parâmetros:
 * - id: ID do usuário
 *
 * Body (JSON):
 * {
 *   "name": "João Silva",
 *   "phone": "(11) 99999-9999",
 *   "cpf": "000.000.000-00",
 *   "photo": "https://example.com/photo.jpg",
 *   "currentPassword": "senhaAtual",
 *   "newPassword": "novaSenha123"
 * }
 *
 * Campos Opcionais:
 * - name: Nome do usuário (2-100 caracteres)
 * - phone: Telefone no formato (11) 99999-9999
 * - cpf: CPF no formato 000.000.000-00
 * - photo: URL da foto (deve terminar com extensão de imagem)
 * - currentPassword: Senha atual (obrigatória para alterar senha)
 * - newPassword: Nova senha (mínimo 8 caracteres)
 *
 * Validações:
 * - Nome: 2-100 caracteres
 * - Telefone: Formato brasileiro (11) 99999-9999
 * - CPF: Formato brasileiro 000.000.000-00
 * - Foto: URL válida com extensão de imagem
 * - Senha: Mínimo 8 caracteres, senha atual obrigatória
 *
 * Response Success (200):
 * {
 *   "success": true,
 *   "message": "Perfil atualizado com sucesso",
 *   "data": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "name": "João Silva",
 *     "phone": "(11) 99999-9999",
 *     "cpf": "000.000.000-00",
 *     "photo": "https://example.com/photo.jpg",
 *     "role": "user",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Response Error (400):
 * {
 *   "success": false,
 *   "message": "Nome deve ter entre 2 e 100 caracteres"
 * }
 */
router.put(
  "/:id/profile",
  updateRateLimit,
  userProfileController.updateUserProfile
);

/**
 * GET /api/users/:id/stats
 * Busca estatísticas do usuário
 *
 * Parâmetros:
 * - id: ID do usuário
 *
 * Response Success (200):
 * {
 *   "success": true,
 *   "data": {
 *     "addresses": {
 *       "total": 2,
 *       "default": 1
 *     },
 *     "reviews": {
 *       "total": 5,
 *       "average": {
 *         "_avg": {
 *           "rating": 4.2
 *         }
 *       }
 *     },
 *     "wishlist": {
 *       "total": 3
 *     },
 *     "orders": {
 *       "total": 10,
 *       "totalSpent": 1500.00
 *     }
 *   }
 * }
 */
router.get("/:id/stats", profileRateLimit, userProfileController.getUserStats);

// Importar controller de pedidos do usuário
const { getUserOrders } = require("../controllers/users");

/**
 * GET /api/users/:id/orders
 * Busca pedidos do usuário
 */
router.get("/:id/orders", profileRateLimit, getUserOrders);

module.exports = router;
