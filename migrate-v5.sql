-- Adds a display name to AdminUser, needed for the new user-management UI
ALTER TABLE `AdminUser` ADD COLUMN `name` VARCHAR(191) NULL AFTER `id`;
