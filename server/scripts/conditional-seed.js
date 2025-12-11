// Script para executar seed condicionalmente baseado em variável de ambiente
// Uso no Railway: RUN_SEED=true node scripts/conditional-seed.js

const { execSync } = require("child_process");

const shouldRunSeed = process.env.RUN_SEED === "true";

if (shouldRunSeed) {
  console.log("🌱 RUN_SEED=true detectado. Executando seed...");
  try {
    execSync("npm run db:seed", { stdio: "inherit" });
    console.log("✅ Seed executado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error.message);
    process.exit(1);
  }
} else {
  console.log("⏭️  RUN_SEED não está definido como 'true'. Pulando seed.");
}
