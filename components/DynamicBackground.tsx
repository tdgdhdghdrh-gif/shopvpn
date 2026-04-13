'use client'

import { useSettings } from '@/components/SettingsProvider'

export default function DynamicBackground() {
  const { settings } = useSettings()

  // backgroundOpacity: 0-100 จาก admin (ค่าเริ่มต้น 30)
  const imgOpacity = (settings.backgroundOpacity ?? 30) / 100
  // Overlay — ยิ่งรูปชัด overlay ยิ่งบาง
  const overlayOpacity = Math.max(0, 0.5 - (imgOpacity * 0.3))

  // Detect light theme
  const isLight = ['cleanWhite', 'softGray'].includes(settings.theme || '')

  return (
    <>
      {/* Fixed background container — ใช้ CSS position:fixed + inset:0
          ทำให้อยู่กับที่ไม่ขยับตาม scroll ทั้งมือถือและคอม */}
      <div
        className="pointer-events-none"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          isolation: 'isolate',
          contain: 'strict',
        }}
      >
        {/* Layer 1: Theme background color */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--theme-bg, #000000)',
            transition: 'background-color 0.5s',
          }}
        />

        {/* Layer 2: Background image — ใช้ <img> tag แทน CSS background-image
            เพราะ <img> ที่โหลดเสร็จแล้วจะ cache decoded pixels ไว้ใน GPU memory
            ไม่ถูก re-decode เมื่อ canvas layer ข้างบนทำ recomposite ทุก frame
            (CSS background-image จะถูก re-decode → ทำให้ GIF กระพริบ) */}
        {settings.backgroundImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.backgroundImage}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                opacity: imgOpacity,
                transform: 'translateZ(0)',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            />
            {/* Layer 3: Overlay for readability — light theme ใช้ขาว, dark theme ใช้ดำ */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: isLight
                  ? `rgba(255,255,255,${overlayOpacity})`
                  : `rgba(0,0,0,${overlayOpacity})`,
              }}
            />
          </>
        )}
      </div>
    </>
  )
}
