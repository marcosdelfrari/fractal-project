const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

// Carrega defaults de forma robusta, com fallback para objeto vazio.
// Suporta estrutura local (server/controllers) e estrutura em container (/app/controllers).
let HOME_SECTION_DEFAULTS = {};
try {
  const candidatePaths = [
    path.join(__dirname, "..", "..", "data", "home-section-defaults.json"),
    path.join(__dirname, "..", "data", "home-section-defaults.json"),
    path.join(process.cwd(), "data", "home-section-defaults.json"),
  ];

  const defaultsPath = candidatePaths.find((p) => fs.existsSync(p));
  if (defaultsPath) {
    HOME_SECTION_DEFAULTS = require(defaultsPath);
  } else {
    console.warn(
      `[settings] arquivo de defaults não encontrado. Tentados: ${candidatePaths.join(", ")}`,
    );
  }
} catch (err) {
  console.warn(`[settings] erro ao carregar defaults:`, err.message);
}
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { asyncHandler, AppError } = require("../utills/errorHandler");

const DEFAULT_SITE_ID = "default-site-id";
const DEFAULT_NAV_LINKS = [
  { id: "Seda", name: "Seda", href: "/loja", hasMegaMenu: false },
  { id: "Piteiras", name: "Piteiras", href: "/loja", hasMegaMenu: false },
  { id: "Isqueiro", name: "Isqueiro", href: "/loja", hasMegaMenu: false },
];

/** Seções padrão da home (quando a tabela ainda está vazia). */
const DEFAULT_HOME_SECTIONS = [
  {
    name: "hero",
    enabled: true,
    order: 0,
    content: HOME_SECTION_DEFAULTS.hero,
  },
  {
    name: "promoSlider",
    enabled: true,
    order: 1,
    content: HOME_SECTION_DEFAULTS.promoSlider,
  },
  {
    name: "categoryMenu",
    enabled: true,
    order: 2,
    content: HOME_SECTION_DEFAULTS.categoryMenu,
  },
  { name: "productsSection", enabled: true, order: 3, content: null },
  {
    name: "featuredProducts",
    enabled: true,
    order: 4,
    content: HOME_SECTION_DEFAULTS.featuredProducts,
  },
];

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

const EXT_TO_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

/**
 * Vitrine não deve receber só `logo.png` (o browser pede `/logo.png` e dá 404 na Vercel).
 * Se já for data URL ou http(s), devolve igual; senão tenta ler de `public/` e embute em base64.
 * Se o arquivo não existir no servidor, devolve null (evita src inválido).
 */
function inlineSiteImageForPublicApi(stored) {
  if (stored == null || stored === "") return null;
  const s = String(stored).trim();
  if (!s) return null;
  if (s.startsWith("data:")) return s;
  if (/^https?:\/\//i.test(s)) return s;
  let rel = s.startsWith("/") ? s.slice(1) : s;
  if (!rel || rel.includes("..")) return null;
  rel = path.normalize(rel);
  const abs = path.resolve(PUBLIC_DIR, rel);
  const root = path.resolve(PUBLIC_DIR);
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  try {
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null;
    const buf = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    const mime = EXT_TO_MIME[ext] || "application/octet-stream";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (_) {
    return null;
  }
}

/** Campos expostos à vitrine (contrato estável; não incluir id nem metadados internos). */
function toPublicSiteSettingsDto(row) {
  return {
    storeName: row.storeName,
    storeIcon: inlineSiteImageForPublicApi(row.storeIcon),
    storeLogo: inlineSiteImageForPublicApi(row.storeLogo),
    navBrandDesktopMode: row.navBrandDesktopMode,
    navBrandMobileMode: row.navBrandMobileMode,
    hideStoreNameUntilLoaded: row.hideStoreNameUntilLoaded,
    navLinks: row.navLinks ?? DEFAULT_NAV_LINKS,
    whatsapp: row.whatsapp,
    facebook: row.facebook,
    instagram: row.instagram,
    x: row.x,
    pinterest: row.pinterest,
    youtube: row.youtube,
    linkedin: row.linkedin,
    tiktok: row.tiktok,
    address: row.address,
    email: row.email,
    phone: row.phone,
    pickupAddresses: row.pickupAddresses,
    checkoutMode: row.checkoutMode,
    deliveryEnabled: row.deliveryEnabled,
    upcomingEvents: row.upcomingEvents,
  };
}

function publicSiteSettingsETag(row) {
  const basis = row.updatedAt
    ? row.updatedAt.toISOString()
    : `${row.id}-${row.storeName}`;
  const hash = crypto
    .createHash("sha1")
    .update(basis)
    .digest("hex")
    .slice(0, 20);
  return `"${hash}"`;
}

async function getOrCreateSiteSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: DEFAULT_SITE_ID,
        storeName: "Fractal Store",
        navBrandDesktopMode: "name",
        navBrandMobileMode: "name",
        hideStoreNameUntilLoaded: true,
        navLinks: DEFAULT_NAV_LINKS,
      },
    });
  }

  return settings;
}

