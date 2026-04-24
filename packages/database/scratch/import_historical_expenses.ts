
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlFilePath = path.join(__dirname, '../../../assets/demo.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('--- Starting Expenses & Egresos Import ---');

  const RECORDED_BY_ID = '66cb2d07-f259-400e-a708-c7891089108d';
  const ORG_ID = '25b93887-5a4a-4cfc-b63f-4c7ca8abbb84';
  
  // 1. Parser Helpers
  const getInserts = (tableName: string) => {
    const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.*?);`, 'gs');
    const matches = [...sqlContent.matchAll(regex)];
    return matches.flatMap(m => parseValues(m[1].trim()));
  };

  const parseValues = (str: string) => {
    const rows: any[] = [];
    let current = '';
    let inString = false;
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" && str[i-1] !== '\\') inString = !inString;
        if (!inString) {
            if (char === '(') depth++;
            if (char === ')') depth--;
        }
        if (depth === 0 && char === ',' && !inString) {
            rows.push(cleanRow(current));
            current = '';
            continue;
        }
        current += char;
    }
    if (current) rows.push(cleanRow(current));
    return rows;
  };

  const cleanRow = (row: string) => {
      const trimmed = row.trim().replace(/^\(|\)$/g, '');
      const parts: string[] = [];
      let current = '';
      let inString = false;
      for (let i = 0; i < trimmed.length; i++) {
          const char = trimmed[i];
          if (char === "'" && trimmed[i-1] !== '\\') inString = !inString;
          if (char === ',' && !inString) {
              parts.push(current.trim());
              current = '';
              continue;
          }
          current += char;
      }
      parts.push(current.trim());
      return parts.map(p => {
          if (p === 'NULL') return null;
          if (p.startsWith("'") && p.endsWith("'")) return p.slice(1, -1).replace(/\\'/g, "'");
          return p;
      });
  };

  // 2. Load Tables
  console.log('Loading tables from SQL...');
  const costosRaw = getInserts('costos');
  const typesRaw = getInserts('tipos_costos');
  const egresosRaw = getInserts('egresos');

  const typesMap = new Map();
  typesRaw.forEach(t => typesMap.set(t[0], t[1]));

  const properties = await prisma.property.findMany({ select: { id: true, address: true } });

  // Matching function
  const findPropertyId = (description: string) => {
      const desc = description.toUpperCase();
      for (const p of properties) {
          const addr = p.address.toUpperCase();
          // Extract short version (MAESTRANZA 101, TOCOPILLA 119)
          const parts = addr.split(',');
          const mainPart = parts[0].trim();
          if (desc.includes(mainPart)) return p.id;
          
          // Match by number if found in specific legacy contexts
          if (desc.includes('404 PLAZA') && addr.includes('V MACKENNA 340')) return 'legacy-prop-21';
          if (desc.includes('MAESTRANZA') && p.id === 'legacy-prop-13') return p.id;
          if (desc.includes('TOCOPILLA') && p.id === 'legacy-prop-23') return p.id;
          if (desc.includes('ARIZTIA ORIENTE 390') && p.id.startsWith('legacy-prop-1')) return p.id;
          if (desc.includes('ARIZTIA PONIENTE 103') && p.id.startsWith('legacy-prop-')) return p.id;
          if (desc.includes('MONSEÑOR') && p.id === 'legacy-prop-19') return p.id;
          if (desc.includes('ALBERTO BLEST') && p.id === 'c7c9b386-9368-46c7-8af1-c1ed0b62aa39') return p.id;
      }
      return null;
  };

  let importedCount = 0;

  // 3. Import Costos
  console.log('Importing Costos...');
  for (const c of costosRaw) {
      // id: c[0], nombre: c[1], type_id: c[2], amount: c[3], date: c[4]
      const name = c[1] || '';
      const typeName = typesMap.get(c[2]) || 'Otros';
      const fullDesc = `${typeName} - ${name}`;
      const amount = c[3];
      const date = c[4];

      const propertyId = findPropertyId(fullDesc);

      try {
          await prisma.expense.create({
              data: {
                  organizationId: ORG_ID,
                  propertyId: propertyId,
                  amount: new Prisma.Decimal(amount),
                  date: new Date(date),
                  category: typeName.substring(0, 50),
                  description: name || typeName,
                  recordedById: RECORDED_BY_ID,
                  isHistorical: true
              }
          });
          importedCount++;
          if (importedCount % 100 === 0) console.log(`Imported ${importedCount} records...`);
      } catch (err) {
          // console.error(err.message);
      }
  }

  // 4. Import Egresos
  console.log('Importing Egresos...');
  for (const e of egresosRaw) {
      // id: e[0], amount: e[1], date: e[2], hora: e[3], motivo: e[5]
      const amount = e[1];
      const date = e[2];
      const motivo = e[5] || 'Egreso General';

      try {
          await prisma.expense.create({
              data: {
                  organizationId: ORG_ID,
                  amount: new Prisma.Decimal(amount),
                  date: new Date(date),
                  category: 'Retiro/Egreso',
                  description: motivo,
                  recordedById: RECORDED_BY_ID,
                  isHistorical: true
              }
          });
          importedCount++;
          if (importedCount % 100 === 0) console.log(`Imported ${importedCount} records...`);
      } catch (err) {
          // console.error(err.message);
      }
  }

  console.log(`--- Import Finished ---`);
  console.log(`Total records imported: ${importedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
