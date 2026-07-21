-- Adds forgot-password token support to AdminUser
ALTER TABLE `AdminUser` ADD COLUMN `resetToken` VARCHAR(191) NULL;
ALTER TABLE `AdminUser` ADD COLUMN `resetTokenExpiresAt` DATETIME NULL;
