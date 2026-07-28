-- Adds a SUBSCRIBER role for public self-registration (public login/register pages)
ALTER TABLE `AdminUser` MODIFY COLUMN `role` ENUM('OWNER', 'EDITOR', 'SUBSCRIBER') NOT NULL DEFAULT 'SUBSCRIBER';
