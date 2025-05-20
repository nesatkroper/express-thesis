/*
  Warnings:

  - You are about to drop the column `invNumber` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `productAdd` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `stockId` on the `Stockentry` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Stockentry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `Stockentry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Stockentry" DROP CONSTRAINT "Stockentry_stockId_fkey";

-- DropIndex
DROP INDEX "Stock_supplierId_idx";

-- DropIndex
DROP INDEX "Stockentry_stockId_idx";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "invNumber",
DROP COLUMN "productAdd",
DROP COLUMN "supplierId",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Stockentry" DROP COLUMN "stockId",
ADD COLUMN     "productId" UUID NOT NULL,
ADD COLUMN     "supplierId" UUID NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Stockentry_productId_idx" ON "Stockentry"("productId");

-- CreateIndex
CREATE INDEX "Stockentry_supplierId_idx" ON "Stockentry"("supplierId");

-- AddForeignKey
ALTER TABLE "Stockentry" ADD CONSTRAINT "Stockentry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stockentry" ADD CONSTRAINT "Stockentry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;
