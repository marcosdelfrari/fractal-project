/**
 * Remove o registro da migração falha `20251018195841_` (antigo server/prisma),
 * que não existe mais no repositório e dispara P3009 no `prisma migrate deploy`.
 *
 * Causa típica do erro original: tabela já existia (`Table 'product' already exists`).
 *
 * Depois deste script, se `migrate deploy` falhar com coluna duplicada (1060), o schema
 * do banco já está alinhado — marque a migração como aplicada sem rodar o SQL:
 *   npx prisma migrate resolve --applied <nome_da_pasta_da_migracao>
 *
 * Uso (na raiz do projeto): node scripts/clear-failed-migration-20251018195841.js
 */
const path = require("path");
try {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
} catch (_) {}
const { PrismaClient } = require("@prisma/client");

const NAME = "20251018195841_";

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, rolled_back_at, logs
      FROM _prisma_migrations
      WHERE migration_name = ${NAME}
    `;
    if (!rows.length) {
      console.log(`Nenhum registro com migration_name = "${NAME}". Nada a fazer.`);
      return;
    }
    console.log("Registro encontrado:", rows[0]);
    await prisma.$executeRaw`
      DELETE FROM _prisma_migrations WHERE migration_name = ${NAME}
    `;
    console.log(`Removido: "${NAME}". Rode: npx prisma migrate deploy`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
