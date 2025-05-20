/*
  Warnings:

  - You are about to drop the column `picture` on the `Sale` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "picture",
ADD COLUMN     "invoice" TEXT;

-- AlterTable
ALTER TABLE "Stockentry" ADD COLUMN     "invoice" TEXT;
