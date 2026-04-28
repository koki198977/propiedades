import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.propertyTenant.findMany({
    where: { propertyId: '7d5cd1db-be00-4918-8d17-d77e16293742' }
  });
  console.log(tenants);
}

main().catch(console.error).finally(() => prisma.$disconnect());
