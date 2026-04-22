/*
  Warnings:

  - You are about to drop the column `title` on the `Convoy` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Convoy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "responseDeadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Convoy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Convoy" ("createdAt", "createdById", "eventDate", "id", "location", "responseDeadline", "status", "updatedAt") SELECT "createdAt", "createdById", "eventDate", "id", "location", "responseDeadline", "status", "updatedAt" FROM "Convoy";
DROP TABLE "Convoy";
ALTER TABLE "new_Convoy" RENAME TO "Convoy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
