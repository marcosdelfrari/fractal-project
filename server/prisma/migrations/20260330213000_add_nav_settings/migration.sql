ALTER TABLE `SiteSettings`
ADD COLUMN `navBrandDesktopMode` VARCHAR(16) NOT NULL DEFAULT 'name',
ADD COLUMN `navBrandMobileMode` VARCHAR(16) NOT NULL DEFAULT 'name',
ADD COLUMN `hideStoreNameUntilLoaded` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `navLinks` JSON NULL;
