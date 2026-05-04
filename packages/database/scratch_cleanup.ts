import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza de base de datos...');

  // 1. Delete Expenses
  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`- Eliminados ${deletedExpenses.count} Egresos (Gastos / Devoluciones).`);

  // 2. Delete Payments (Incomes)
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`- Eliminados ${deletedPayments.count} Pagos (Ingresos por arriendo / garantía).`);

  // 3. Delete Utilities
  const deletedUtilities = await prisma.utility.deleteMany({});
  console.log(`- Eliminados ${deletedUtilities.count} Registros de Servicios (Utilities).`);

  // 4. Delete Expense Reminders
  const deletedReminders = await prisma.expenseReminder.deleteMany({});
  console.log(`- Eliminados ${deletedReminders.count} Recordatorios de Gastos.`);

  // 5. Delete PropertyTenants (Contracts)
  // This resets the occupation state, so all properties will be available
  // and all security deposits will be cleared. 
  // It DOES NOT delete the Properties or the Tenants themselves.
  const deletedLeases = await prisma.propertyTenant.deleteMany({});
  console.log(`- Eliminados ${deletedLeases.count} Contratos de Arrendamiento (Esto desocupa las propiedades y limpia el historial de garantías).`);

  console.log('¡Limpieza completada! Las propiedades, arrendatarios, usuarios y workspaces se mantienen intactos.');
}

main()
  .catch(e => {
    console.error('Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
