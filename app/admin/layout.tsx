import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAnyAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import MaintenanceGuard from '@/components/admin/MaintenanceGuard'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

// Default role fallbacks (same as Sidebar.tsx)
const ADMIN_FALLBACK = ['/admin', '/admin/vpn', '/admin/panel', '/admin/users', '/admin/orders', '/admin/revenue', '/admin/events', '/admin/tickets', '/admin/slow-reports', '/admin/contacts', '/admin/ip-logs', '/admin/promo-links', '/admin/announcements', '/admin/banners', '/admin/popups', '/admin/blog', '/admin/lucky-wheel', '/admin/coupons', '/admin/ads', '/admin/landing-template', '/admin/web-effects', '/admin/hamburger-menu', '/admin/homepage', '/admin/premium-apps', '/admin/default-homepage', '/admin/custom-pages', '/admin/server-template', '/admin/allowed-ips', '/admin/auth-template', '/admin/menu-click-effect', '/admin/topups', '/admin/v2box-codes', '/admin/tune-site']
const AGENT_FALLBACK = ['/admin', '/admin/vpn', '/admin/revenue']
const REVENUE_FALLBACK = ['/admin', '/admin/revenue']

// Super admin exclusive pages — only superAdmin can access these regardless of config
const SUPER_ADMIN_PAGES = ['/admin/server-info', '/admin/super-revenue', '/admin/api-keys', '/admin/branding', '/admin/theme-editor', '/admin/recaptcha', '/admin/settings', '/admin/menu-settings', '/admin/update-site', '/admin/site-license', '/admin/ai-assistant']

function matchesPath(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(href + '/')
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAnyAdmin()
  const adminMenuAccess = (admin as any).adminMenuAccess as string[] | null

  // Get current pathname from middleware header
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || '/admin'

  // SuperAdmin — full access, no restrictions
  if (!admin.isSuperAdmin) {
    // === Check 1: Is this a superAdmin-only page? ===
    const isSuperAdminPage = SUPER_ADMIN_PAGES.some(href => matchesPath(pathname, href))
    if (isSuperAdminPage) {
      redirect('/admin')
    }

    // === Check 2: Is this page globally disabled (maintenance)? ===
    // MaintenanceGuard handles this client-side with a nice UI, but we also enforce server-side
    let settings: { disabledMenus: any; adminRoleMenus: any } | null = null
    try {
      settings = await prisma.settings.findFirst({
        select: { disabledMenus: true, adminRoleMenus: true }
      })
    } catch {
      // DB error — allow through, don't lock out admins
    }

    if (settings) {
      const disabledMenus = Array.isArray(settings.disabledMenus)
        ? (settings.disabledMenus as string[])
        : []

      const isDisabled = disabledMenus.some(href => matchesPath(pathname, href))
      if (isDisabled && pathname !== '/admin') {
        // Disabled menus (maintenance): MaintenanceGuard shows nice UI client-side,
        // but we also enforce server-side — redirect to /admin
        redirect('/admin')
      }

      // === Check 3: Role-based / Per-user menu access ===
      // Only check for non-dashboard pages (everyone can see /admin dashboard)
      if (pathname !== '/admin') {
        let allowedHrefs: string[] = []

        // Priority 1: Per-user override
        if (adminMenuAccess && Array.isArray(adminMenuAccess) && adminMenuAccess.length > 0) {
          allowedHrefs = adminMenuAccess
        }
        // Priority 2: Role-based config from DB
        else if (settings.adminRoleMenus && typeof settings.adminRoleMenus === 'object') {
          const roleMenus = settings.adminRoleMenus as Record<string, string[]>
          if (admin.isAdmin && roleMenus.admin) {
            allowedHrefs = roleMenus.admin
          } else if (admin.isAgent && roleMenus.agent) {
            allowedHrefs = roleMenus.agent
          } else if (admin.isRevenueAdmin && roleMenus.revenueAdmin) {
            allowedHrefs = roleMenus.revenueAdmin
          }
        }
        // Priority 3: Hardcoded fallback
        else {
          if (admin.isAdmin) allowedHrefs = ADMIN_FALLBACK
          else if (admin.isAgent) allowedHrefs = AGENT_FALLBACK
          else if (admin.isRevenueAdmin) allowedHrefs = REVENUE_FALLBACK
        }

        // Check if the current path is allowed
        if (allowedHrefs.length > 0) {
          const isAllowed = allowedHrefs.some(href => matchesPath(pathname, href))
          if (!isAllowed) {
            redirect('/admin')
          }
        }
      }
    }
  }

  return (
    <div className="min-h-dvh bg-black text-zinc-400 selection:bg-blue-500/30 font-sans antialiased">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] sm:w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] sm:w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Sidebar isSuperAdmin={admin.isSuperAdmin || false} isAdmin={admin.isAdmin || false} isRevenueAdmin={admin.isRevenueAdmin || false} isAgent={admin.isAgent || false} userMenuAccess={adminMenuAccess} />
      
      <div className="lg:ml-[var(--sidebar-width)] transition-all duration-300 min-h-dvh flex flex-col relative" style={{ '--sidebar-width': '240px' } as any}>
        <Header adminName={admin.name || 'Admin'} />
        
        <main className="flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <MaintenanceGuard isSuperAdmin={admin.isSuperAdmin || false}>
              {children}
            </MaintenanceGuard>
          </div>
        </main>
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
