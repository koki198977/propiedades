import { PrismaClient, PropertyCategory, OrganizationRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Iniciando migración desde demo.sql...');
  
  const sqlPath = path.join(__dirname, '../../../assets/demo.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ No se encontró el archivo en ${sqlPath}`);
    return;
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // 1. Obtener contexto (Usuario y Organización)
  const user = await prisma.user.findFirst({ where: { email: 'jorgealvarezpinto77@gmail.com' } }) || await prisma.user.findFirst();
  const organization = await prisma.organization.findFirst({ where: { members: { some: { userId: user?.id } } } }) || await prisma.organization.findFirst();

  if (!organization || !user) {
    console.error('❌ No se encontró una organización o usuario en la DB local. Por favor crea uno primero.');
    return;
  }

  console.log(`📦 Usando Organización: ${organization.name} (${organization.id})`);
  console.log(`👤 Usando Usuario: ${user.fullName} (${user.id})`);

  // Helper para extraer datos de INSERT
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

    // Separar filas por ),( evitando fallos por espacios
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

  // --- MIGRAR FAMILIAS ---
  console.log('📂 Procesando familias...');
  const familiaRows = extractRows('familias');
  const familiaMap = new Map<number, string>();
  familiaRows.forEach(row => {
    familiaMap.set(row[0], row[1]);
  });

  // --- MIGRAR SOCIOS ---
  console.log('👥 Procesando socios...');
  const socioRows = extractRows('socios');
  const tenantMap = new Map<number, any>();
  
  for (const row of socioRows) {
    const oldId = row[0];
    const tenant = await prisma.tenant.upsert({
      where: { id: `legacy-tenant-${oldId}` },
      update: {},
      create: {
        id: `legacy-tenant-${oldId}`,
        name: row[2],
        email: row[4] === '0' || !row[4] ? null : row[4],
        phone: row[3] === '0' || !row[3] ? null : row[3],
        documentId: row[1],
        organizationId: organization.id,
        userId: user.id
      }
    });
    tenantMap.set(oldId, tenant);
  }

  // --- MIGRAR PRODUCTOS ---
  console.log('🏠 Procesando productos...');
  const productoRows = extractRows('productos');
  
  for (const row of productoRows) {
    const oldId = row[0];
    const nombre = row[1];
    const precio = row[2];
    const familiaId = row[3];
    const estado = row[4];
    const descrip = row[6];
    const direccion = row[7];
    const rol = row[8];
    const medLuz = row[9];
    const medAgua = row[10];
    const medGas = row[11];
    const medInternet = row[12];
    const diaVencimiento = row[14] || 5;
    const contratoInicio = row[15];
    const contratoFin = row[16];
    const nota = row[18];

    let category: PropertyCategory = PropertyCategory.OTHER;
    let customCategory: string | null = null;
    const familiaNombre = familiaMap.get(familiaId) || '';

    if (familiaNombre.includes('DEPARTAMENTO')) category = PropertyCategory.APARTMENT;
    else if (familiaNombre.includes('CONSULTA')) {
      category = PropertyCategory.OTHER;
      customCategory = 'Consulta Médica';
    } else if (familiaNombre.includes('LOCAL')) {
      category = PropertyCategory.OTHER;
      customCategory = 'Local Comercial';
    }

    // Limpieza de notas manteniendo HTML
    const decodeEntities = (html: string) => {
      if (!html) return '';
      return html
        .replace(/&[a-zA-Z]+;/g, (match) => {
          const entities: Record<string, string> = {
            '&nbsp;': ' ', '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
            '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
            '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&quot;': '"', '&apos;': "'", '&amp;': '&',
            '&lt;': '<', '&gt;': '>', '&deg;': '°'
          };
          return entities[match] || match;
        });
    };

    const cleanNota = decodeEntities(nota || '');
    
    // Construir nota sin redundancia pero manteniendo HTML
    let finalNotes = `<strong>${nombre}</strong>`;
    const taglessDesc = (descrip || '').replace(/<[^>]*>?/gm, '').trim();
    const taglessNombre = nombre.replace(/<[^>]*>?/gm, '').trim();

    if (taglessDesc && taglessDesc.toUpperCase() !== taglessNombre.toUpperCase()) {
      finalNotes += ` - ${descrip}`;
    }
    if (cleanNota) {
      finalNotes += `<br/>${cleanNota}`;
    }

    const property = await prisma.property.upsert({
      where: { id: `legacy-prop-${oldId}` },
      update: {
        userId: user.id,
        organizationId: organization.id,
        notes: finalNotes
      },
      create: {
        id: `legacy-prop-${oldId}`,
        organizationId: organization.id,
        userId: user.id,
        address: direccion || 'Sin dirección',
        rol: rol === '0' || !rol ? null : rol,
        category,
        customCategory,
        expectedRent: precio,
        paymentDueDay: Number(diaVencimiento),
        notes: finalNotes,
        isActive: true
      }
    });

    // Medidores
    const meters = [
      { label: 'Luz', number: medLuz },
      { label: 'Agua', number: medAgua },
      { label: 'Gas', number: medGas },
      { label: 'Internet', number: medInternet }
    ].filter(m => m.number && m.number !== '0' && m.number !== '000000000');

    for (const m of meters) {
      const meterId = `legacy-meter-${oldId}-${m.label}`;
      await prisma.propertyMeter.upsert({
        where: { id: meterId },
        update: {},
        create: {
          id: meterId,
          propertyId: property.id,
          label: m.label,
          number: String(m.number)
        }
      });
    }

    // Vincular Arrendatario
    if (estado === 2) {
      const assignedTenant = socioRows.find(s => 
        s[2].toUpperCase().includes(nombre.toUpperCase()) || 
        nombre.toUpperCase().includes(s[2].toUpperCase())
      );

      if (assignedTenant) {
        const tenant = tenantMap.get(assignedTenant[0]);
        if (tenant) {
          const ptId = `legacy-contract-${oldId}`;
          await prisma.propertyTenant.upsert({
            where: { id: ptId },
            update: {},
            create: {
              id: ptId,
              propertyId: property.id,
              tenantId: tenant.id,
              startDate: contratoInicio ? new Date(contratoInicio) : new Date(),
              endDate: contratoFin ? new Date(contratoFin) : null,
              monthlyRent: precio || 0,
              isActive: true
            }
          });
        }
      }
    }
  }

  // --- MIGRAR FOTOS (Omitido por solicitud del usuario) ---
  /*
  console.log('🖼️ Procesando fotos...');
  const imagenRows = extractRows('imagenes');
  for (const row of imagenRows) {
    const url = row[1];
    const oldProdId = row[2];
    const propId = `legacy-prop-${oldProdId}`;
    const exists = await prisma.property.findUnique({ where: { id: propId } });
    if (exists) {
      const photoId = `legacy-photo-${row[0]}`;
      await prisma.propertyPhoto.upsert({
        where: { id: photoId },
        update: {},
        create: {
          id: photoId,
          propertyId: propId,
          url: url,
          publicId: 'legacy-import',
          order: 0
        }
      });
    }
  }
  */

  console.log('✨ Migración completada con éxito.');
}

migrate()
  .catch(e => {
    console.error('❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
