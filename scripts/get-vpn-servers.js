const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const servers = await prisma.vpnServer.findMany()
    console.log('=== VPN Servers ===')
    servers.forEach(s => {
      console.log(`ID: ${s.id}`)
      console.log(`Name: ${s.name}`)
      console.log(`Host: ${s.host}:${s.port}`)
      console.log(`Path: ${s.path}`)
      console.log(`Username: ${s.username}`)
      console.log(`Password: ${s.password ? '****' : '(empty)'}`)
      console.log(`InboundId: ${s.inboundId}`)
      console.log('-------------------')
    })
    if (servers.length === 0) {
      console.log('ไม่พบ VPN Server ในฐานข้อมูล')
    }
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
