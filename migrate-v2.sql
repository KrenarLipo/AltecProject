-- Migration v2: image uploads + thumbnails, product brochures, hero slideshow, Italian language.
-- Safe to re-run: uses IF NOT EXISTS / column-existence-tolerant statements where MySQL allows it.

ALTER TABLE `ProductImage` ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `WorkItemImage` ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Product` ADD COLUMN `brochureUrl` VARCHAR(500) NULL;

CREATE TABLE `Slide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mediaType` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
    `mediaUrl` VARCHAR(500) NOT NULL,
    `linkUrl` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SlideTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slideId` INTEGER NOT NULL,
    `languageCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(500) NULL,

    UNIQUE INDEX `SlideTranslation_slideId_languageCode_key`(`slideId`, `languageCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SlideTranslation` ADD CONSTRAINT `SlideTranslation_slideId_fkey` FOREIGN KEY (`slideId`) REFERENCES `Slide`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SlideTranslation` ADD CONSTRAINT `SlideTranslation_languageCode_fkey` FOREIGN KEY (`languageCode`) REFERENCES `Language`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO `Language` (`code`, `label`) VALUES ('it', 'Italiano')
    ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);
