-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PROCESSED', 'FLAGGED', 'SAFE');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('SAFE', 'RISK');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('VALIDATED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supervisor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fellow" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fellow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fellowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "fellowId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentCoverageScore" INTEGER NOT NULL,
    "contentCoverageJustification" TEXT NOT NULL,
    "facilitationScore" INTEGER NOT NULL,
    "facilitationJustification" TEXT NOT NULL,
    "protocolSafetyScore" INTEGER NOT NULL,
    "protocolSafetyJustification" TEXT NOT NULL,
    "riskFlag" "RiskStatus" NOT NULL,
    "riskQuote" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorReview" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "overrideStatus" "RiskStatus",
    "note" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_email_key" ON "Supervisor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fellow_email_key" ON "Fellow"("email");

-- CreateIndex
CREATE INDEX "Fellow_supervisorId_idx" ON "Fellow"("supervisorId");

-- CreateIndex
CREATE INDEX "Group_fellowId_idx" ON "Group"("fellowId");

-- CreateIndex
CREATE INDEX "Session_fellowId_idx" ON "Session"("fellowId");

-- CreateIndex
CREATE INDEX "Session_groupId_idx" ON "Session"("groupId");

-- CreateIndex
CREATE INDEX "Session_supervisorId_idx" ON "Session"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_sessionId_key" ON "Transcript"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_sessionId_key" ON "AIAnalysis"("sessionId");

-- CreateIndex
CREATE INDEX "SupervisorReview_sessionId_idx" ON "SupervisorReview"("sessionId");

-- CreateIndex
CREATE INDEX "SupervisorReview_supervisorId_idx" ON "SupervisorReview"("supervisorId");

-- AddForeignKey
ALTER TABLE "Fellow" ADD CONSTRAINT "Fellow_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_fellowId_fkey" FOREIGN KEY ("fellowId") REFERENCES "Fellow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_fellowId_fkey" FOREIGN KEY ("fellowId") REFERENCES "Fellow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorReview" ADD CONSTRAINT "SupervisorReview_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
