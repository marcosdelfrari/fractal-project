const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setAdmin(email) {
  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Usuário com email ${email} não encontrado!`);
      return;
    }

    // Atualizar o role para admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log(`✅ Usuário ${updatedUser.email} agora é admin!`);
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Nome: ${updatedUser.name || "Não definido"}`);
    console.log(`   Role: ${updatedUser.role}`);
  } catch (error) {
    console.error("❌ Erro ao definir admin:", error);
    throw error;
  }
}

// Email do usuário a ser promovido a admin
const targetEmail = process.argv[2] || "afk.marcos@gmail.com";

setAdmin(targetEmail)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

