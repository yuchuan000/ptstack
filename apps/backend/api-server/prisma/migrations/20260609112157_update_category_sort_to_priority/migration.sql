/*
  Warnings:

  - You are about to drop the column `sort` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "sort",
ADD COLUMN     "priority" SMALLINT NOT NULL DEFAULT 0;
