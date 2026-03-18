# ShopOnline - Minimal E-Commerce

เว็บขายสินค้าสไตล์มินิมอล โทนสีดำ ไฮเทค ใช้ Next.js 14+ App Router + Prisma + PostgreSQL

## ฟีเจอร์

- ✨ UI มินิมอล โทนสีดำ ไฮเทค
- 📱 Responsive รองรับ Mobile (2 คอลัมน์)
- 🛒 การ์ดสินค้าครบถ้วน (รูป, ราคา, สต็อก, ยอดขาย, ป้ายแนะนำ)
- 🚀 Server Component ดึงข้อมูลจาก DB โดยตรง (ไม่ใช้ API)
- 💾 Prisma + PostgreSQL
- 🌱 Seed ข้อมูลตัวอย่างพร้อมใช้

## เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า PostgreSQL

**ตัวเลือก A: ใช้ Docker (แนะนำ)**

```bash
docker run -d \
  --name shop-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shop_minimal \
  -p 5432:5432 \
  postgres:15-alpine
```

**ตัวเลือก B: ใช้ PostgreSQL ที่มีอยู่แล้ว**

แก้ไขไฟล์ `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

### 3. รัน Migration

```bash
npx prisma migrate dev --name init
```

### 4. Seed ข้อมูลตัวอย่าง

```bash
npx prisma db seed
# หรือ
npm run seed
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

## โครงสร้างโปรเจค

```
shop-minimal/
├── app/
│   ├── globals.css      # Global styles + Tailwind v4
│   ├── layout.tsx       # Root layout (dark mode)
│   └── page.tsx         # หน้าแรก (Server Component)
├── components/
│   ├── Navbar.tsx       # Navbar เรียบๆ + Hamburger
│   └── ProductCard.tsx  # การ์ดสินค้า
├── lib/
│   └── prisma.ts        # Singleton PrismaClient
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # ข้อมูลตัวอย่าง
├── .env                 # Environment variables
└── next.config.ts       # Next.js config
```

## โมเดลข้อมูล

```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  description   String
  price         Float
  discountPrice Float?
  imageUrl      String
  stock         Int
  sold          Int      @default(0)
  isRecommended Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev

# Build
npm run build

# Prisma
npx prisma studio              # เปิด Prisma Studio
npx prisma migrate dev         # สร้าง migration
npx prisma db seed             # Seed ข้อมูล
npx prisma generate            # Generate Prisma Client
```

## เทคโนโลยี

- [Next.js 16](https://nextjs.org/) - React Framework
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://prisma.io/) - ORM
- [PostgreSQL](https://postgresql.org/) - Database
- [Lucide React](https://lucide.dev/) - Icons
# vpnsas
