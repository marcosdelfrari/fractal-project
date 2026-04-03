-- Add optional additional information field to products
ALTER TABLE `Product`
ADD COLUMN `additionalInfo` TEXT NULL;
