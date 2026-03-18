import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import ChatWidget from '@/components/ChatWidget'
import ServerCard from '@/components/ServerCard'
import FadeIn from '@/components/FadeIn'
import Link from 'next/link'
import { 
  Wifi, Shield, Globe, Server, Smartphone, Lock, Zap, 
  CheckCircle2, Gamepad2, Youtube, Download,
  Star, Users, CreditCard, Rocket, Gift, Activity, MapPin, ShieldCheck, Clock
} from 'lucide-react'

export default async function HomePage() {
  const session = await getSession()
  const servers = await getVpnServers()
  
  const user = session.isLoggedIn ? {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0
  } : null
  
  const isAdmin = user ? await prisma.user.findFirst({
    where: { id: session.userId, isAdmin: true }
  }).then(u => !!u) : false

  // ถ้าล็อกอินแล้ว แสดงหน้าเลือกเซิร์ฟเวอร์อย่างเดียว
  if (user) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <main className="pt-2 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Quick Stats Banner */}
            <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">สถานะระบบ</div>
                    <div className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ออนไลน์
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{servers.length}</div>
                    <div className="text-[10px] text-zinc-500">เซิร์ฟเวอร์</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">24/7</div>
                    <div className="text-[10px] text-zinc-500">support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">10Gbps</div>
                    <div className="text-[10px] text-zinc-500">ความเร็ว</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-medium text-white">เลือกเซิร์ฟเวอร์</h1>
                <p className="text-xs text-zinc-500">ยินดีต้อนรับ {user.name}</p>
              </div>
              {isAdmin && (
                <Link 
                  href="/admin/vpn" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Server size={14} />
                  จัดการ
                </Link>
              )}
            </div>

            {/* Server Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.length === 0 ? (
                <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-zinc-800">
                  <Wifi className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">ยังไม่มีเซิร์ฟเวอร์</p>
                </div>
              ) : (
                servers.map((server) => (
                  <ServerCard key={server.id} server={server} user={user} totalServers={servers.length} />
                ))
              )}
            </div>
          </div>
        </main>
        
        <ChatWidget />
      </div>
    )
  }

  // ถ้ายังไม่ล็อกอิน แสดงหน้าแรกแบบเต็ม
  const benefits = [
    { icon: Gamepad2, title: "เล่นเกมลื่น", desc: "ปิงต่ำ เล่น ROV, PUBG ได้ไม่มีสะดุด" },
    { icon: Youtube, title: "ดูหนัง 4K", desc: "รองรับ YouTube, Netflix ไม่กระตุก" },
    { icon: Download, title: "ดาวน์โหลดไว", desc: "แบนด์วิธไม่จำกัด โหลดเต็มสปีด" },
    { icon: Shield, title: "ปลอดภัย", desc: "เข้ารหัส AES-256 ไม่เก็บ log" },
    { icon: Globe, title: "เข้าทุกเว็บ", desc: "ปลดบล็อกเว็บไซต์ทั่วโลก" },
    { icon: Smartphone, title: "ทุกอุปกรณ์", desc: "รองรับ iOS, Android, PC" }
  ]

  const steps = [
    { step: "1", icon: Users, title: "สมัครสมาชิก", desc: "สมัครฟรี ใช้เวลาไม่ถึง 1 นาที" },
    { step: "2", icon: CreditCard, title: "เติมเงิน", desc: "เลือกแพ็กเกจ เริ่มต้น 50 บาท" },
    { step: "3", icon: Rocket, title: "เริ่มใช้งาน", desc: "เชื่อมต่อแล้วใช้งานได้เลย" }
  ]

  // Server preview data for non-logged users
  const serverLocations = [
    { flag: "🇹🇭", name: "ไทย", ping: "<1ms" },
    { flag: "🇸🇬", name: "สิงคโปร์", ping: "15ms" },
    { flag: "🇯🇵", name: "ญี่ปุ่น", ping: "45ms" },
    { flag: "🇭🇰", name: "ฮ่องกง", ping: "25ms" },
    { flag: "🇺🇸", name: "สหรัฐอเมริกา", ping: "180ms" },
    { flag: "🇬🇧", name: "อังกฤษ", ping: "220ms" },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar user={null} isAdmin={false} />

      <main>
        <HeroSection />

        {/* Benefits Section */}
        <section className="py-20 bg-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <FadeIn>
                <h2 className="text-2xl font-bold text-white mb-2">ทำไมต้องใช้ SimonVPN?</h2>
                <p className="text-zinc-500">ครบทุกความต้องการของคุณ</p>
              </FadeIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((item, idx) => (
                <FadeIn key={idx} delay={idx * 0.1} direction="up">
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 h-full group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Server Locations Preview - HIDE until login */}
        <section className="py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                  <MapPin size={14} />
                  ให้บริการทั่วโลก
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">เซิร์ฟเวอร์ทั่วโลกกว่า 20+ แห่ง</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">เชื่อมต่อได้จากทุกที่ทั่วโลก ด้วยความเร็วสูงสุด 10Gbps ไม่มีดีเลย์ ไม่มีสะดุด</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {serverLocations.map((loc, idx) => (
                <FadeIn key={idx} delay={idx * 0.05} direction="up">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center hover:border-zinc-700 transition-all group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{loc.flag}</div>
                    <div className="text-sm font-medium text-white">{loc.name}</div>
                    <div className="text-xs text-emerald-400">{loc.ping}</div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Server Features */}
            <FadeIn delay={0.3}>
              <div className="rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">ความปลอดภัยสูง</div>
                      <div className="text-xs text-zinc-400">เข้ารหัส AES-256</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">ออนไลน์ตลอด 24/7</div>
                      <div className="text-xs text-zinc-400">ไม่มีดาวน์ไทม์</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">ความเร็วสูง</div>
                      <div className="text-xs text-zinc-400">10Gbps ทุกเซิร์ฟเวอร์</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* CTA to see all servers */}
            <FadeIn delay={0.4}>
              <div className="mt-8 text-center">
                <p className="text-zinc-400 text-sm mb-4">และอีกกว่า 15+ แห่งทั่วโลก</p>
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
                >
                  สมัครสมาชิกเพื่อดูทั้งหมด
                  <Rocket size={18} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* How to Use */}
        <section className="py-20 bg-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-white mb-2">เริ่มต้นใช้งานใน 3 ขั้นตอน</h2>
                <p className="text-zinc-500">ง่ายๆ ใช้เวลาไม่ถึง 5 นาที</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <FadeIn key={idx} delay={idx * 0.2} direction="up">
                  <div className="relative">
                    {/* Connection line */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-500/50 to-transparent" />
                    )}
                    <div className="text-center relative z-10">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:border-blue-500 transition-colors">
                        <step.icon className="w-7 h-7 text-blue-500" />
                      </div>
                      <div className="text-xs text-blue-500 font-medium mb-2">ขั้นตอนที่ {step.step}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-500">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-10 text-center relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-400/20 rounded-full blur-[80px]" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium mb-6">
                    <Gift size={14} />
                    โปรโมชั่นพิเศษ
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
                  </h2>
                  <p className="text-white/80 mb-8 max-w-lg mx-auto">
                    สมัครสมาชิกวันนี้ รับสิทธิ์ทดลองใช้ฟรีทันที ไม่ต้องใช้บัตรเครดิต
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                      href="/register" 
                      className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 hover:bg-zinc-100 rounded-lg font-bold transition-colors"
                    >
                      สมัครฟรีเลย
                    </Link>
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-medium transition-colors"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">SimonVPN</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-600">
              <Link href="#" className="hover:text-zinc-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link href="#" className="hover:text-zinc-400 transition-colors">เงื่อนไขการใช้งาน</Link>
              <Link href="#" className="hover:text-zinc-400 transition-colors">ติดต่อเรา</Link>
            </div>
            <div className="text-sm text-zinc-700">
              © {new Date().getFullYear()} SimonVPN
            </div>
          </div>
        </div>
      </footer>
      
      <ChatWidget />
    </div>
  )
}
