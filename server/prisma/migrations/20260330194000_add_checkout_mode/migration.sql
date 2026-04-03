-- Add checkout mode with 3 options
ALTER TABLE `SiteSettings`
ADD COLUMN `checkoutMode` VARCHAR(32) NOT NULL DEFAULT 'delivery_and_pickup';
