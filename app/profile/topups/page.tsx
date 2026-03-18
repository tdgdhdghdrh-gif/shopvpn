'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Wallet, CheckCircle2 } from 'lucide-react'

interface Topup {
  id: string
  amount: number
  status: string
  createdAt: string
}

function SuccessMessage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const amount = searchParams.get('amount')
  const newBalance = searchParams.get('balance')
  
  if (!success || !amount) return null
  
  return (
    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
      <CheckCircle2 className="w-5 h-5" />
      <div>
        <p className="font-medium">เติมเงินสำเร็จ {amount} ฿</p>
        {newBalance && <p className="text-sm">เครดิตคงเหลือ: {parseInt(newBalance).toLocaleString()} ฿</p>}
      </div>
    </div>
  )
}

export default function TopupsPage() {
  const [topups, setTopups] = useState<Topup[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [topupsRes, userRes] = await Promise.all([
        fetch('/api/profile/topups'),
        fetch('/api/user/me')
      ])
      
      const topupsData = await topupsRes.json()
      const userData = await userRes.json()
      
      if (topupsData.topups) {
        setTopups(topupsData.topups)
      }
      if (userData.user) {
        setBalance(userData.user.balance)
      }
    } catch (error) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">ประวัติการเติมเงิน</h1>
                <p className="text-xs text-green-400">เครดิต: {balance.toLocaleString()} ฿</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>

        {/* Topups List */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : topups.length === 0 ? (
            <div className="p-8 text-center">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">ยังไม่มีประวัติการเติมเงิน</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {topups.map((topup) => (
                <div 
                  key={topup.id} 
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium">เติมเงิน</p>
                    <p className="text-sm text-gray-500">
                      {new Date(topup.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-green-400 font-bold">+{topup.amount.toLocaleString()} ฿</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
