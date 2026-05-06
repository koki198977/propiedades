import { PrismaClient, PaymentMethod } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Iniciando importación de pagos (ventas_detalles)...');

  const sqlPath = path.join(__dirname, '../../../assets/demo.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ No se encontró el archivo en ${sqlPath}`);
    return;
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // Contexto
  const user = await prisma.user.findFirst({ where: { email: 'yagnamsastrepropiedades@gmail.com' } });
  const organization = await prisma.organization.findFirst({ where: { slug: 'yagnampropiedades' } });

  if (!user || !organization) {
    console.error('❌ Usuario o organización no encontrados.');
    return;
  }

  function extractRows(tableName: string): any[][] {
    const startRegex = new RegExp(`INSERT INTO \`${tableName}\` [^;]*?VALUES\\s*\\(`, 'gi');
    const startMatch = startRegex.exec(sqlContent);
    if (!startMatch) return [];

    const startIdx = startMatch.index + startMatch[0].length - 1; 
    let endIdx = -1;
    let inString = false;
    for (let i = startIdx; i < sqlContent.length; i++) {
        if (sqlContent[i] === "'" && sqlContent[i-1] !== "\\") inString = !inString;
        if (!inString && sqlContent[i] === ';') {
            endIdx = i;
            break;
        }
    }

    if (endIdx === -1) return [];
    const valuesStr = sqlContent.substring(startIdx, endIdx).trim();
    const allRows: any[][] = [];
    const rowsRaw = valuesStr.split(/\),(?=\s*\()/g);
    
    for (let rowRaw of rowsRaw) {
        rowRaw = rowRaw.trim();
        if (rowRaw.startsWith('(')) rowRaw = rowRaw.substring(1);
        if (rowRaw.endsWith(')')) rowRaw = rowRaw.substring(0, rowRaw.length - 1);

        const row = rowRaw.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(v => {
          v = v.trim();
          if (v.toUpperCase() === 'NULL') return null;
          if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'");
          const num = Number(v);
          return isNaN(num) ? v : num;
        });
        allRows.push(row);
    }
    return allRows;
  }

  console.log('👥 Asegurando Arrendatario Histórico...');
  const legacyTenant = await prisma.tenant.upsert({
    where: { id: 'global-legacy-tenant' },
    update: {},
    create: {
      id: 'global-legacy-tenant',
      name: 'Inquilino Histórico',
      organizationId: organization.id,
      userId: user.id
    }
  });

  console.log('📦 Extrayendo datos de ventas (headers)...');
  const ventasRows = extractRows('ventas');
  const vMap = new Map();
  ventasRows.forEach(row => {
    vMap.set(row[0], row[3]); // id -> estado
  });

  console.log('📦 Extrayendo datos de ventas_detalles...');
  const rows = extractRows('ventas_detalles');
  let importedCount = 0;
  let skippedCount = 0;
  let annulledCount = 0;

  // Limpiar pagos previos para evitar duplicados/acumulados
  console.log('🧹 Limpiando pagos legacy previos...');
  await prisma.payment.deleteMany({
    where: { id: { startsWith: 'legacy-payment-' } }
  });

  for (const row of rows) {
    // id: row[0], cantidad: row[1], estado: row[2], fecha: row[3], hora: row[4], monto: row[5], venta_id: row[6], producto_id: row[7], descrip: row[8]
    const id = row[0];
    const fecha = row[3];
    const monto = row[5];
    const ventaId = row[6];
    const productoId = row[7];
    const descrip = row[8];

    if (!monto || monto === 0) {
      skippedCount++;
      continue;
    }

    // FILTRO DE ESTADO: Solo importar si la venta tiene estado 1 (válida)
    const estadoVenta = vMap.get(ventaId);
    if (estadoVenta !== 1) {
      annulledCount++;
      continue;
    }

    const propId = `legacy-prop-${productoId}`;
    const property = await prisma.property.findUnique({ where: { id: propId } });

    if (!property) {
      skippedCount++;
      continue;
    }

    // Buscar o crear contrato
    let contract = await prisma.propertyTenant.findFirst({
      where: { propertyId: propId, isActive: true }
    });

    if (!contract) {
      // Crear un contrato histórico para poder colgar el pago
      const ptId = `legacy-contract-hist-${productoId}`;
      contract = await prisma.propertyTenant.upsert({
        where: { id: ptId },
        update: {},
        create: {
          id: ptId,
          propertyId: propId,
          tenantId: legacyTenant.id,
          startDate: new Date('2000-01-01'), 
          monthlyRent: monto,
          isActive: true
        }
      });
    }

    await prisma.payment.create({
      data: {
        id: `legacy-payment-${id}`,
        propertyTenantId: contract.id,
        recordedById: user.id,
        amount: monto,
        paymentDate: new Date(fecha),
        paymentMethod: PaymentMethod.TRANSFER,
        notes: descrip || 'Pago importado'
      }
    });

    importedCount++;
    if (importedCount % 50 === 0) console.log(`✅ ${importedCount} pagos procesados...`);
  }

  console.log(`✨ Importación finalizada.`);
  console.log(`📊 Total importados: ${importedCount}`);
  console.log(`🚫 Total anulados (estado != 1): ${annulledCount}`);
  console.log(`⚠️ Total saltados (monto 0 o sin propiedad): ${skippedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
