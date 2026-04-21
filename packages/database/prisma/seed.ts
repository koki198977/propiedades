import { PrismaClient, PropertyCategory, UtilityType, PaymentMethod } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Usuario admin ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin1234!', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@propiedades.local' },
    update: {},
    create: {
      email: 'admin@propiedades.local',
      passwordHash,
      fullName: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log('✅ Usuario creado:', user.email)

  // ── Propiedades ────────────────────────────────────────────
  const prop1 = await prisma.property.create({
    data: {
      userId: user.id,
      category: PropertyCategory.APARTMENT,
      address: 'Av. Providencia 1234, Dpto 501, Santiago',
      contractEndDate: new Date('2026-12-31'),
      paymentDueDay: 5,
      notes: 'Departamento con estacionamiento incluido',
      utilities: {
        create: [
          { type: UtilityType.ELECTRICITY, amount: 45000, isIncludedInRent: false },
          { type: UtilityType.WATER, amount: 12000, isIncludedInRent: false },
          { type: UtilityType.COMMON_EXPENSES, amount: 35000, isIncludedInRent: true },
          { type: UtilityType.INTERNET, amount: 25000, isIncludedInRent: false },
        ],
      },
    },
  })

  const prop2 = await prisma.property.create({
    data: {
      userId: user.id,
      category: PropertyCategory.HOUSE,
      address: 'Los Leones 567, Ñuñoa, Santiago',
      contractEndDate: new Date('2026-09-30'),
      paymentDueDay: 1,
      notes: 'Casa con jardín y 3 dormitorios',
      utilities: {
        create: [
          { type: UtilityType.ELECTRICITY, amount: 65000, isIncludedInRent: false },
          { type: UtilityType.WATER, amount: 18000, isIncludedInRent: false },
          { type: UtilityType.GAS, amount: 22000, isIncludedInRent: false },
          { type: UtilityType.TAX, amount: 48000, isIncludedInRent: true },
        ],
      },
    },
  })

  const prop3 = await prisma.property.create({
    data: {
      userId: user.id,
      category: PropertyCategory.OFFICE,
      address: 'Nueva Las Condes 321, OF 12, Las Condes',
      paymentDueDay: 10,
      notes: 'Local comercial, piso 1, alto flujo',
    },
  })

  console.log('✅ Propiedades creadas:', [prop1.address, prop2.address, prop3.address].join(' | '))

  // ── Arrendatarios ──────────────────────────────────────────
  const t1 = await prisma.tenant.create({
    data: { userId: user.id, name: 'María González', email: 'maria@example.com', phone: '+56912345678', documentId: '12.345.678-9' },
  })
  const t2 = await prisma.tenant.create({
    data: { userId: user.id, name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '+56987654321', documentId: '9.876.543-2' },
  })
  const t3 = await prisma.tenant.create({
    data: { userId: user.id, name: 'Empresa XYZ SpA', email: 'contacto@xyz.cl', phone: '+56222345678', documentId: '76.543.210-K' },
  })

  console.log('✅ Arrendatarios creados')

  // ── Ocupaciones activas ────────────────────────────────────
  const occ1 = await prisma.propertyTenant.create({
    data: {
      propertyId: prop1.id,
      tenantId: t1.id,
      startDate: new Date('2025-01-01'),
      monthlyRent: 650000,
      isActive: true,
    },
  })
  const occ2 = await prisma.propertyTenant.create({
    data: {
      propertyId: prop2.id,
      tenantId: t2.id,
      startDate: new Date('2025-03-01'),
      monthlyRent: 850000,
      isActive: true,
    },
  })
  const occ3 = await prisma.propertyTenant.create({
    data: {
      propertyId: prop3.id,
      tenantId: t3.id,
      startDate: new Date('2024-07-01'),
      monthlyRent: 1200000,
      isActive: true,
    },
  })

  console.log('✅ Ocupaciones activas creadas')

  // ── Pagos históricos (últimos 3 meses) ─────────────────────
  const months = [
    new Date('2026-01-05'),
    new Date('2026-02-05'),
    new Date('2026-03-05'),
  ]

  for (const date of months) {
    await prisma.payment.create({
      data: {
        propertyTenantId: occ1.id,
        recordedById: user.id,
        amount: 650000,
        paymentDate: date,
        paymentMethod: PaymentMethod.TRANSFER,
        notes: `Pago arriendo ${date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
      },
    })

    await prisma.payment.create({
      data: {
        propertyTenantId: occ2.id,
        recordedById: user.id,
        amount: 850000,
        paymentDate: new Date(date.getTime() + 86400000), // +1 día
        paymentMethod: PaymentMethod.DEPOSIT,
        notes: `Pago arriendo ${date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
      },
    })

    await prisma.payment.create({
      data: {
        propertyTenantId: occ3.id,
        recordedById: user.id,
        amount: 1200000,
        paymentDate: new Date(date.setDate(10)),
        paymentMethod: PaymentMethod.TRANSFER,
        notes: `Pago arriendo ${date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
      },
    })
  }

  console.log('✅ Pagos históricos creados')
  console.log('\n🎉 Seed completado exitosamente!')
  console.log('📧 Login: admin@propiedades.local')
  console.log('🔑 Password: Admin1234!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
