-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Convoy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "location" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "responseDeadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Convoy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConvoyParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "convoyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responseSource" TEXT,
    "respondedAt" DATETIME,
    "updatedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConvoyParticipant_convoyId_fkey" FOREIGN KEY ("convoyId") REFERENCES "Convoy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConvoyParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_discordUserId_key" ON "Member"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ConvoyParticipant_convoyId_memberId_key" ON "ConvoyParticipant"("convoyId", "memberId");
