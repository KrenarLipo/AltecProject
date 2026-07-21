-- Migration v3: menu items can now be placed in the primary nav or the footer nav.

ALTER TABLE `MenuItem` ADD COLUMN `location` ENUM('PRIMARY', 'FOOTER') NOT NULL DEFAULT 'PRIMARY';
