// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback para .env

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Aplicando migração para criar tabela user...');
    
    // SQL da migração baseado no schema.prisma
    const migrationSQL = `
      CREATE TABLE IF NOT EXISTS \`user\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`email\` VARCHAR(191) NOT NULL,
          \`password\` VARCHAR(191) NULL,
          \`role\` VARCHAR(191) NULL DEFAULT 'user',
          \`name\` VARCHAR(191) NULL,
          \`phone\` VARCHAR(191) NULL,
          \`cpf\` VARCHAR(191) NULL,
          \`photo\` VARCHAR(191) NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          UNIQUE INDEX \`User_email_key\`(\`email\`),
          PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    // Executar SQL diretamente
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Tabela user criada com sucesso!');
  } catch (error) {
    if (error.message.includes('already exists') || error.code === 'P2010') {
      console.log('ℹ️  Tabela user já existe.');
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


