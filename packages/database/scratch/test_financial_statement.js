const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getChileOffsetMinutes(date) {
  const tzString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  }).format(date);
  
  const match = tzString.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
  if (!match) return -240; 
  
  const [_, month, day, year, hour, minute, second] = match;
  const localUtc = Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );
  
  const diffMs = localUtc - date.getTime();
  return diffMs / 60000;
}

function parseChileDate(dateStr, isEnd = false) {
  // Create UTC date representation
  const utcDate = new Date(dateStr + (isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z'));
  
  // Shift by the Chile timezone offset to represent the correct local day start/end in UTC
  const offsetMin = getChileOffsetMinutes(utcDate);
  return new Date(utcDate.getTime() - offsetMin * 60000);
}

async function run() {
  const organizationId = 'f783eeca-1021-48c8-b280-ef94b0f5635d'; // yagnampropiedades
  
  // Simulate startDate=2000-01-01 & endDate=2026-06-16 (Chile dates)
  const startDate = parseChileDate('2000-01-01', false);
  const end = parseChileDate('2026-06-16', true);

  console.log(`\nQuery bounds (UTC representation of Chile dates):`);
  console.log(`- Start: ${startDate.toISOString()}`);
  console.log(`- End:   ${end.toISOString()}`);

  const utilities = await prisma.utility.findMany({
    where: {
      property: { organizationId },
      OR: [
        { billingMonth: { gte: startDate, lte: end } },
        { billingMonth: null, createdAt: { gte: startDate, lte: end } }
      ]
    },
    include: { property: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${utilities.length} utilities.`);
  const jeep = utilities.find(u => u.amount.toNumber() === 327372);
  if (jeep) {
    console.log('✅ FOUND "Repuestos jeep"!');
  } else {
    console.log('❌ "Repuestos jeep" NOT found.');
  }

  process.exit(0);
}

run();
