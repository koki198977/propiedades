/*
  Warnings:

  - You are about to drop the column `electricityMeterNumber` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `gasMeterNumber` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `waterMeterNumber` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "electricityMeterNumber",
DROP COLUMN "gasMeterNumber",
DROP COLUMN "waterMeterNumber";

-- CreateTable
CREATE TABLE "property_meters" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_meters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_meters_propertyId_idx" ON "property_meters"("propertyId");

-- AddForeignKey
ALTER TABLE "property_meters" ADD CONSTRAINT "property_meters_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
