const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Carregar variáveis de ambiente do config.env
const configPath = path.join(__dirname, "../config.env");
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, "utf8");
  configContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const prisma = new PrismaClient();

async function checkTablesExist() {
  try {
    // Verifica se as tabelas principais do schema existem
    const tables = [
      "Product",
      "User",
      "Category",
      "Customer_order",
      "customer_order_product",
      "Wishlist",
      "Address",
      "Review",
      "VerificationToken",
    ];

    const existingTables = [];
    const missingTables = [];

    for (const table of tables) {
      try {
        // Tenta fazer uma query simples para verificar se a tabela existe
        await prisma.$queryRawUnsafe(`SELECT 1 FROM \`${table}\` LIMIT 1`);
        existingTables.push(table);
      } catch (error) {
        if (error.message.includes("doesn't exist") || error.code === "P2021") {
          missingTables.push(table);
        } else {
          // Outro tipo de erro, mas a tabela pode existir
          existingTables.push(table);
        }
      }
    }

    return { existingTables, missingTables };
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas:", error.message);
    throw error;
  }
}

async function checkMigrationsTable() {
  try {
    const migrations = await prisma.$queryRaw`
            SELECT * FROM _prisma_migrations
        `;
    return migrations;
  } catch (error) {
    if (error.message.includes("doesn't exist") || error.code === "P2021") {
      return null; // Tabela não existe
    }
    // Se for erro de autenticação, retornar null para tentar executar migrate deploy
    if (
      error.message.includes("Authentication failed") ||
      error.message.includes("credentials")
    ) {
      console.log("   ⚠️  Erro de autenticação detectado");
      console.log("   💡 Verifique suas credenciais no config.env");
      throw error;
    }
    throw error;
  }
}

async function fixMigrations() {
  try {
    console.log("🔍 Diagnosticando estado das migrações...\n");

    // 1. Verificar se a tabela _prisma_migrations existe
    console.log("1️⃣ Verificando tabela _prisma_migrations...");
    const migrations = await checkMigrationsTable();

    if (migrations === null) {
      console.log("   ⚠️  Tabela _prisma_migrations não existe");
      console.log("   💡 Executando migrações para criar a tabela...\n");

      try {
        execSync("npx prisma migrate deploy", {
          stdio: "inherit",
          cwd: path.join(__dirname, ".."),
        });
        console.log("\n✅ Migrações aplicadas com sucesso!");
        return;
      } catch (error) {
        console.error("\n❌ Erro ao executar migrações:", error.message);
        throw error;
      }
    }

    console.log(`   ✅ Tabela _prisma_migrations existe`);
    console.log(`   📊 Registros encontrados: ${migrations.length}\n`);

    if (migrations.length === 0) {
      console.log("2️⃣ Tabela _prisma_migrations está vazia");
      console.log("   🔍 Verificando se as tabelas do schema existem...\n");

      const { existingTables, missingTables } = await checkTablesExist();

      console.log(`   ✅ Tabelas existentes: ${existingTables.length}`);
      if (existingTables.length > 0) {
        console.log(`      ${existingTables.join(", ")}`);
      }

      if (missingTables.length > 0) {
        console.log(`\n   ⚠️  Tabelas faltando: ${missingTables.length}`);
        console.log(`      ${missingTables.join(", ")}`);
        console.log(
          "\n   💡 Executando migrações para criar as tabelas faltantes...\n",
        );

        try {
          execSync("npx prisma migrate deploy", {
            stdio: "inherit",
            cwd: path.join(__dirname, ".."),
          });
          console.log("\n✅ Migrações aplicadas com sucesso!");
          return;
        } catch (error) {
          console.error("\n❌ Erro ao executar migrações:", error.message);
          throw error;
        }
      }

      // Se todas as tabelas existem mas _prisma_migrations está vazia,
      // significa que o banco foi criado manualmente
      console.log(
        "\n   💡 Todas as tabelas existem, mas _prisma_migrations está vazia.",
      );
      console.log("   💡 Isso indica que o banco foi criado manualmente.");
      console.log("   💡 Marcando migração como aplicada...\n");

      // Encontrar a migração mais recente
      const migrationsDir = path.join(__dirname, "../prisma/migrations");
      const migrationDirs = fs
        .readdirSync(migrationsDir)
        .filter((dir) => dir !== "migration_lock.toml")
        .sort();

      if (migrationDirs.length === 0) {
        console.error("❌ Nenhuma migração encontrada no diretório!");
        return;
      }

      const latestMigration = migrationDirs[migrationDirs.length - 1];
      console.log(`   📁 Migração encontrada: ${latestMigration}`);

      try {
        // Marcar a migração como aplicada
        execSync(`npx prisma migrate resolve --applied ${latestMigration}`, {
          stdio: "inherit",
          cwd: path.join(__dirname, ".."),
        });
        console.log("\n✅ Migração marcada como aplicada!");
      } catch (error) {
        console.error("\n❌ Erro ao marcar migração:", error.message);
        console.log("\n💡 Alternativa: Execute manualmente:");
        console.log(
          `   npx prisma migrate resolve --applied ${latestMigration}`,
        );
        throw error;
      }
    } else {
      console.log("✅ Tabela _prisma_migrations contém registros:");
      migrations.forEach((migration) => {
        console.log(
          `   - ${migration.migration_name} (${
            migration.finished_at || "pendente"
          })`,
        );
      });
      console.log("\n✅ Nenhuma ação necessária!");
    }
  } catch (error) {
    console.error("\n❌ Erro ao corrigir migrações:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
if (require.main === module) {
  fixMigrations()
    .then(() => {
      console.log("\n✅ Processo concluído!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Processo falhou:", error);
      process.exit(1);
    });
}

module.exports = { fixMigrations };
