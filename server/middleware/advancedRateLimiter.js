const rateLimit = require('express-rate-limit');

const skipProductRateLimit = () =>
  process.env.NODE_ENV === 'development' ||
  process.env.DISABLE_API_RATE_LIMIT === 'true';

// Rate limiter for password reset attempts
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 6, // Limit to 3 password reset attempts per hour per IP
  message: {
    error: 'Muitas tentativas de redefinição de senha. Tente novamente mais tarde.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de redefinição de senha. Tente novamente mais tarde.',
      retryAfter: '1 hora'
    });
  }
});

// Rate limiter for admin operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Higher limit for admin operations
  message: {
    error: 'Muitas operações administrativas. Tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas operações administrativas. Tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

// Rate limiter for wishlist operations
const wishlistLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40, // Limit wishlist operations
  message: {
    error: 'Muitas operações na lista de desejos. Tente novamente mais tarde.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas operações na lista de desejos. Tente novamente mais tarde.',
      retryAfter: '5 minutos'
    });
  }
});

// Rate limiter for product operations (viewing, etc.)
const productLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,
  message: {
    error: 'Muitas requisições de produto. Tente novamente mais tarde.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipProductRateLimit,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições de produto. Tente novamente mais tarde.',
      retryAfter: '1 minuto'
    });
  }
});

// Dynamic rate limiter that can be configured per endpoint
const createDynamicLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: `${Math.ceil(windowMs / 60000)} minutos`
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: `${Math.ceil(windowMs / 60000)} minutos`
      });
    }
  });
};

module.exports = {
  passwordResetLimiter,
  adminLimiter,
  wishlistLimiter,
  productLimiter,
  createDynamicLimiter
};
