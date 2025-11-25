/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_googleId_key";

-- AlterTable
ALTER TABLE "GenerationLog" ADD COLUMN     "generationType" TEXT,
ADD COLUMN     "pythonExampleCode" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
DROP COLUMN "googleId";