async function ensureDefaultHomeSections() {
  const count = await prisma.homeSection.count();
  if (count > 0) return;
  const { randomUUID } = require("crypto");
  for (const s of DEFAULT_HOME_SECTIONS) {
    await prisma.homeSection.create({
      data: {
        id: randomUUID(),
        name: s.name,
        enabled: s.enabled,
        order: s.order,
        content: s.content ?? null,
      },
    });
  }
}

/** GET /api/settings/public — DTO da vitrine + ETag / Cache-Control (invalidação via updatedAt). */
const getPublicSiteSettings = asyncHandler(async (request, response) => {
  const row = await getOrCreateSiteSettings();
  const etag = publicSiteSettingsETag(row);
  response.setHeader(
    "Cache-Control",
    "public, max-age=60, stale-while-revalidate=300",
  );
  response.setHeader("ETag", etag);

  const inm = request.headers["if-none-match"];
  if (inm && inm === etag) {
    return response.status(304).end();
  }

  if (request.method === "HEAD") {
    return response.status(200).end();
  }

  return response.status(200).json(toPublicSiteSettingsDto(row));
});

// Get site settings (payload completo — apenas admin no Express)
const getSiteSettings = asyncHandler(async (request, response) => {
  const settings = await getOrCreateSiteSettings();
  return response.status(200).json(settings);
});

// Update site settings
const updateSiteSettings = asyncHandler(async (request, response) => {
  const {
    storeName,
    storeIcon,
    storeLogo,
    whatsapp,
    facebook,
    instagram,
    x,
    pinterest,
    youtube,
    linkedin,
    tiktok,
    address,
    email,
    phone,
    pickupAddresses,
    checkoutMode,
    deliveryEnabled,
    navBrandDesktopMode,
    navBrandMobileMode,
    hideStoreNameUntilLoaded,
    navLinks,
    upcomingEvents,
  } = request.body;

  let row = await prisma.siteSettings.findFirst();

  const normalizedCheckoutMode =
    checkoutMode === "delivery_only" || checkoutMode === "pickup_only"
      ? checkoutMode
      : checkoutMode === "delivery_and_pickup"
        ? "delivery_and_pickup"
        : null;
  const resolvedDeliveryEnabled =
    normalizedCheckoutMode === "pickup_only"
      ? false
      : normalizedCheckoutMode === "delivery_only" ||
          normalizedCheckoutMode === "delivery_and_pickup"
        ? true
        : deliveryEnabled !== undefined
          ? Boolean(deliveryEnabled)
          : true;

  if (!row) {
    row = await prisma.siteSettings.create({
      data: {
        id: DEFAULT_SITE_ID,
        storeName: storeName ?? "Fractal Store",
        storeIcon: storeIcon ?? null,
        storeLogo: storeLogo ?? null,
        whatsapp: whatsapp ?? null,
        facebook: facebook ?? null,
        instagram: instagram ?? null,
        x: x ?? null,
        pinterest: pinterest ?? null,
        youtube: youtube ?? null,
        linkedin: linkedin ?? null,
        tiktok: tiktok ?? null,
        address: address ?? null,
        email: email ?? null,
        phone: phone ?? null,
        pickupAddresses: pickupAddresses ?? null,
        checkoutMode: normalizedCheckoutMode ?? "delivery_and_pickup",
        deliveryEnabled: resolvedDeliveryEnabled,
        navBrandDesktopMode: navBrandDesktopMode === "logo" ? "logo" : "name",
        navBrandMobileMode: navBrandMobileMode === "logo" ? "logo" : "name",
        hideStoreNameUntilLoaded: hideStoreNameUntilLoaded !== false,
        navLinks: Array.isArray(navLinks) ? navLinks : DEFAULT_NAV_LINKS,
        ...(upcomingEvents !== undefined && { upcomingEvents }),
      },
    });
    return response.status(200).json(row);
  }

  const updated = await prisma.siteSettings.update({
    where: { id: row.id },
    data: {
      ...(storeName !== undefined && { storeName }),
      ...(storeIcon !== undefined && { storeIcon }),
      ...(storeLogo !== undefined && { storeLogo }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(facebook !== undefined && { facebook }),
      ...(instagram !== undefined && { instagram }),
      ...(x !== undefined && { x }),
      ...(pinterest !== undefined && { pinterest }),
      ...(youtube !== undefined && { youtube }),
      ...(linkedin !== undefined && { linkedin }),
      ...(tiktok !== undefined && { tiktok }),
      ...(address !== undefined && { address }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(pickupAddresses !== undefined && { pickupAddresses }),
      ...(normalizedCheckoutMode !== null && {
        checkoutMode: normalizedCheckoutMode,
      }),
      ...(deliveryEnabled !== undefined || normalizedCheckoutMode !== null
        ? { deliveryEnabled: resolvedDeliveryEnabled }
        : {}),
      ...(navBrandDesktopMode !== undefined && {
        navBrandDesktopMode: navBrandDesktopMode === "logo" ? "logo" : "name",
      }),
      ...(navBrandMobileMode !== undefined && {
        navBrandMobileMode: navBrandMobileMode === "logo" ? "logo" : "name",
      }),
      ...(hideStoreNameUntilLoaded !== undefined && {
        hideStoreNameUntilLoaded: Boolean(hideStoreNameUntilLoaded),
      }),
      ...(navLinks !== undefined && {
        navLinks: Array.isArray(navLinks) ? navLinks : DEFAULT_NAV_LINKS,
      }),
      ...(upcomingEvents !== undefined && { upcomingEvents }),
    },
  });

  return response.status(200).json(updated);
});

// Get all home sections
const getHomeSections = asyncHandler(async (request, response) => {
  await ensureDefaultHomeSections();
  const sections = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });
  return response.status(200).json(sections);
});

