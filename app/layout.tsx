import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimonVPNShop - บริการเน็ต VPN ความเร็วสูง 🚀",
  description: "SimonVPNShop บริการเน็ต VPN ความเร็วสูง รองรับการใช้งานผ่านแอพ X2BOX 📱 ✔️ เน็ตแรง เสถียร ไม่หลุดง่าย ✔️ เล่นเกมลื่น ไม่ดีเลย์ ✔️ ดู YouTube / Netflix ไม่กระตุก ✔️ รองรับ AIS (ตอนนี้) 🎯 ทดลองใช้งานก่อนเช่าได้! มั่นใจก่อนตัดสินใจ ไม่ดีไม่ต้องเช่า 💎 ดูแลตลอดการใช้งาน ⚡ เร็วกว่าเน็ตปกติสูงสุด 10 เท่า* 💰 เพียง 100 บาท / เดือน",
  keywords: ["VPN", "SimonVPNShop", "เน็ต VPN", "เน็ตแรง", "เล่นเกม", "Netflix", "AIS", "X2BOX", "ทดลองใช้ฟรี"],
  authors: [{ name: "SimonVPNShop" }],
  openGraph: {
    title: "SimonVPNShop - บริการเน็ต VPN ความเร็วสูง 🚀",
    description: "SimonVPNShop บริการเน็ต VPN ความเร็วสูง รองรับการใช้งานผ่านแอพ X2BOX 📱 ✔️ เน็ตแรง เสถียร ไม่หลุดง่าย ✔️ เล่นเกมลื่น ไม่ดีเลย์ ✔️ ดู YouTube / Netflix ไม่กระตุก 🎯 ทดลองใช้งานก่อนเช่าได้! 💰 เพียง 100 บาท / เดือน",
    url: "https://simonvpn.darkx.shop/",
    siteName: "SimonVPNShop",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
