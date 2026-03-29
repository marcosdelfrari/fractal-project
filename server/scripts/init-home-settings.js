require("dotenv").config({ path: ".env" });
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");

const HOME_DEFAULTS = require(path.join(
  __dirname,
  "..",
  "..",
  "data",
  "home-section-defaults.json",
));

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const DEFAULT_SECTIONS = [
  {
    name: "hero",
    enabled: true,
    order: 0,
    content: HOME_DEFAULTS.hero,
  },
  {
    name: "categoryMenu",
    enabled: true,
    order: 1,
    content: HOME_DEFAULTS.categoryMenu,
  },
  {
    name: "productsSection",
    enabled: true,
    order: 2,
    content: null,
  },
  {
    name: "featuredProducts",
    enabled: true,
    order: 3,
    content: HOME_DEFAULTS.featuredProducts,
  },
];

async function initializeHomeSettings() {
  try {
    console.log("🚀 Inicializando configurações de home...");

    let siteSettings = await prisma.siteSettings.findFirst();
    if (!siteSettings) {
      siteSettings = await prisma.siteSettings.create({
        data: {
          id: nanoid(),
          storeName: "Fractal Store",
        },
      });
      console.log("✅ Configurações de site criadas");
    }

    for (const section of DEFAULT_SECTIONS) {
      const existing = await prisma.homeSection.findUnique({
        where: { name: section.name },
      });

      if (!existing) {
        await prisma.homeSection.create({
          data: {
            id: nanoid(),
            name: section.name,
            enabled: section.enabled,
            order: section.order,
            content: section.content ?? null,
          },
        });
        console.log(`✅ Seção "${section.name}" criada`);
      } else {
        console.log(`⏭️  Seção "${section.name}" já existe`);
      }
    }

    console.log("✨ Inicialização completa!");
  } catch (error) {
    console.error("❌ Erro na inicialização:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeHomeSettings();
