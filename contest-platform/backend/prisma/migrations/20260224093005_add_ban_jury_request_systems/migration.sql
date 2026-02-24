-- AlterTable
ALTER TABLE "Contest" ADD COLUMN     "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "JuryScore" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedBy" TEXT;

-- CreateTable
CREATE TABLE "UserBan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "restrictions" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuryInvitation" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuryInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestEditRequest" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestEditRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestCancelRequest" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestCancelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBan_userId_idx" ON "UserBan"("userId");

-- CreateIndex
CREATE INDEX "UserBan_active_idx" ON "UserBan"("active");

-- CreateIndex
CREATE INDEX "JuryInvitation_userId_status_idx" ON "JuryInvitation"("userId", "status");

-- CreateIndex
CREATE INDEX "JuryInvitation_contestId_idx" ON "JuryInvitation"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "JuryInvitation_contestId_userId_key" ON "JuryInvitation"("contestId", "userId");

-- CreateIndex
CREATE INDEX "ContestEditRequest_contestId_status_idx" ON "ContestEditRequest"("contestId", "status");

-- CreateIndex
CREATE INDEX "ContestEditRequest_status_idx" ON "ContestEditRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ContestCancelRequest_contestId_key" ON "ContestCancelRequest"("contestId");

-- CreateIndex
CREATE INDEX "ContestCancelRequest_status_idx" ON "ContestCancelRequest"("status");

-- AddForeignKey
ALTER TABLE "UserBan" ADD CONSTRAINT "UserBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBan" ADD CONSTRAINT "UserBan_bannedBy_fkey" FOREIGN KEY ("bannedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryInvitation" ADD CONSTRAINT "JuryInvitation_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryInvitation" ADD CONSTRAINT "JuryInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryInvitation" ADD CONSTRAINT "JuryInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestEditRequest" ADD CONSTRAINT "ContestEditRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestEditRequest" ADD CONSTRAINT "ContestEditRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestCancelRequest" ADD CONSTRAINT "ContestCancelRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestCancelRequest" ADD CONSTRAINT "ContestCancelRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
