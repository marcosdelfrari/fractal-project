-- HomeSection.content: armazenar JSON grande (ex.: vários slides com imagens em base64).
-- Evita P2000 quando o tipo anterior (TEXT/JSON) tinha limite baixo.
ALTER TABLE `HomeSection` MODIFY `content` LONGTEXT NULL;
