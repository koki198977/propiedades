import { PrismaClient, UtilityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const property = await prisma.property.findFirst()
    if (!property) return

    console.log('Testing WITHDRAWAL...')
    await prisma.utility.create({
      data: {
        propertyId: property.id,
        type: UtilityType.WITHDRAWAL,
        amount: 100,
        isIncludedInRent: false,
        notes: 'test withdrawal',
      }
    })
    console.log('WITHDRAWAL Success')

    console.log('Testing PERSONAL...')
    await prisma.utility.create({
      data: {
        propertyId: property.id,
        type: UtilityType.PERSONAL,
        amount: 50,
        isIncludedInRent: false,
        notes: 'test personal',
      }
    })
    console.log('PERSONAL Success')

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
