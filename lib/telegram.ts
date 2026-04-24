import { prisma } from './prisma'
import https from 'https'

export async function sendTelegramNotification(message: string) {
  console.log('[Telegram] Attempting to send notification...')
  try {
    const config = await prisma.telegramConfig.findFirst()
    console.log('[Telegram] Config found:', !!config, 'Enabled:', config?.isEnabled, 'HasToken:', !!config?.botToken, 'HasChatId:', !!config?.chatId)

    if (!config || !config.isEnabled || !config.botToken || !config.chatId) {
      console.log('[Telegram] Skipped: config missing or disabled')
      return
    }

    const payload = JSON.stringify({
      chat_id: config.chatId,
      text: message,
      parse_mode: 'HTML',
    })

    const url = new URL(`https://api.telegram.org/bot${config.botToken}/sendMessage`)

    console.log('[Telegram] Sending to:', url.hostname)

    const result = await new Promise<{ ok: boolean; data: any }>((resolve) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 10000,
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              const json = JSON.parse(data)
              console.log('[Telegram] Response:', json.ok, json.description || '')
              resolve({ ok: json.ok === true, data: json })
            } catch {
              console.error('[Telegram] Invalid JSON response:', data)
              resolve({ ok: false, data: null })
            }
          })
        }
      )

      req.on('error', (err) => {
        console.error('[Telegram] Request error:', err.message)
        resolve({ ok: false, data: err.message })
      })

      req.on('timeout', () => {
        console.error('[Telegram] Request timeout')
        req.destroy()
        resolve({ ok: false, data: 'timeout' })
      })

      req.write(payload)
      req.end()
    })

    if (!result.ok) {
      console.error('[Telegram] Send failed:', result.data)
    }
  } catch (error) {
    console.error('[Telegram] Notification error:', error)
  }
}

export async function notifyTopup(userName: string, amount: number, method: string, balance: number) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyTopup) {
    console.log('[Telegram] Topup notify skipped: disabled')
    return
  }
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
  if (!config?.notifyRegister) {
    console.log('[Telegram] Register notify skipped: disabled')
    return
  }
  await sendTelegramNotification(
    `🆕 <b>มีคนสมัครสมาชิกใหม่!</b>\n\n` +
    `👤 ชื่อ: <code>${escapeHtml(userName)}</code>\n` +
    `📧 อีเมล: <code>${escapeHtml(email)}</code>\n\n` +
    `⏰ ${new Date().toLocaleString('th-TH')}`
  )
}

export async function notifyBuyVpn(userName: string, serverName: string, price: number, packageType: string) {
  const config = await prisma.telegramConfig.findFirst()
  if (!config?.notifyBuyVpn) {
    console.log('[Telegram] BuyVPN notify skipped: disabled')
    return
  }
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
  if (!config?.notifyError) {
    console.log('[Telegram] Error notify skipped: disabled')
    return
  }
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
