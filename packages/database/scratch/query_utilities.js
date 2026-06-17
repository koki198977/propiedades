const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const util1 = await prisma.utility.findFirst({
    where: { amount: 575385 },
    include: { property: true }
  });

  const util2 = await prisma.utility.findFirst({
    where: { amount: 327372 },
    include: { property: true }
  });

  console.log('--- UTILITY 1 (Gastos Personales) ---');
  if (util1) {
    console.log({
      id: util1.id,
      notes: util1.notes,
      propertyId: util1.propertyId,
      propertyName: util1.property?.name,
      propertyAddress: util1.property?.address,
      organizationId: util1.property?.organizationId
    });
  } else {
    console.log('Not found');
  }

  console.log('\n--- UTILITY 2 (Repuestos jeep) ---');
  if (util2) {
    console.log({
      id: util2.id,
      notes: util2.notes,
      propertyId: util2.propertyId,
      propertyName: util2.property?.name,
      propertyAddress: util2.property?.address,
      organizationId: util2.property?.organizationId
    });
  } else {
    console.log('Not found');
  }

  // List all organizations
  const orgs = await prisma.organization.findMany();
  console.log('\n--- ORGANIZATIONS ---');
  orgs.forEach(o => {
    console.log({ id: o.id, name: o.name });
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
