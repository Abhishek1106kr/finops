/*
  Warnings:

  - You are about to drop the column `baseCurrency` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `costCenter` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `employees` table. All the data in the column will be lost.
  - Added the required column `legal_name` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "baseCurrency",
DROP COLUMN "legalName",
ADD COLUMN     "base_currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "legal_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "costCenter",
ADD COLUMN     "cost_center" TEXT;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "fullName",
ADD COLUMN     "full_name" TEXT NOT NULL;
