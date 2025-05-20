/*
  Warnings:

  - You are about to drop the column `roomId` on the `Sale` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "roomId";

-- CreateIndex
CREATE INDEX "Sale_employeeId_idx" ON "Sale"("employeeId");

-- CreateIndex
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");

-- CreateIndex
CREATE INDEX "Saledetail_saleId_idx" ON "Saledetail"("saleId");

-- CreateIndex
CREATE INDEX "Saledetail_productId_idx" ON "Saledetail"("productId");
