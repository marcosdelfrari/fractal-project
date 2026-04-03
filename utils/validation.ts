import { z } from "zod";

// Common validation patterns
export const commonValidations = {
  // Email validation with comprehensive checks
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .max(254, "O e-mail deve ter no máximo 254 caracteres")
    .email("Informe um endereço de e-mail válido")
    .toLowerCase()
    .trim()
    .refine(
      (email) => {

        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /data:/i,
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(email));
      },
      "O e-mail contém caracteres inválidos"
    ),

  // Strong password validation
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "A senha deve ter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"
    )
    .refine(
      (password) => {
        // Check for common weak passwords
        const commonPasswords = [
          "password", "123456", "qwerty", "abc123", "password123",
          "admin", "letmein", "welcome", "monkey", "dragon"
        ];
        return !commonPasswords.includes(password.toLowerCase());
      },
      "Esta senha é muito comum; escolha uma senha mais forte"
    ),

  // Request size validation
  validateRequestSize: (contentLength: number | null) => {
    const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB limit
    if (contentLength && contentLength > MAX_REQUEST_SIZE) {
      throw new Error("Corpo da requisição muito grande");
    }
  },

  // Rate limiting helper (basic implementation)
  rateLimit: new Map<string, { count: number; resetTime: number }>(),
  
  checkRateLimit: (identifier: string, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) => {
    const now = Date.now();
    const userLimit = commonValidations.rateLimit.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
      commonValidations.rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userLimit.count >= maxRequests) {
      return false;
    }
    
    userLimit.count++;
    return true;
  }
};

// Sanitization helpers
export const sanitizeInput = {
  // Remove potentially dangerous characters
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate and sanitize JSON input
  validateJsonInput: async (request: Request) => {
    const contentLength = request.headers.get("content-length");
    commonValidations.validateRequestSize(contentLength ? parseInt(contentLength) : null);

    try {
      return await request.json();
    } catch (error) {
      throw new Error("Formato JSON inválido");
    }
  }
};
