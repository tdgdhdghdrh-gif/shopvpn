import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ลงทะเบียนเว็บ',
  description: 'ลงทะเบียน License Key เพื่อเปิดใช้งานเว็บ',
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
