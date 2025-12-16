const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearData() {
  try {
    // Primeiro deletar produtos (devido à foreign key com categorias)
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`✅ ${deletedProducts.count} produtos deletados com sucesso!`);

    // Depois deletar categorias
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`✅ ${deletedCategories.count} categorias deletadas com sucesso!`);

    console.log("✅ Todos os dados foram removidos!");
  } catch (error) {
    console.error("❌ Erro ao deletar dados:", error);
    throw error;
  }
}

clearData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

