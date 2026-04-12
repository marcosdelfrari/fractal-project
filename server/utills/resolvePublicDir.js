const fs = require("fs");
const path = require("path");

/**
 * Diretório estático `public` para uploads (mesmo conceito do Next em monorepo).
 *
 * Em produção o serviço pode rodar com `cwd` = pasta `server/` (Railway). Nesse caso
 * `__dirname/../../public` a partir de `controllers/` resolve para `/public` no disco,
 * que é inválido e faz `mv()` falhar com 500.
 *
 * Ordem: env → `cwd/public` se existir → `../public` relativo ao cwd (monorepo) → cria `cwd/public`.
 */
function resolvePublicDir() {
  const envDir = process.env.PUBLIC_STATIC_DIR;
  if (envDir && String(envDir).trim()) {
    return path.resolve(String(envDir).trim());
  }

  const cwd = process.cwd();
  const cwdPublic = path.resolve(cwd, "public");
  const siblingPublic = path.resolve(cwd, "..", "public");

  if (fs.existsSync(cwdPublic)) {
    return cwdPublic;
  }
  if (fs.existsSync(siblingPublic)) {
    return siblingPublic;
  }

  return cwdPublic;
}

function ensurePublicDir() {
  const dir = resolvePublicDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = {
  resolvePublicDir,
  ensurePublicDir,
};
