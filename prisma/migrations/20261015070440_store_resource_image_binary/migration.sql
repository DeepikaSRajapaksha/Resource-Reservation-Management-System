/*
  Warnings:

  - The `image` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "imageType" TEXT,
DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;
