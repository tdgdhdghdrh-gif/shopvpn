import { requireSuperAdmin } from '@/lib/session'

export default async function ServerInfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // เฉพาะ Super Admin เท่านั้นที่เข้าถึงข้อมูลล็อกอินเซิร์ฟเวอร์ได้
  await requireSuperAdmin()

  return <>{children}</>
}
