/*
  Warnings:

  - You are about to drop the `Stockmovement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stockmovement" DROP CONSTRAINT "Stockmovement_productId_fkey";

-- DropTable
DROP TABLE "Stockmovement";
