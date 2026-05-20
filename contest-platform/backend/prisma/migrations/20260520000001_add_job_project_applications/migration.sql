-- CreateTable
CREATE TABLE "JobQuestion" (
    "id" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "portfolioLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectApplication" (
    "id" TEXT NOT NULL,
    "projectListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "portfolioLink" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobQuestion_jobListingId_idx" ON "JobQuestion"("jobListingId");

-- CreateIndex
CREATE INDEX "JobApplication_jobListingId_idx" ON "JobApplication"("jobListingId");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "JobApplication"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobListingId_userId_key" ON "JobApplication"("jobListingId", "userId");

-- CreateIndex
CREATE INDEX "JobApplicationAnswer_applicationId_idx" ON "JobApplicationAnswer"("applicationId");

-- CreateIndex
CREATE INDEX "JobApplicationAnswer_questionId_idx" ON "JobApplicationAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationAnswer_applicationId_questionId_key" ON "JobApplicationAnswer"("applicationId", "questionId");

-- CreateIndex
CREATE INDEX "ProjectApplication_projectListingId_idx" ON "ProjectApplication"("projectListingId");

-- CreateIndex
CREATE INDEX "ProjectApplication_userId_idx" ON "ProjectApplication"("userId");

-- AddForeignKey
ALTER TABLE "JobQuestion" ADD CONSTRAINT "JobQuestion_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationAnswer" ADD CONSTRAINT "JobApplicationAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationAnswer" ADD CONSTRAINT "JobApplicationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "JobQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_projectListingId_fkey" FOREIGN KEY ("projectListingId") REFERENCES "ProjectListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
