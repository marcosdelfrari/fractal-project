const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getSingleProductImages(request, response) {
  const { id } = request.params;
  const images = await prisma.image.findMany({
    where: { productID: id },
  });
  if (!images) {
    return response.json({ error: "Imagens não encontradas" }, { status: 404 });
  }
  return response.json(images);
}

async function createImage(request, response) {
  try {
    const { productID, image } = request.body;
    const createImage = await prisma.image.create({
      data: {
        productID,
        image,
      },
    });
    return response.status(201).json(createImage);
  } catch (error) {
    console.error("Error creating image:", error);
    return response.status(500).json({ error: "Erro ao criar imagem" });
  }
}

async function updateImage(request, response) {
  try {
    const { id } = request.params; // Getting product id from params
    const { productID, image } = request.body;

    // Checking whether photo exists for the given product id
    const existingImage = await prisma.image.findFirst({
      where: {
        productID: id, // Finding photo with a product id
      },
    });

    // if photo doesn't exist, return coresponding status code
    if (!existingImage) {
      return response
        .status(404)
        .json({ error: "Imagem não encontrada para o produto informado" });
    }

    // Updating photo using coresponding imageID
    const updatedImage = await prisma.image.update({
      where: {
        imageID: existingImage.imageID, // Using imageID of the found existing image
      },
      data: {
        productID: productID,
        image: image,
      },
    });

    return response.json(updatedImage);
  } catch (error) {
    console.error("Error updating image:", error);
    return response.status(500).json({ error: "Erro ao atualizar imagem" });
  }
}

async function deleteImage(request, response) {
  try {
    const { id } = request.params;
    await prisma.image.delete({
      where: {
        imageID: String(id),
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    if (error?.code === "P2025") {
      return response.status(404).json({ error: "Imagem não encontrada" });
    }
    return response.status(500).json({ error: "Erro ao excluir imagem" });
  }
}

module.exports = {
  getSingleProductImages,
  createImage,
  updateImage,
  deleteImage,
};
