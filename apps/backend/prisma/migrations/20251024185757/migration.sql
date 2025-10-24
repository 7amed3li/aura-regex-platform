/*
  Warnings:

  - Added the required column `userId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TestCase_userId_idx" ON "TestCase"("userId");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
