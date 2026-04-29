'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, ChevronRight, TrendingUp, BarChart3, PieChart, Building2, Lock, CheckCircle } from 'lucide-react'

export default function LandingCorporate() {
  return (
    <div className="relative min-h-screen bg-white text-slate-800 overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Top nav */}
      <div className="relative z-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">SimonVPN Enterprise</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <span>Solution</span>
            <span>Pricing</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Hero split */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-6">
              <CheckCircle className="w-3 h-3" />
              ISO 27001 Certified
            </motion.div>
            <h1 className="text-5xl font-black leading-tight mb-6 text-slate-900">
              Enterprise-Grade<br />
              <span className="text-indigo-600">VPN Security</span>
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              ปกป้องข้อมูลองค์กรด้วยมาตรฐานระดับสากล
              เข้ารหัส AES-256-GCM บริหารจัดการผู้ใช้งานได้อย่างเต็มรูปแบบ
            </p>
            <div className="flex gap-4">
              <Link href="/register" className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                Request Demo
              </Link>
              <Link href="/public-vless" className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                Free Trial
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400">Admin Dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-slate-800">2,847</p>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Uptime</p>
                <p className="text-2xl font-bold text-slate-800">99.99%</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                  <div className="w-[99%] h-full bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">Bandwidth Usage</p>
                <span className="text-xs font-bold text-indigo-600">10Gbps</span>
              </div>
              <div className="h-16 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-indigo-100 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 opacity-50">
          {['SOC 2 Type II', 'GDPR Compliant', 'ISO 27001', 'HIPAA Ready'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-slate-400">
              <Lock className="w-4 h-4" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
