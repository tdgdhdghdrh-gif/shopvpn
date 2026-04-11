import { requireSuperAdmin } from '@/lib/session'

export default async function SuperRevenueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ป้องกันไม่ให้แอดมินปกติเข้าถึง - เฉพาะ Super Admin เท่านั้น
  await requireSuperAdmin()

  return <>{children}</>
}
