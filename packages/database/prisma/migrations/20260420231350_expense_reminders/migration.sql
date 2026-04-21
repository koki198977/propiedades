-- CreateEnum
CREATE TYPE "ExpenseFrequency" AS ENUM ('MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EXPENSE_DUE';

-- CreateTable
CREATE TABLE "expense_reminders" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "ExpenseFrequency" NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_reminders_propertyId_idx" ON "expense_reminders"("propertyId");

-- AddForeignKey
ALTER TABLE "expense_reminders" ADD CONSTRAINT "expense_reminders_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
