import { prisma } from './prisma'

export async function sendTelegramNotification(message: string) {
  try {
    const config = await prisma.telegramConfig.findFirst()
    if (!config || !config.isEnabled || !config.botToken || !config.chatId) {
      return
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error('[Telegram] Send failed:', data.description)
    }
  } catch (error) {
    console.error('[Telegram] Notification error:', error)
  }
}

export async function notifyTopup(userName: string, amount: number, method: string, balance: number) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyTopup) return
  await sendTelegramNotification(
    `💰 <b>มีคนเติมเงิน!</b>\n\n` +
    `👤 ผู้ใช้: <code>${escapeHtml(userName)}</code>\n` +
    `💵 ยอด: <b>${amount.toLocaleString('th-TH')} ฿</b>\n` +
    `💳 ช่องทาง: ${method}\n` +
    `💲 ยอดเงินคงเหลือ: ${balance.toLocaleString('th-TH')} ฿\n\n` +
    `⏰ ${new Date().toLocaleString('th-TH')}`
  )
}

export async function notifyRegister(userName: string, email: string) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyRegister) return
  await sendTelegramNotification(
    `🆕 <b>มีคนสมัครสมาชิกใหม่!</b>\n\n` +
    `👤 ชื่อ: <code>${escapeHtml(userName)}</code>\n` +
    `📧 อีเมล: <code>${escapeHtml(email)}</code>\n\n` +
    `⏰ ${new Date().toLocaleString('th-TH')}`
  )
}

export async function notifyBuyVpn(userName: string, serverName: string, price: number, packageType: string) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyBuyVpn) return
  await sendTelegramNotification(
    `🛒 <b>มีคนซื้อ VPN!</b>\n\n` +
    `👤 ผู้ใช้: <code>${escapeHtml(userName)}</code>\n` +
    `🖥️ เซิร์ฟเวอร์: <b>${escapeHtml(serverName)}</b>\n` +
    `📦 แพ็กเกจ: ${packageType}\n` +
    `💵 ราคา: <b>${price.toLocaleString('th-TH')} ฿</b>\n\n` +
    `⏰ ${new Date().toLocaleString('th-TH')}`
  )
}

export async function notifyError(context: string, error: string) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyError) return
  await sendTelegramNotification(
    `⚠️ <b>ระบบมีปัญหา!</b>\n\n` +
    `📍 ที่มา: <code>${escapeHtml(context)}</code>\n` +
    `❌ ข้อผิดพลาด:\n<pre>${escapeHtml(error.slice(0, 3000))}</pre>\n\n` +
    `⏰ ${new Date().toLocaleString('th-TH')}`
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
