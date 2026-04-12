/**
 * Popula SiteSettings e HomeSection com os mesmos valores que estavam mockados no Express.
 * Uso: npm run db:seed-settings
 * Antes: npx prisma db push (ou migrate) para criar as tabelas.
 */
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function homeSectionContentToDb(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

const HOME_DEFAULTS = require(path.join(
  __dirname,
  "..",
  "data",
  "home-section-defaults.json",
));

/** Alinhar com `server/utills/insertDemoData.js` (DEMO_SITE_SETTINGS). */
const SITE = {
  id: "default-site-id",
  storeName: "Fractal Store",
  storeIcon: null,
  storeLogo: null,
  email: "contato@fractalstore.com.br",
  phone: "+55 (11) 3456-7890",
  whatsapp: "+55 11 99999-9999",
  address:
    "Av. Paulista, 1578 — Bela Vista, São Paulo/SP — CEP 01310-200",
  pickupAddresses: [
    {
      id: "pickup-demo-paulista",
      name: "Loja — Av. Paulista",
      address:
        "Av. Paulista, 1578 — Bela Vista, São Paulo/SP — CEP 01310-200\nHorário: seg a sex 10h–19h",
    },
    {
      id: "pickup-demo-zsul",
      name: "Depósito — Zona Sul",
      address:
        "Rua das Flores, 450 — Vila Mariana, São Paulo/SP — CEP 04120-000\nRetirada agendada.",
    },
  ],
  deliveryEnabled: true,
  upcomingEvents: {
    enabled: true,
    ...JSON.parse(JSON.stringify(HOME_DEFAULTS.upcomingEvents)),
  },
};

const SECTIONS = [
  { id: "hero-id", name: "hero", enabled: true, order: 0, content: HOME_DEFAULTS.hero },
  {
    id: "promo-slider-id",
    name: "promoSlider",
    enabled: true,
    order: 1,
    content: HOME_DEFAULTS.promoSlider,
  },
  {
    id: "category-menu-id",
    name: "categoryMenu",
    enabled: true,
    order: 2,
    content: HOME_DEFAULTS.categoryMenu,
  },
  {
    id: "products-section-id",
    name: "productsSection",
    enabled: true,
    order: 3,
    content: null,
  },
  {
    id: "featured-products-id",
    name: "featuredProducts",
    enabled: true,
    order: 4,
    content: HOME_DEFAULTS.featuredProducts,
  },
];

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: SITE.id },
    create: SITE,
    update: {
      storeName: SITE.storeName,
      email: SITE.email,
      phone: SITE.phone,
      whatsapp: SITE.whatsapp,
      address: SITE.address,
      pickupAddresses: SITE.pickupAddresses,
      deliveryEnabled: SITE.deliveryEnabled,
      upcomingEvents: SITE.upcomingEvents,
    },
  });

  await prisma.homeSection.deleteMany({
    where: { name: "upcomingEvents" },
  });

  for (const s of SECTIONS) {
    await prisma.homeSection.upsert({
      where: { name: s.name },
      create: {
        id: s.id,
        name: s.name,
        enabled: s.enabled,
        order: s.order,
        content: homeSectionContentToDb(s.content),
      },
      update: {
        enabled: s.enabled,
        order: s.order,
        ...(s.content !== undefined && {
          content: homeSectionContentToDb(s.content),
        }),
      },
    });
  }

  console.log("Seed SiteSettings + HomeSection concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
