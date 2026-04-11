const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
}

function parseCookieHeader(cookieHeader) {
  const out = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Token bruto do cookie NextAuth ou Authorization: Bearer (mesmo formato do getToken).
 */
function extractRawSessionToken(req) {
  const auth = req.headers.authorization;
  if (
    auth &&
    typeof auth === "string" &&
    auth.toLowerCase().startsWith("bearer ")
  ) {
    const raw = auth.slice(7).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  const cookies = parseCookieHeader(req.headers.cookie || "");
  return (
    cookies["__Secure-next-auth.session-token"] ||
    cookies["next-auth.session-token"] ||
    null
  );
}

function normalizeEmail(email) {
  return (email || "").toLowerCase().trim();
}

function isPayloadExpired(payload) {
  if (!payload) return true;
  if (payload.expired) return true;
  if (typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) return true;
  }
  return false;
}

/**
 * Decodifica JWT sem verificação (uso apenas quando o token já foi verificado pelo Next.js).
 * NextAuth fornece tokens JWT válidos; aqui só extraímos o payload.
 */
function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Verifica JWT usando jsonwebtoken (padrão HS256).
 * Compatível com tokens gerados pelo NextAuth com customEncode.
 */
function verifyJWT(token, secret) {
  // Log para debug: verificar formato do token
  const parts = token ? token.split(".") : [];
  console.log(`[auth] Token recebido: ${parts.length} partes, primeiros 50 chars: ${token?.substring(0, 50)}...`);
  
  // Se for JWE (5 partes), não tenta verificar com jsonwebtoken
  if (parts.length === 5) {
    console.log("[auth] Token é JWE (5 partes) - sessão antiga, precisa relogar");
    return null;
  }
  
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
    
    console.log("[auth] ✓ Token verificado com sucesso via jsonwebtoken");
    return payload;
  } catch (err) {
    console.error("[auth] Erro ao verificar JWT:", err.message);
    return null;
  }
}

/**
 * Fallback para JWE ou outros formatos: tenta usar next-auth/jwt
 */
async function decodeWithNextAuth(req, secret) {
  try {
    const { getToken } = await import("next-auth/jwt");
    const decoded = await getToken({
      req,
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });
    
    if (decoded) {
      console.log("[auth] ✓ Token decodificado com getToken (NextAuth)");
      return decoded;
    }
  } catch (err) {
    console.error("[auth] Erro ao usar getToken:", err.message);
  }
  
  return null;
}

async function decodeRequestAuth(req) {
  const secret = getAuthSecret();
  if (!secret) {
    console.error("[auth] NEXTAUTH_SECRET / AUTH_SECRET não configurado");
    return null;
  }
  const token = extractRawSessionToken(req);
  if (!token) {
    console.error("[auth] Nenhum token encontrado nos cookies ou Authorization header");
    return null;
  }
  
  try {
    // Caminho rápido para Bearer/JWS tradicional.
    const payload = verifyJWT(token, secret);
    if (payload && !isPayloadExpired(payload)) {
      console.log("[auth] Token verificado com sucesso (JWS)");
      return payload;
    }
    
    if (!payload) {
      console.error("[auth] Falha ao verificar assinatura JWT");
    }
    if (payload && isPayloadExpired(payload)) {
      console.error("[auth] Token expirado");
    }

    // Compatibilidade com formatos internos do NextAuth (ex.: JWE).
    console.log("[auth] Tentando decodificar com next-auth/jwt como fallback");
    const nextAuthPayload = await decodeWithNextAuth(req, secret);
    if (nextAuthPayload && !isPayloadExpired(nextAuthPayload)) {
      console.log("[auth] ✓ Token decodificado com sucesso via NextAuth");
      return nextAuthPayload;
    }
    
    if (nextAuthPayload && isPayloadExpired(nextAuthPayload)) {
      console.error("[auth] Token NextAuth expirado");
    } else {
      console.error("[auth] Falha ao decodificar com NextAuth");
    }

    return null;
  } catch (err) {
    console.error("[auth] Erro ao decodificar token:", err.message);
    return null;
  }
}

function isAuthenticatedPayload(payload) {
  if (!payload) return false;
  if (isPayloadExpired(payload)) return false;
  if (!payload.email && !payload.sub) return false;
  return true;
}

/**
 * Anexa req.auth com o payload do JWT (email, role, id, …) ou responde 401.
 */
