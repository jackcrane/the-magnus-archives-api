/*
  Warnings:

  - The primary key for the `EpisodeFlags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EpisodeFlags` table. All the data in the column will be lost.
  - The primary key for the `EpisodeTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EpisodeTag` table. All the data in the column will be lost.
  - The primary key for the `EpisodeVoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EpisodeVoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `EpisodeFlags` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`episodeId`, `flagId`);

-- AlterTable
ALTER TABLE `EpisodeTag` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`episodeId`, `tagId`);

-- AlterTable
ALTER TABLE `EpisodeVoice` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`episodeId`, `voiceId`);
