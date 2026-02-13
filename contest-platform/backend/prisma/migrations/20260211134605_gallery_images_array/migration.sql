/*
  Warnings:

  - You are about to drop the column `gallery1` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gallery2` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gallery3` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gallery4` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gallery5` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "gallery1",
DROP COLUMN "gallery2",
DROP COLUMN "gallery3",
DROP COLUMN "gallery4",
DROP COLUMN "gallery5",
ADD COLUMN     "galleryImages" TEXT[];
