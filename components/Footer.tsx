'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Facebook, MessageCircle, Phone, Globe, Youtube, Music } from 'lucide-react'

interface FooterSettings {
  siteName: string
  siteLogo: string | null
  footerText: string
  footerLinks: { label: string; href: string }[]
  footerSocialLinks: { platform: string; url: string; icon?: string }[]
  footerShowCredit: boolean
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  messenger: MessageCircle,
  line: MessageCircle,
  phone: Phone,
  web: Globe,
  youtube: Youtube,
  tiktok: Music,
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings | null>(null)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            siteName: data.settings.siteName || '',
            siteLogo: data.settings.siteLogo || null,
            footerText: data.settings.footerText || 'Nexus Shield',
            footerLinks: Array.isArray(data.settings.footerLinks) ? data.settings.footerLinks : [],
            footerSocialLinks: Array.isArray(data.settings.footerSocialLinks) ? data.settings.footerSocialLinks : [],
            footerShowCredit: data.settings.footerShowCredit ?? true,
          })
        }
      })
      .catch(() => {})
  }, [])

  if (!settings) return null

  const hasLinks = settings.footerLinks.length > 0
  const hasSocial = settings.footerSocialLinks.length > 0
  const isEmpty = !hasLinks && !hasSocial && !settings.footerShowCredit

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900">
      {!isEmpty && (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {settings.siteLogo ? (
                <img src={settings.siteLogo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-white">{settings.siteName || settings.footerText}</span>
            </div>
            {settings.footerShowCredit && (
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                ให้บริการ VPN ความเร็วสูง เน็ตแรง เสถียร
              </p>
            )}
          </div>

          {/* Quick Links */}
          {hasLinks && (
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">ลิงก์ด่วน</h4>
              <div className="space-y-2">
                {settings.footerLinks.map((link, i) => (
                  link.label.trim().startsWith('http') || link.href.trim().startsWith('http') ? (
                    <a
                      key={i}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[11px] text-zinc-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={i}
                      href={link.href}
                      className="block text-[11px] text-zinc-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Social / Contact */}
          {hasSocial && (
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">ติดต่อเรา</h4>
              <div className="flex flex-wrap gap-2">
                {settings.footerSocialLinks.map((social, i) => {
                  const Icon = platformIcons[social.platform] || Globe
                  return (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/50 flex items-center justify-center transition-all group"
                      title={social.platform}
                    >
                      <Icon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t border-zinc-900 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-zinc-700">
            &copy; {new Date().getFullYear()} {settings.footerText}. All rights reserved.
          </p>
          {settings.footerShowCredit && (
            <p className="text-[10px] text-zinc-800 flex items-center gap-1">
              Made with <span className="text-red-500">&#10084;</span> in Thailand
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
