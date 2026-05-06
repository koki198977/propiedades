import * as fs from 'fs';
import * as path from 'path';

const sqlPath = path.join(__dirname, '../../../assets/demo.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

function extractRows(tableName: string): any[][] {
  const startRegex = new RegExp(`INSERT INTO \`${tableName}\` [^;]*?VALUES\\s*\\(`, 'gi');
  const startMatch = startRegex.exec(content);
  if (!startMatch) return [];

  const startIdx = startMatch.index + startMatch[0].length - 1; 
  let endIdx = -1;
  let inString = false;
  for (let i = startIdx; i < content.length; i++) {
      if (content[i] === "'" && content[i-1] !== "\\") inString = !inString;
      if (!inString && content[i] === ';') {
          endIdx = i;
          break;
      }
  }

  if (endIdx === -1) return [];
  const valuesStr = content.substring(startIdx, endIdx).trim();
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

const vRows = extractRows('ventas');
const vMap = new Map();
vRows.forEach(row => {
  vMap.set(row[0], row[3]); // id -> estado
});

const dRows = extractRows('ventas_detalles');
let totalSum = 0;
let sumValid = 0;
let sumInvalid = 0;

dRows.forEach(row => {
  const monto = Number(row[5]);
  const ventaId = Number(row[6]);
  const estadoVenta = vMap.get(ventaId);

  if (!isNaN(monto)) {
    totalSum += monto;
    if (estadoVenta === 1) {
      sumValid += monto;
    } else {
      sumInvalid += monto;
    }
  }
});

console.log('Total sum in SQL:', totalSum);
console.log('Sum Valid (estado=1):', sumValid);
console.log('Sum Invalid (estado!=1):', sumInvalid);
