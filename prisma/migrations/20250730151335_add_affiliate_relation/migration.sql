/*
  Warnings:

  - You are about to drop the column `asset` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `closedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `entryPrice` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `exitPrice` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `leverage` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `profitLoss` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_config` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "asset",
DROP COLUMN "closedAt",
DROP COLUMN "direction",
DROP COLUMN "entryPrice",
DROP COLUMN "exitPrice",
DROP COLUMN "leverage",
DROP COLUMN "profitLoss",
DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "tokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "system_config";

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ConfigType" NOT NULL DEFAULT 'STRING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
