/*
  Warnings:

  - You are about to drop the column `requiresApproval` on the `Contest` table. All the data in the column will be lost.
  - The `status` column on the `ContestApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `updatedAt` on the `JuryScore` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `JuryAssignment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ContestApplication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ContestRole" AS ENUM ('ORGANIZER', 'CO_ORGANIZER', 'JURY', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalMode" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('EARLY_ADOPTER', 'ORGANIZER', 'JURY_MEMBER', 'FIRST_WIN', 'FIRST_SUBMISSION', 'SOCIAL_SHARER', 'TOP_3', 'VETERAN', 'CONTEST_CREATOR');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContestStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "ContestStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ContestStatus" ADD VALUE 'FINALIZED';
ALTER TYPE "ContestStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "JuryAssignment" DROP CONSTRAINT "JuryAssignment_contestId_fkey";

-- DropForeignKey
ALTER TABLE "JuryAssignment" DROP CONSTRAINT "JuryAssignment_juryId_fkey";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "requiresApproval",
ADD COLUMN     "adminApprovalNote" TEXT,
ADD COLUMN     "approvalMode" "ApprovalMode" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "category" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "judgingStart" TIMESTAMP(3),
ADD COLUMN     "submissionStart" TIMESTAMP(3),
ALTER COLUMN "applicationStart" DROP NOT NULL,
ALTER COLUMN "applicationEnd" DROP NOT NULL,
ALTER COLUMN "topicRevealAt" DROP NOT NULL,
ALTER COLUMN "submissionEnd" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ContestApplication" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "JuryScore" DROP COLUMN "updatedAt",
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "JuryAssignment";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "ContestMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "role" "ContestRole" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "ContestMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestApproval" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialShare" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT,
    "contestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestMember_contestId_role_idx" ON "ContestMember"("contestId", "role");

-- CreateIndex
CREATE INDEX "ContestMember_userId_idx" ON "ContestMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestMember_userId_contestId_role_key" ON "ContestMember"("userId", "contestId", "role");

-- CreateIndex
CREATE INDEX "ContestApproval_contestId_idx" ON "ContestApproval"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_type_key" ON "Badge"("type");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "SocialShare_userId_idx" ON "SocialShare"("userId");

-- CreateIndex
CREATE INDEX "Contest_createdById_idx" ON "Contest"("createdById");

-- CreateIndex
CREATE INDEX "ContestApplication_contestId_status_idx" ON "ContestApplication"("contestId", "status");

-- CreateIndex
CREATE INDEX "User_globalRole_idx" ON "User"("globalRole");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMember" ADD CONSTRAINT "ContestMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestMember" ADD CONSTRAINT "ContestMember_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestApproval" ADD CONSTRAINT "ContestApproval_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestApproval" ADD CONSTRAINT "ContestApproval_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialShare" ADD CONSTRAINT "SocialShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
