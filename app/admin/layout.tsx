import { requireAdmin } from '@/lib/session'
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-black text-zinc-400 selection:bg-blue-500/30 font-sans antialiased">
      {/* Background Dynamics */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[100%] sm:w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] sm:w-[50%] h-[50%] bg-cyan-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Sidebar />
      
      <div className="lg:ml-[var(--sidebar-width)] transition-all duration-500 min-h-screen flex flex-col relative" style={{ '--sidebar-width': '280px' } as any}>
        <Header adminName={admin.name || 'Admin'} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-12 pt-20 lg:pt-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 sm:y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            {children}
          </div>
        </main>
        
        <footer className="p-8 sm:p-12 pt-0 text-center">
          <div className="max-w-7xl mx-auto border-t border-white/5 pt-8">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">
              โครงสร้างพื้นฐานควอนตัม &bull; ปกป้องโดย Nexus Shield &bull; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>

      {/* Global CSS for Sidebar width management */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --sidebar-width: 280px; }
        aside:has(button svg.lucide-chevron-right) + div { --sidebar-width: 100px; }
        @media (max-width: 1024px) {
          :root { --sidebar-width: 0px !important; }
          div { --sidebar-width: 0px !important; }
        }
      `}} />
    </div>
  )
}
