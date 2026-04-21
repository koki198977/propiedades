/*
  Warnings:

  - Added the required column `userId` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tenants_userId_idx" ON "tenants"("userId");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
