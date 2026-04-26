import { PrismaClient, UtilityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get a property to test with
    const property = await prisma.property.findFirst()
    if (!property) {
      console.log('No properties found')
      return
    }

    console.log(`Testing with property: ${property.id}`)

    const result = await prisma.utility.create({
      data: {
        propertyId: property.id,
        type: UtilityType.GARBAGE,
        amount: 1,
        isIncludedInRent: false,
        billingMonth: new Date('2026-04'),
        notes: 'test registration',
      }
    })

    console.log('Success:', result)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
