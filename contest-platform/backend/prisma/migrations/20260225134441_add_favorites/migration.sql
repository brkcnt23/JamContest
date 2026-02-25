-- CreateTable
CREATE TABLE "ContestFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestFavorite_userId_idx" ON "ContestFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestFavorite_userId_contestId_key" ON "ContestFavorite"("userId", "contestId");

-- AddForeignKey
ALTER TABLE "ContestFavorite" ADD CONSTRAINT "ContestFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestFavorite" ADD CONSTRAINT "ContestFavorite_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
