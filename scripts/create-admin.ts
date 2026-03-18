import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: { isAdmin: true },
    create: {
      name: 'Admin',
      email: 'admin@shop.com',
      password: hashedPassword,
      isAdmin: true,
    },
  })
  
  console.log('Admin user created:', user.email)
  console.log('Password: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