/** Limite do binário antes do base64 (SiteSettings LongText). */
const MAX_SITE_ASSET_BYTES = 2.5 * 1024 * 1024;

/** Remove arquivo antigo em `public/` (nome simples, `/uploads/...` ou legado). */
function safeUnlinkPublicAsset(publicDir, stored) {
  if (!stored || typeof stored !== "string") return;
  const t = stored.trim();
  if (!t || /^https?:\/\//i.test(t)) return;
  let rel = t.startsWith("/") ? t.slice(1) : t;
  if (rel.includes("..")) return;
  rel = path.normalize(rel);
  const resolvedRoot = path.resolve(publicDir);
  const abs = path.resolve(publicDir, rel);
  if (!abs.startsWith(resolvedRoot + path.sep) && abs !== resolvedRoot) return;
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (_) {
    /* ignore */
  }
}

// Ícone/logo: grava `data:image/...;base64,...` em SiteSettings (vitrine lê só da API / DB; sem depender de disco no deploy).
const uploadSiteAsset = asyncHandler(async (request, response) => {
  const type = request.body?.type;
  if (type !== "storeIcon" && type !== "storeLogo") {
    throw new AppError("type deve ser storeIcon ou storeLogo", 400);
  }

  if (!request.files || !request.files.file) {
    throw new AppError("Arquivo (campo file) é obrigatório", 400);
  }

  const file = request.files.file;
  const mimetype = file.mimetype || "";
  if (!ALLOWED_IMAGE_MIME.has(mimetype)) {
    throw new AppError(
      "Tipo de arquivo não permitido. Use imagem (PNG, JPG, WebP ou ICO).",
      400,
    );
  }

  let buffer = file.data;
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const tmp = file.tempFilePath;
    if (tmp && fs.existsSync(tmp)) {
      try {
        buffer = fs.readFileSync(tmp);
      } catch (_) {
        buffer = null;
      }
    }
  }
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AppError(
      "Não foi possível ler o arquivo (tente de novo ou outro formato).",
      400,
    );
  }
  if (buffer.length > MAX_SITE_ASSET_BYTES) {
    throw new AppError("Arquivo muito grande (máximo 2,5 MB).", 400);
  }

  const dataUrl = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const publicDir = path.join(__dirname, "..", "..", "public");

  let row = await prisma.siteSettings.findFirst();
  if (row?.[type] && typeof row[type] === "string") {
    const prev = row[type];
    if (!prev.startsWith("data:")) {
      safeUnlinkPublicAsset(publicDir, prev);
    }
  }

  if (!row) {
    row = await prisma.siteSettings.create({
      data: {
        id: DEFAULT_SITE_ID,
        storeName: "Fractal Store",
        [type]: dataUrl,
      },
    });
  } else {
    row = await prisma.siteSettings.update({
      where: { id: row.id },
      data: { [type]: dataUrl },
    });
  }

  return response.status(200).json({ url: dataUrl, settings: row });
});

