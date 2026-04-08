const rateLimit = require('express-rate-limit');

const skipGeneralRateLimit = () =>
  process.env.NODE_ENV === 'development' ||
  process.env.DISABLE_API_RATE_LIMIT === 'true';

// General API rate limiter - applies to all API routes
// Em desenvolvimento: desligado — Next (SSR + HMR + prefetch) gera muitas chamadas ao Express local.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP per windowMs (produção)
  message: {
    error: 'Muitas requisições deste IP. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipGeneralRateLimit,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições deste IP. Tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

// Strict rate limiter for user registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6, // Limit each IP to 3 registration attempts per hour
  message: {
    error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
      retryAfter: '1 hora'
    });
  }
});

// Moderate rate limiter for user management endpoints
const userManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Limit each IP to 20 requests per windowMs
  message: {
    error: 'Muitas operações de gestão de usuários. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas operações de gestão de usuários. Tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 10 uploads per windowMs
  message: {
    error: 'Muitos envios de arquivo. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitos envios de arquivo. Tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

// Rate limiter for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 30 search requests per minute
  message: {
    error: 'Muitas buscas. Tente novamente mais tarde.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas buscas. Tente novamente mais tarde.',
      retryAfter: '1 minuto'
    });
  }
});

/** POST /api/orders — criação de pedido (checkout); mais estrito que leituras. */
const orderCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Muitas tentativas de criar pedido deste IP. Tente novamente mais tarde.",
    retryAfter: "15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Muitas tentativas de criar pedido deste IP. Tente novamente mais tarde.",
      retryAfter: "15 minutos",
    });
  },
});

/** POST /api/orders/:orderId/items — adicionar linha ao pedido; checkout agregado usa POST /api/orders com `items`. */
const orderLinePostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: {
    error: "Muitas operações de itens do pedido. Tente novamente mais tarde.",
    retryAfter: "15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Muitas operações de itens do pedido. Tente novamente mais tarde.",
      retryAfter: "15 minutos",
    });
  },
});

/** GET/PUT/DELETE em pedidos e itens (autenticado / admin). */
const orderReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: "Muitas operações de pedido. Tente novamente mais tarde.",
    retryAfter: "15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Muitas operações de pedido. Tente novamente mais tarde.",
      retryAfter: "15 minutos",
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  userManagementLimiter,
  uploadLimiter,
  searchLimiter,
  orderCreateLimiter,
  orderLinePostLimiter,
  orderReadLimiter,
};