async function requireAuth(req, res, next) {
  try {
    const payload = await decodeRequestAuth(req);
    if (!isAuthenticatedPayload(payload)) {
      return res.status(401).json({
        error: "Não autenticado",
        details: "Token de sessão ausente, inválido ou expirado",
      });
    }
    req.auth = payload;
    return next();
  } catch (err) {
    console.error("[auth] requireAuth", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const payload = await decodeRequestAuth(req);
    if (!isAuthenticatedPayload(payload)) {
      return res.status(401).json({
        error: "Não autenticado",
        details: "Token de sessão ausente, inválido ou expirado",
      });
    }
    if (payload.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Acesso negado", details: "Requer administrador" });
    }
    req.auth = payload;
    return next();
  } catch (err) {
    console.error("[auth] requireAdmin", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

/**
 * Admin ou e-mail do pedido = e-mail do token. `req.params[paramName]` é o id do pedido (customer_order.id).
 */
function requireOrderOwnerOrAdmin(paramName = "id") {
  return async (req, res, next) => {
    try {
      const payload = await decodeRequestAuth(req);
      if (!isAuthenticatedPayload(payload)) {
        return res.status(401).json({
          error: "Não autenticado",
          details: "Token de sessão ausente, inválido ou expirado",
        });
      }
      if (payload.role === "admin") {
        req.auth = payload;
        return next();
      }
      const orderId = req.params[paramName];
      if (!orderId) {
        return res.status(400).json({ error: "ID do pedido ausente" });
      }
      const order = await prisma.customer_order.findUnique({
        where: { id: orderId },
        select: { email: true },
      });
      if (!order) {
        return res.status(404).json({
          error: "Pedido não encontrado",
          details: "O pedido informado não existe",
        });
      }
      if (normalizeEmail(order.email) !== normalizeEmail(payload.email)) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      req.auth = payload;
      return next();
    } catch (err) {
      console.error("[auth] requireOrderOwnerOrAdmin", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

/**
 * GET com query `mode=admin` (ex.: listagem admin de produtos) exige admin.
 */
function requireAdminIfQueryAdmin(req, res, next) {
  if (req.query && String(req.query.mode) === "admin") {
    return requireAdmin(req, res, next);
  }
  return next();
}

function tokenUserId(payload) {
  return payload.id || payload.sub;
}

/**
 * Admin ou `params[paramName]` = id do usuário no JWT (conta própria).
 */
function requireSelfOrAdmin(paramName = "id") {
  return async (req, res, next) => {
    try {
      const payload = await decodeRequestAuth(req);
      if (!isAuthenticatedPayload(payload)) {
        return res.status(401).json({
          error: "Não autenticado",
          details: "Token de sessão ausente, inválido ou expirado",
        });
      }
      if (payload.role === "admin") {
        req.auth = payload;
        return next();
      }
      const paramId = req.params[paramName];
      const uid = tokenUserId(payload);
      if (!paramId || !uid || paramId !== uid) {
        return res.status(403).json({
          error: "Acesso negado",
          details: "Você só pode acessar os dados da sua própria conta",
        });
      }
      req.auth = payload;
      return next();
    } catch (err) {
      console.error("[auth] requireSelfOrAdmin", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

/** Dono do endereço (userId do registro) ou admin. */
function requireAddressOwnerOrAdmin(paramName = "addressId") {
  return async (req, res, next) => {
    try {
      const payload = await decodeRequestAuth(req);
      if (!isAuthenticatedPayload(payload)) {
        return res.status(401).json({
          error: "Não autenticado",
          details: "Token de sessão ausente, inválido ou expirado",
        });
      }
      const addressId = req.params[paramName];
      if (!addressId) {
        return res.status(400).json({ error: "ID do endereço ausente" });
      }
      const address = await prisma.address.findUnique({
        where: { id: addressId },
        select: { userId: true },
      });
      if (!address) {
        return res.status(404).json({ error: "Endereço não encontrado" });
      }
      if (payload.role === "admin") {
        req.auth = payload;
        return next();
      }
      const uid = tokenUserId(payload);
      if (!uid || address.userId !== uid) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      req.auth = payload;
      return next();
    } catch (err) {
      console.error("[auth] requireAddressOwnerOrAdmin", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

/** Autor da avaliação ou admin. */
function requireReviewOwnerOrAdmin() {
  return async (req, res, next) => {
    try {
      const payload = await decodeRequestAuth(req);
      if (!isAuthenticatedPayload(payload)) {
        return res.status(401).json({
          error: "Não autenticado",
          details: "Token de sessão ausente, inválido ou expirado",
        });
      }
      const reviewId = req.params.reviewId;
      if (!reviewId) {
        return res.status(400).json({ error: "ID da avaliação ausente" });
      }
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });
      if (!review) {
        return res.status(404).json({ error: "Avaliação não encontrada" });
      }
      if (payload.role === "admin") {
        req.auth = payload;
        return next();
      }
      const uid = tokenUserId(payload);
      if (!uid || review.userId !== uid) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      req.auth = payload;
      return next();
    } catch (err) {
      console.error("[auth] requireReviewOwnerOrAdmin", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireOrderOwnerOrAdmin,
  requireAdminIfQueryAdmin,
  requireSelfOrAdmin,
  requireAddressOwnerOrAdmin,
  requireReviewOwnerOrAdmin,
  tokenUserId,
};
