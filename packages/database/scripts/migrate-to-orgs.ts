import { PrismaClient, OrganizationRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration to organizations...');

  const users = await prisma.user.findMany({
    include: {
      properties: true,
      tenants: true,
    },
  });

  for (const user of users) {
    console.log(`\n👤 Processing user: ${user.fullName} (${user.email})`);

    // 1. Create personal organization
    const slug = user.email.split('@')[0].toLowerCase() + '-org';
    const orgName = `${user.fullName}'s Workspace`;

    const organization = await prisma.organization.upsert({
      where: { slug },
      update: {},
      create: {
        name: orgName,
        slug,
      },
    });

    console.log(`   ✅ Organization created: ${organization.name}`);

    // 2. Add user as ADMIN member
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: { role: OrganizationRole.ADMIN },
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: OrganizationRole.ADMIN,
      },
    });

    console.log(`   ✅ User added as ADMIN`);

    // 3. Link properties
    if (user.properties.length > 0) {
      const propertyIds = user.properties.map(p => p.id);
      await prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: { organizationId: organization.id },
      });
      console.log(`   ✅ Migrated ${user.properties.length} properties`);
    }

    // 4. Link tenants
    if (user.tenants.length > 0) {
      const tenantIds = user.tenants.map(t => t.id);
      await prisma.tenant.updateMany({
        where: { id: { in: tenantIds } },
        data: { organizationId: organization.id },
      });
      console.log(`   ✅ Migrated ${user.tenants.length} tenants`);
    }
  }

  console.log('\n✨ Migration finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
