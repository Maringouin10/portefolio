/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Project` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ProjectVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "coverImage" TEXT NOT NULL,
    "modelFile" TEXT,
    "modelFileName" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("category", "coverImage", "createdAt", "description", "id", "modelFile", "modelFileName", "published", "slug", "title", "updatedAt") SELECT "category", "coverImage", "createdAt", "description", "id", "modelFile", "modelFileName", "published", "slug", "title", "updatedAt" FROM "Project";

-- MigrateData: carry any existing single video URL over into the new multi-video table
INSERT INTO "ProjectVideo" ("id", "url", "order", "projectId")
SELECT lower(hex(randomblob(16))), "videoUrl", 0, "id"
FROM "Project"
WHERE "videoUrl" IS NOT NULL AND "videoUrl" != '';

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
