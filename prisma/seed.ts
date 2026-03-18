import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Clear existing data
  await prisma.vpnOrder.deleteMany()
  await prisma.vpnServer.deleteMany()
  await prisma.order.deleteMany()
  await prisma.topUp.deleteMany()
  await prisma.user.deleteMany()
  
  // Create admin with balance
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@shop.com',
      password: hashedPassword,
      isAdmin: true,
      balance: 1000
    },
  })
  console.log(`Created admin: ${admin.email} (balance: ${admin.balance})`)
  console.log('Seeding finished.')
  console.log(`Admin login: admin@shop.com / admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
