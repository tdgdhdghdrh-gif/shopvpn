# 3X-UI Panel Proxy

Proxy API สำหรับเชื่อมต่อระหว่างร้านค้ากับ 3X-UI Panel เมื่อถูก Firewall บล็อก

## การติดตั้ง (บนเครื่อง Panel)

### 1. ติดตั้ง Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. อัพโหลดไฟล์ไปยังเครื่อง Panel
```bash
# จากเครื่องร้านค้า ส่งไฟล์ไปเครื่อง Panel
scp -r panel-proxy root@103.253.72.93:/root/
```

### 3. ติดตั้ง Dependencies
```bash
cd /root/panel-proxy
npm install
```

### 4. ตั้งค่า Environment
```bash
cp .env.example .env
nano .env
```

แก้ไขไฟล์ `.env`:
```
PANEL_URL=https://localhost:2053
PANEL_PATH=/25FyvMy2qxELmnl5Sp
PORT=3001
API_KEY=your-secret-key-here
```

### 5. เปิด Firewall
```bash
# อนุญาตให้เครื่องร้านค้าเข้าถึง port 3001
ufw allow from 103.253.73.24 to any port 3001

# หรือเปิดทั้งหมด (ไม่แนะนำ)
ufw allow 3001/tcp
```

### 6. รัน Proxy
```bash
# ด้วย PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# หรือรันธรรมดา
npm start
```

### 7. ทดสอบ
```bash
curl http://localhost:3001/
```

## การใช้งานจากร้านค้า

### ตั้งค่าในร้านค้า
แก้ไข `lib/vpn-api.ts` ให้เชื่อมต่อผ่าน Proxy แทน:

```typescript
const PROXY_URL = 'http://103.253.72.93:3001';
const API_KEY = 'your-secret-key-here';
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/login` | POST | Login to panel |
| `/inbound/:id` | GET | Get inbound details |
| `/inbounds` | GET | Get all inbounds |
| `/addClient` | POST | Add new client |
| `/updateClient/:id` | POST | Update client |
| `/delClient` | POST | Delete client |

### Headers ที่ต้องส่ง
```
X-API-Key: your-secret-key-here
Content-Type: application/json
```

## ความปลอดภัย

1. เปลี่ยน `API_KEY` เป็นค่าที่ยากเดา
2. จำกัด IP ที่เข้าถึงได้ (UFW)
3. ใช้ HTTPS ถ้าเป็นไปได้ (ตั้งค่า Nginx reverse proxy)
