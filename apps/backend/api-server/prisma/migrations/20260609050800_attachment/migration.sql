/*
  Warnings:

  - The `status` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `sort` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- CreateEnum
CREATE TYPE "BaseStatus" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('image', 'document', 'video', 'audio', 'other');

-- DropIndex
DROP INDEX "categories_status_deleted_at_idx";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "status",
ADD COLUMN     "status" "BaseStatus" NOT NULL DEFAULT 'public',
ALTER COLUMN "sort" SET DATA TYPE SMALLINT;

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "size" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "status" "BaseStatus" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_deleted_at_idx" ON "attachments"("deleted_at");

-- CreateIndex
CREATE INDEX "attachments_deleted_at_status_idx" ON "attachments"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "categories"("deleted_at");

-- CreateIndex
CREATE INDEX "categories_deleted_at_status_idx" ON "categories"("deleted_at", "status");
