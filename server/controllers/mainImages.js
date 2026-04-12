const path = require("path");
const { ensurePublicDir } = require("../utills/resolvePublicDir");

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const allowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"];

async function uploadMainImage(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "Nenhum arquivo enviado" });
  }

  const uploadedFile = req.files.uploadedFile;
  const desiredFileName = req.body?.desiredFileName;
  const rawOriginalName = uploadedFile?.name || "";
  const originalExt = path.extname(rawOriginalName).toLowerCase();
  const mimeType = (uploadedFile?.mimetype || "").toLowerCase();

  // Some devices/cameras send inconsistent MIME types.
  // Accepting by MIME OR extension avoids rejecting valid JPG/JPEG uploads.
  const isValidMime = allowedImageTypes.includes(mimeType);
  const isValidExt = allowedImageExtensions.includes(originalExt);
  if (!isValidMime && !isValidExt) {
    return res.status(400).json({
      message:
        "Tipo de arquivo não permitido. Apenas PNG, JPG, JPEG e WEBP são aceitos.",
      receivedMimeType: mimeType || "unknown",
      receivedExtension: originalExt || "unknown",
    });
  }

  // Clean filename: remove accents, replace spaces with hyphens, keep alphanumeric and dots
  const cleanName = uploadedFile.name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-]/g, "");

  const extension = path.extname(cleanName || uploadedFile.name || "").toLowerCase();
  const fallbackBaseName = path.basename(cleanName || uploadedFile.name || "imagem", extension);
  const desiredBaseName = (desiredFileName || fallbackBaseName)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-]/g, "")
    .replace(/\.[^/.]+$/, "");

  const finalName = `${desiredBaseName || "imagem"}${extension || ".jpg"}`;

  const publicDir = ensurePublicDir();
  const targetPath = path.join(publicDir, finalName);

  uploadedFile.mv(targetPath, (err) => {
    if (err) {
      console.error("[main-image] Falha ao gravar arquivo:", err);
      return res.status(500).json({
        message: "Erro ao salvar o arquivo no servidor",
        details:
          process.env.NODE_ENV === "development" ? String(err.message || err) : undefined,
      });
    }

    res.status(200).json({ message: "Arquivo enviado com sucesso", fileName: finalName });
  });
}

module.exports = {
  uploadMainImage,
};