/** Upload de imagem para seções da home (card de categorias, slides em destaque). Só arquivo; retorna URL pública. */
const uploadSectionAsset = asyncHandler(async (request, response) => {
  if (!request.files || !request.files.file) {
    throw new AppError("Arquivo (campo file) é obrigatório", 400);
  }

  const file = request.files.file;
  const mimetype = file.mimetype || "";
  if (!ALLOWED_IMAGE_MIME.has(mimetype)) {
    throw new AppError(
      "Tipo de arquivo não permitido. Use imagem (PNG, JPG, WebP ou ICO).",
      400,
    );
  }

  const extFromName = path.extname(file.name || "") || "";
  const ext = extFromName && extFromName.length <= 8 ? extFromName : ".png";

  const filename = `section-${nanoid(12)}${ext}`;
  const uploadDir = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    "sections",
  );
  fs.mkdirSync(uploadDir, { recursive: true });
  const destPath = path.join(uploadDir, filename);

  await new Promise((resolve, reject) => {
    file.mv(destPath, (err) => (err ? reject(err) : resolve()));
  });

  const publicUrl = `/uploads/sections/${filename}`;
  return response.status(200).json({ url: publicUrl });
});

// Create or update home section
const updateHomeSection = asyncHandler(async (request, response) => {
  const { name, enabled, order, content } = request.body;

  if (!name || String(name).trim().length === 0) {
    throw new AppError("Nome da seção é obrigatório", 400);
  }

  const trimmed = String(name).trim();
  const existing = await prisma.homeSection.findUnique({
    where: { name: trimmed },
  });

  if (!existing) {
    const { randomUUID } = require("crypto");
    const created = await prisma.homeSection.create({
      data: {
        id: randomUUID(),
        name: trimmed,
        enabled: enabled !== undefined ? enabled : true,
        order: order !== undefined ? order : 0,
        content: content !== undefined ? content : null,
      },
    });
    return response.status(201).json(created);
  }

  const updated = await prisma.homeSection.update({
    where: { name: trimmed },
    data: {
      ...(enabled !== undefined && { enabled }),
      ...(order !== undefined && { order }),
      ...(content !== undefined && { content }),
    },
  });

  return response.status(200).json(updated);
});

// Update section order (bulk); opcionalmente também persiste `enabled` por seção
const updateSectionsOrder = asyncHandler(async (request, response) => {
  const { sections } = request.body;

  if (!Array.isArray(sections)) {
    throw new AppError(
      "É obrigatório enviar um array de seções (sections)",
      400,
    );
  }

  await prisma.$transaction(
    sections.map((s) => {
      if (!s.id || typeof s.order !== "number") {
        throw new AppError(
          "Cada seção deve ter id e ordem (order) numérica",
          400,
        );
      }
      const data = { order: s.order };
      if (typeof s.enabled === "boolean") {
        data.enabled = s.enabled;
      }
      return prisma.homeSection.update({
        where: { id: s.id },
        data,
      });
    }),
  );

  const updated = await prisma.homeSection.findMany({
    orderBy: { order: "asc" },
  });
  return response.status(200).json(updated);
});

// Toggle section enabled status
const toggleSection = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("ID da seção é obrigatório", 400);
  }

  const section = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!section) {
    throw new AppError("Seção não encontrada", 404);
  }

  const updated = await prisma.homeSection.update({
    where: { id },
    data: { enabled: !section.enabled },
  });

  return response.status(200).json(updated);
});

module.exports = {
  getPublicSiteSettings,
  getSiteSettings,
  updateSiteSettings,
  getHomeSections,
  uploadSiteAsset,
  uploadSectionAsset,
  updateHomeSection,
  updateSectionsOrder,
  toggleSection,
};
