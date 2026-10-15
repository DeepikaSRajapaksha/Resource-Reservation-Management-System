/*
  Warnings:

  - You are about to drop the column `location` on the `Resource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "location",
ADD COLUMN     "image" TEXT;
