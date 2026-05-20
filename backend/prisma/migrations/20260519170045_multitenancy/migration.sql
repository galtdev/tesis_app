/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `caja` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `cocina` table. All the data in the column will be lost.
  - You are about to drop the column `cocinaId` on the `detalle_pedido` table. All the data in the column will be lost.
  - You are about to drop the column `pedidoId` on the `detalle_pedido` table. All the data in the column will be lost.
  - You are about to drop the column `platilloId` on the `detalle_pedido` table. All the data in the column will be lost.
  - You are about to drop the column `pedidoId` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `cajaId` on the `pedido` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `pedido` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuario_id]` on the table `auth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cliente_id]` on the table `auth` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rol` on table `auth` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `restaurant_id` to the `caja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `caja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `cocina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `cocina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cocina_id` to the `detalle_pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pedido_id` to the `detalle_pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platillo_id` to the `detalle_pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pedido_id` to the `pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caja_id` to the `pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cliente_id` to the `pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `platillo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auth` DROP FOREIGN KEY `auth_id_fkey`;

-- DropForeignKey
ALTER TABLE `caja` DROP FOREIGN KEY `caja_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `cocina` DROP FOREIGN KEY `cocina_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `detalle_pedido` DROP FOREIGN KEY `detalle_pedido_cocinaId_fkey`;

-- DropForeignKey
ALTER TABLE `detalle_pedido` DROP FOREIGN KEY `detalle_pedido_pedidoId_fkey`;

-- DropForeignKey
ALTER TABLE `detalle_pedido` DROP FOREIGN KEY `detalle_pedido_platilloId_fkey`;

-- DropForeignKey
ALTER TABLE `pago` DROP FOREIGN KEY `pago_pedidoId_fkey`;

-- DropForeignKey
ALTER TABLE `pedido` DROP FOREIGN KEY `pedido_cajaId_fkey`;

-- DropForeignKey
ALTER TABLE `pedido` DROP FOREIGN KEY `pedido_clienteId_fkey`;

-- AlterTable
ALTER TABLE `auth` ADD COLUMN `cliente_id` INTEGER NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `usuario_id` INTEGER NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `rol` ENUM('SUPER_ADMIN', 'DUENO_RESTAURANT', 'STAFF_CAJA', 'STAFF_COCINA', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE';

-- AlterTable
ALTER TABLE `caja` DROP COLUMN `usuarioId`,
    ADD COLUMN `restaurant_id` INTEGER NOT NULL,
    ADD COLUMN `usuario_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `cocina` DROP COLUMN `usuarioId`,
    ADD COLUMN `restaurant_id` INTEGER NOT NULL,
    ADD COLUMN `usuario_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `detalle_pedido` DROP COLUMN `cocinaId`,
    DROP COLUMN `pedidoId`,
    DROP COLUMN `platilloId`,
    ADD COLUMN `cocina_id` INTEGER NOT NULL,
    ADD COLUMN `pedido_id` INTEGER NOT NULL,
    ADD COLUMN `platillo_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pago` DROP COLUMN `pedidoId`,
    ADD COLUMN `pedido_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pedido` DROP COLUMN `cajaId`,
    DROP COLUMN `clienteId`,
    ADD COLUMN `caja_id` INTEGER NOT NULL,
    ADD COLUMN `cliente_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `restaurant_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `platillo` ADD COLUMN `restaurant_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `restaurant_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `restaurant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `horario` VARCHAR(191) NULL,
    `ubicacion` VARCHAR(191) NOT NULL,
    `banner` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `restaurant_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `auth_usuario_id_key` ON `auth`(`usuario_id`);

-- CreateIndex
CREATE UNIQUE INDEX `auth_cliente_id_key` ON `auth`(`cliente_id`);

-- AddForeignKey
ALTER TABLE `auth` ADD CONSTRAINT `auth_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth` ADD CONSTRAINT `auth_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caja` ADD CONSTRAINT `caja_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caja` ADD CONSTRAINT `caja_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cocina` ADD CONSTRAINT `cocina_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cocina` ADD CONSTRAINT `cocina_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_caja_id_fkey` FOREIGN KEY (`caja_id`) REFERENCES `caja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_platillo_id_fkey` FOREIGN KEY (`platillo_id`) REFERENCES `platillo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_cocina_id_fkey` FOREIGN KEY (`cocina_id`) REFERENCES `cocina`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platillo` ADD CONSTRAINT `platillo_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
