/**
 * Garante a coluna SiteSettings.upcomingEvents (JSON) quando o banco
 * está desatualizado ou migrations antigas falharam (ex.: P3009).
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*) AS c
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'SiteSettings'
      AND COLUMN_NAME = 'upcomingEvents'
  `;
  const count = Number(rows[0]?.c ?? 0);
  if (count > 0) {
    console.log("Coluna SiteSettings.upcomingEvents já existe.");
    return;
  }
  await prisma.$executeRawUnsafe(
    "ALTER TABLE `SiteSettings` ADD COLUMN `upcomingEvents` JSON NULL",
  );
  console.log("Coluna SiteSettings.upcomingEvents criada com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
