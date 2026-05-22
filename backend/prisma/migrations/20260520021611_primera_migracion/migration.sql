-- AlterTable
ALTER TABLE `restaurant` ADD COLUMN `platform_id` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `platform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL DEFAULT 'Global',
    `config` JSON NULL,
    `mantenimiento` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `restaurant` ADD CONSTRAINT `restaurant_platform_id_fkey` FOREIGN KEY (`platform_id`) REFERENCES `platform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
