-- Add optional fields used in "Informações adicionais"
ALTER TABLE `Product`
ADD COLUMN `material` TEXT NULL,
ADD COLUMN `colors` JSON NULL,
ADD COLUMN `sizes` JSON NULL;
