
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const exps = await prisma.expense.findMany({
    where: { organizationId: '25b93887-5a4a-4cfc-b63f-4c7ca8abbb84' },
    select: { date: true, amount: true, category: true, description: true }
  });

  console.log('Total Expenses:', exps.length);
  const count2026 = exps.filter(e => e.date.getFullYear() === 2026).length;
  console.log('Expenses in 2026:', count2026);
  
  const april2026 = exps.filter(e => e.date.getFullYear() === 2026 && e.date.getMonth() === 3);
  console.log('Expenses in April 2026:', april2026.length);

  if (april2026.length > 0) {
      console.log('Sample April 2026:', april2026.slice(0, 3));
  }

  process.exit(0);
}

check();
