import type { Metadata } from 'next'
import { requireReseller } from '@/lib/session'
import ResellerSidebar from '@/components/reseller/Sidebar'
import Header from '@/components/admin/Header'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default async function ResellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireReseller()

  return (
    <div className="min-h-dvh bg-black text-zinc-400 selection:bg-blue-500/30 font-sans antialiased">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] sm:w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] sm:w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <ResellerSidebar shopName={profile.shopName} />

      <div className="lg:ml-[var(--sidebar-width)] transition-all duration-300 min-h-dvh flex flex-col relative" style={{ '--sidebar-width': '240px' } as any}>
        <Header adminName={profile.shopName || user.name} />

        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="py-3 px-3 text-center">
          <div className="max-w-7xl mx-auto border-t border-white/5 pt-3">
            <p className="text-[9px] text-zinc-700 font-medium uppercase tracking-[0.2em]">
              Reseller Panel &bull; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>

      {/* Sidebar width management */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --sidebar-width: 240px; }
        aside:has(button svg.lucide-chevron-right) + div { --sidebar-width: 72px; }
        @media (max-width: 1024px) {
          :root { --sidebar-width: 0px !important; }
          div { --sidebar-width: 0px !important; }
        }
      `}} />
    </div>
  )
}
