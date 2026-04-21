import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_ORG_ID = 'bda85e62-c532-4d09-a3e7-b99e19db5263'; // Mi Propiedad
const TARGET_ORG_ID = '25b93887-5a4a-4cfc-b63f-4c7ca8abbb84'; // yagnampropiedades

async function main() {
  console.log('--- Iniciando Migración ---');

  // 1. Mover Propiedades
  const propUpdate = await prisma.property.updateMany({
    where: { organizationId: SOURCE_ORG_ID },
    data: { organizationId: TARGET_ORG_ID },
  });
  console.log(`Propiedades movidas: ${propUpdate.count}`);

  // 2. Mover Arrendatarios
  const tenantUpdate = await prisma.tenant.updateMany({
    where: { organizationId: SOURCE_ORG_ID },
    data: { organizationId: TARGET_ORG_ID },
  });
  console.log(`Arrendatarios movidos: ${tenantUpdate.count}`);

  // 3. Sincronizar Miembros
  const sourceMembers = await prisma.organizationMember.findMany({
    where: { organizationId: SOURCE_ORG_ID },
  });

  for (const member of sourceMembers) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: TARGET_ORG_ID,
          userId: member.userId,
        },
      },
      update: { role: member.role },
      create: {
        organizationId: TARGET_ORG_ID,
        userId: member.userId,
        role: member.role,
      },
    });
    console.log(`Usuario ${member.userId} sincronizado en la nueva organización.`);
  }

  console.log('--- Migración Finalizada con Éxito ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
