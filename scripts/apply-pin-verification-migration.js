// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback para .env

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Aplicando migração para criar tabela PinVerification...');
    
    // SQL da migração
    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS \`PinVerification\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`email\` VARCHAR(191) NOT NULL,
          \`pin\` VARCHAR(191) NOT NULL,
          \`expiresAt\` DATETIME(3) NOT NULL,
          \`attempts\` INTEGER NOT NULL DEFAULT 0,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          UNIQUE INDEX \`PinVerification_email_key\`(\`email\`),
          INDEX \`PinVerification_email_idx\`(\`email\`),
          PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    // Executar SQL diretamente
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Tabela PinVerification criada com sucesso!');
  } catch (error) {
    if (error.message.includes('already exists') || error.code === 'P2010') {
      console.log('ℹ️  Tabela PinVerification já existe.');
    } else {
      console.error('❌ Erro ao aplicar migração:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('✅ Migração concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });

