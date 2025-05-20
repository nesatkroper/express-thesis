/*
  Warnings:

  - You are about to drop the `Productstock` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('in', 'out');

-- DropForeignKey
ALTER TABLE "Productstock" DROP CONSTRAINT "Productstock_productId_fkey";

-- DropForeignKey
ALTER TABLE "Productstock" DROP CONSTRAINT "Productstock_supplierId_fkey";

-- DropTable
DROP TABLE "Productstock";

-- CreateTable
CREATE TABLE "Stock" (
    "stockId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "supplierId" UUID,
    "invNumber" TEXT,
    "productAdd" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("stockId")
);

-- CreateTable
CREATE TABLE "Stockentry" (
    "entryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stockId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "entryPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "entryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stockentry_pkey" PRIMARY KEY ("entryId")
);

-- CreateTable
CREATE TABLE "Stockmovement" (
    "movementId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "StockType" NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stockmovement_pkey" PRIMARY KEY ("movementId")
);

-- CreateIndex
CREATE INDEX "Stock_productId_idx" ON "Stock"("productId");

-- CreateIndex
CREATE INDEX "Stock_supplierId_idx" ON "Stock"("supplierId");

-- CreateIndex
CREATE INDEX "Stockentry_stockId_idx" ON "Stockentry"("stockId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stockentry" ADD CONSTRAINT "Stockentry_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("stockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stockmovement" ADD CONSTRAINT "Stockmovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
