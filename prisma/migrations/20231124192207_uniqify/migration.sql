/*
  Warnings:

  - You are about to drop the column `voiced` on the `Episode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[text]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[text]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Episode` DROP COLUMN `voiced`;

-- CreateTable
CREATE TABLE `Voice` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Voice_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EpisodeVoice` (
    `id` VARCHAR(191) NOT NULL,
    `episodeId` VARCHAR(191) NOT NULL,
    `voiceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Updates` (
    `id` VARCHAR(191) NOT NULL,
    `changelog` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Flag_text_key` ON `Flag`(`text`);

-- CreateIndex
CREATE UNIQUE INDEX `Tag_text_key` ON `Tag`(`text`);

-- AddForeignKey
ALTER TABLE `EpisodeVoice` ADD CONSTRAINT `EpisodeVoice_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `Episode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EpisodeVoice` ADD CONSTRAINT `EpisodeVoice_voiceId_fkey` FOREIGN KEY (`voiceId`) REFERENCES `Voice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
