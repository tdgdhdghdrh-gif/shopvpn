'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'th' | 'en'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  th: {
    'nav.home': 'หน้าแรก',
    'nav.freeVless': 'Free VLESS',
    'nav.blog': 'บล็อก',
    'nav.topup': 'เติมเงิน',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.register': 'สมัครสมาชิก',
    'nav.joinNow': 'สมัครเลย',
    'nav.balance': 'ยอดเงิน',
    'nav.logout': 'ออกจากระบบ',
    'nav.welcome': 'ยินดีต้อนรับ',
    'nav.online': 'ออนไลน์',
    'nav.menuMain': 'เมนูหลัก',
    'nav.menuAccount': 'บัญชีของฉัน',
    'nav.menuMarketplace': 'ตลาดซื้อขาย',
    'nav.menuAdmin': 'ผู้ดูแลระบบ',
    'nav.registerReseller': 'ลงทะเบียนฝากขายเพื่อเปิดร้านค้า',
    'nav.guestTitle': 'เข้าสู่ระบบ',
    'nav.guestDesc': 'เพื่อใช้งานบริการ',
    'lang.th': 'ไทย',
    'lang.en': 'English',
    'lang.switch': 'เปลี่ยนภาษา',
  },
  en: {
    'nav.home': 'Home',
    'nav.freeVless': 'Free VLESS',
    'nav.blog': 'Blog',
    'nav.topup': 'Top Up',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.joinNow': 'Join Now',
    'nav.balance': 'Balance',
    'nav.logout': 'Logout',
    'nav.welcome': 'Welcome',
    'nav.online': 'Online',
    'nav.menuMain': 'Main Menu',
    'nav.menuAccount': 'My Account',
    'nav.menuMarketplace': 'Marketplace',
    'nav.menuAdmin': 'Admin',
    'nav.registerReseller': 'Register as reseller to open your shop',
    'nav.guestTitle': 'Sign In',
    'nav.guestDesc': 'to use our services',
    'lang.th': 'ไทย',
    'lang.en': 'English',
    'lang.switch': 'Language',
  },
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'th',
  setLang: () => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language
    if (saved === 'th' || saved === 'en') {
      setLangState(saved)
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('app-language', newLang)
    document.documentElement.lang = newLang
  }

  const t = (key: string): string => {
    return translations[lang][key] || key
  }

  // Avoid hydration mismatch by rendering children only after mount
  // But we still provide context value immediately so SSR works
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
