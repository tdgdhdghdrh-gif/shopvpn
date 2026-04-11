import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const blogPosts = [
  {
    slug: 'วิธีแก้เน็ตช้า-เล่นเกมปิงสูง',
    title: '5 วิธีแก้เน็ตช้า เล่นเกมปิงสูง ทำยังไง? [2025]',
    excerpt: 'รวม 5 วิธีแก้เน็ตช้า ปิงสูง เล่นเกมแล้วกระตุก ตั้งแต่เช็คสัญญาณ APN ไปจนถึงใช้ VPN ลดปิง ใช้ได้จริงทุกค่ายมือถือ AIS TRUE DTAC',
    content: `
<h2>ทำไมเน็ตถึงช้า เล่นเกมแล้วปิงสูง?</h2>
<p>ปัญหาเน็ตช้า เล่นเกมแล้วปิงสูง เป็นเรื่องที่คนไทยเจอบ่อยมาก โดยเฉพาะคนที่ใช้เน็ตมือถือ AIS, TRUE, DTAC เล่นเกมออนไลน์อย่าง ROV, PUBG Mobile, Genshin Impact หรือ Free Fire สาเหตุหลักๆ มีหลายอย่าง ตั้งแต่สัญญาณอ่อน คนใช้เน็ตเยอะในพื้นที่เดียวกัน ไปจนถึง routing ของ ISP ที่ไม่ดี</p>

<h2>วิธีที่ 1: เช็คและเปลี่ยน APN ให้ถูกต้อง</h2>
<p>APN (Access Point Name) เป็นตัวกำหนดเส้นทางเน็ต ถ้าตั้งไม่ถูก เน็ตจะช้ากว่าปกติ ลองเปลี่ยน APN ตามค่ายที่ใช้:</p>
<ul>
<li><strong>AIS</strong>: ใช้ APN "internet" หรือ "3gnet" ลองสลับดู</li>
<li><strong>TRUE</strong>: ใช้ APN "internet" แล้วเปลี่ยน Protocol เป็น IPv4</li>
<li><strong>DTAC</strong>: ใช้ APN "www.dtac.co.th" หรือ "dtac"</li>
</ul>
<p>หลังเปลี่ยน APN ให้ restart มือถือ 1 ครั้ง แล้วลองเทสเน็ตใหม่</p>

<h2>วิธีที่ 2: เปิดโหมดเครื่องบินแล้วปิด</h2>
<p>วิธีง่ายที่สุด เปิดโหมดเครื่องบิน (Airplane Mode) ค้างไว้ 10 วินาที แล้วปิด มือถือจะเชื่อมต่อเสาสัญญาณใหม่ อาจได้เสาที่สัญญาณแรงกว่าเดิม</p>

<h2>วิธีที่ 3: ล้าง DNS Cache</h2>
<p>DNS Cache ที่เก่าอาจทำให้เน็ตช้า ลองล้างด้วยวิธีนี้:</p>
<ul>
<li><strong>Android</strong>: ไปที่ Settings > Apps > Chrome > Clear Cache</li>
<li><strong>iOS</strong>: ไปที่ Settings > Safari > Clear History and Website Data</li>
</ul>
<p>หรือเปลี่ยนไปใช้ DNS ของ Cloudflare (1.1.1.1) หรือ Google (8.8.8.8) จะเร็วกว่า DNS ค่ายมือถือ</p>

<h2>วิธีที่ 4: สมัครโปรเสริมเน็ตเกม</h2>
<p>ทุกค่ายมือถือมีโปรเน็ตเกมโดยเฉพาะ ที่จะ prioritize traffic สำหรับเกม:</p>
<ul>
<li><strong>AIS</strong>: โปร Game Boost ราคาเริ่ม 9 บาท/วัน</li>
<li><strong>TRUE</strong>: โปร Game Zoom ลดปิงเกม</li>
<li><strong>DTAC</strong>: โปร Game Non-Stop</li>
</ul>

<h2>วิธีที่ 5: ใช้ VPN ลดปิง (วิธีที่เห็นผลชัดที่สุด)</h2>
<p>VPN ช่วยเปลี่ยนเส้นทางเน็ตให้ไปตรงๆ ถึงเซิร์ฟเวอร์เกม แทนที่จะวนเส้นทางหลายจุด ผลคือปิงลดลงอย่างเห็นได้ชัด จากปิง 80-100ms เหลือ 30-50ms</p>
<p><strong>SimonVPN</strong> เป็น VPN ที่ออกแบบมาสำหรับสายเกมเมอร์โดยเฉพาะ:</p>
<ul>
<li>เซิร์ฟเวอร์ในไทยหลายจุด ลดปิงได้จริง</li>
<li>ใช้ Protocol VLESS ที่เร็วที่สุดในปัจจุบัน</li>
<li>รองรับทั้ง Android (V2rayNG) และ iOS (V2BOX)</li>
<li>ราคาเริ่มต้นแค่วันละไม่กี่บาท</li>
</ul>
<p>ลองทดลองใช้ฟรีก่อนได้ที่ <a href="/public-vless">หน้า Free VLESS</a> ของเรา!</p>

<h2>สรุป</h2>
<p>ถ้าเน็ตช้า เล่นเกมปิงสูง ให้ลองทำตาม 5 วิธีนี้เรียงตามลำดับ เริ่มจากเช็ค APN, รีสตาร์ทสัญญาณ, ล้าง DNS, สมัครโปรเกม และสุดท้ายคือใช้ VPN ซึ่งเป็นวิธีที่เห็นผลชัดที่สุด เพราะช่วยลดปิงได้จริง 30-50%</p>
`,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=630&fit=crop',
    category: 'tips',
    tags: ['เน็ตช้า', 'ปิงสูง', 'เกม', 'VPN', 'APN', 'AIS', 'TRUE', 'DTAC', 'แก้ปิง'],
    readTime: 5,
    metaTitle: '5 วิธีแก้เน็ตช้า เล่นเกมปิงสูง [2025] - ใช้ได้จริง AIS TRUE DTAC',
    metaDesc: 'รวม 5 วิธีแก้เน็ตช้า ปิงสูง เล่นเกมกระตุก ตั้งแต่เปลี่ยน APN, ล้าง DNS จนถึงใช้ VPN ลดปิง 50% ใช้ได้ทุกค่ายมือถือ AIS TRUE DTAC',
  },
  {
    slug: 'รีวิว-v2box-ตั้งค่ายังไง',
    title: 'รีวิวแอป V2BOX: ตั้งค่ายังไงให้แรงทะลุโลก [iOS/Android]',
    excerpt: 'รีวิว V2BOX แอป VPN ที่ดีที่สุดสำหรับ iOS พร้อมวิธีตั้งค่าแบบละเอียด ใช้กับ VLESS, VMess, Trojan ได้ทุก Protocol',
    content: `
<h2>V2BOX คืออะไร?</h2>
<p>V2BOX เป็นแอปพลิเคชัน VPN Client ที่ได้รับความนิยมสูงมากในหมู่ผู้ใช้ iOS โดยรองรับ Protocol หลากหลายทั้ง VLESS, VMess, Trojan, Shadowsocks ทำให้ใช้งานได้กว้างขวาง เป็นแอปที่แนะนำอันดับ 1 สำหรับ iPhone/iPad</p>

<h2>ทำไมต้อง V2BOX?</h2>
<ul>
<li><strong>รองรับหลาย Protocol</strong>: VLESS, VMess, Trojan, Shadowsocks, WireGuard</li>
<li><strong>UI สวย ใช้ง่าย</strong>: ออกแบบมาเพื่อ iOS โดยเฉพาะ ไม่ซับซ้อน</li>
<li><strong>แรง เสถียร</strong>: ใช้ Xray-core เวอร์ชันล่าสุด</li>
<li><strong>รองรับ Subscription URL</strong>: เพิ่มเซิร์ฟเวอร์แค่ copy ลิงก์เดียว</li>
<li><strong>Routing Rules</strong>: ตั้งค่าให้เฉพาะบางแอปใช้ VPN ได้</li>
</ul>

<h2>วิธีดาวน์โหลด V2BOX</h2>
<ol>
<li>เปิด <strong>App Store</strong> บน iPhone/iPad</li>
<li>ค้นหา "<strong>V2BOX</strong>"</li>
<li>กดดาวน์โหลด (ฟรี)</li>
<li>เปิดแอป อนุญาตการเพิ่ม VPN Configuration</li>
</ol>
<p><em>หมายเหตุ: ถ้าหาไม่เจอ อาจต้องเปลี่ยน Apple ID เป็นของสหรัฐฯ หรือ ฮ่องกง</em></p>

<h2>วิธีตั้งค่า V2BOX กับ SimonVPN (แบบละเอียด)</h2>

<h3>Step 1: คัดลอก VLESS Link</h3>
<p>เมื่อซื้อ VPN จาก SimonVPN แล้ว ไปที่หน้า "รายการสั่งซื้อ" แล้วกด "คัดลอก VLESS Link"</p>

<h3>Step 2: เพิ่มเซิร์ฟเวอร์ใน V2BOX</h3>
<ol>
<li>เปิด V2BOX</li>
<li>กดปุ่ม <strong>"+"</strong> มุมขวาบน</li>
<li>เลือก <strong>"Import from Clipboard"</strong></li>
<li>แอปจะดึง VLESS Link ที่คัดลอกไว้มาเพิ่มอัตโนมัติ</li>
</ol>

<h3>Step 3: เชื่อมต่อ</h3>
<ol>
<li>เลือกเซิร์ฟเวอร์ที่เพิ่มไว้</li>
<li>กดปุ่มเปิดเชื่อมต่อ (ปุ่มกลมๆ ตรงกลาง)</li>
<li>อนุญาต VPN Configuration เมื่อมี Popup</li>
<li>เมื่อขึ้นสถานะ <strong>"Connected"</strong> = ใช้งานได้แล้ว!</li>
</ol>

<h2>เคล็ดลับเพิ่มความเร็ว</h2>
<ul>
<li><strong>เปิด QUIC</strong>: ถ้าเซิร์ฟเวอร์รองรับ จะเร็วกว่า TCP ปกติ</li>
<li><strong>เลือก Routing Mode: Global</strong>: ให้ทุก Traffic ผ่าน VPN</li>
<li><strong>ปิด Mux</strong>: ลด overhead ถ้าใช้ VLESS-Reality</li>
</ul>

<h2>สรุป</h2>
<p>V2BOX เป็นแอป VPN Client ที่ดีที่สุดสำหรับ iOS ในปัจจุบัน ใช้งานง่าย รองรับ Protocol ทันสมัย เหมาะกับผู้ใช้ SimonVPN ทุกคน ถ้ายังไม่มีบัญชี สมัครใช้งานได้เลย!</p>
`,
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop',
    category: 'guide',
    tags: ['V2BOX', 'iOS', 'VPN', 'VLESS', 'วิธีตั้งค่า', 'iPhone', 'iPad', 'แอป VPN'],
    readTime: 7,
    metaTitle: 'รีวิว V2BOX: วิธีตั้งค่า VPN บน iOS แบบละเอียด [2025]',
    metaDesc: 'รีวิว V2BOX แอป VPN ที่ดีที่สุดบน iOS วิธีตั้งค่าแบบละเอียดใช้กับ VLESS VMess Trojan พร้อมเคล็ดลับเพิ่มความเร็ว',
  },
  {
    slug: 'vpn-คืออะไร-ทำไมสายเกมเมอร์ต้องมี',
    title: 'VPN คืออะไร? ทำไมสายเกมเมอร์ต้องมี [อธิบายแบบเข้าใจง่าย]',
    excerpt: 'อธิบาย VPN คืออะไร ทำงานยังไง ทำไมสายเกมเมอร์ถึงต้องใช้ VPN ช่วยลดปิง เล่นเกมลื่น เข้าถึงเซิร์ฟเวอร์ต่างประเทศ',
    content: `
<h2>VPN คืออะไร? อธิบายแบบเข้าใจง่าย</h2>
<p>VPN (Virtual Private Network) คือเทคโนโลยีที่สร้าง "อุโมงค์ลับ" ระหว่างมือถือ/คอมพิวเตอร์ของเราไปยังเซิร์ฟเวอร์ปลายทาง ทำให้:</p>
<ul>
<li><strong>ข้อมูลถูกเข้ารหัส</strong>: ไม่มีใครแอบดูได้ ไม่ว่าจะเป็น ISP หรือแฮกเกอร์</li>
<li><strong>เปลี่ยน IP Address</strong>: เข้าถึงเว็บไซต์/เกมที่ถูกบล็อกในพื้นที่</li>
<li><strong>เปลี่ยนเส้นทางเน็ต</strong>: ลดปิง ลด latency เล่นเกมลื่นขึ้น</li>
</ul>

<h2>VPN ทำงานยังไง?</h2>
<p>ปกติเวลาเราเล่นเกมหรือเข้าเว็บ ข้อมูลจะวิ่งจากมือถือ → เสาสัญญาณ → ISP (เช่น AIS, TRUE) → เซิร์ฟเวอร์เกม ซึ่ง ISP อาจ routing ไม่ดี ทำให้ข้อมูลวนหลายจุดก่อนถึงเซิร์ฟเวอร์</p>
<p>เมื่อใช้ VPN ข้อมูลจะวิ่งผ่านอุโมงค์ที่เข้ารหัส ตรงไปยังเซิร์ฟเวอร์ VPN ที่อยู่ใกล้กับเซิร์ฟเวอร์เกม ผลคือ <strong>ปิงลดลง ความเร็วเพิ่มขึ้น</strong></p>

<h2>ทำไมสายเกมเมอร์ถึงต้องมี VPN?</h2>

<h3>1. ลดปิง (Latency) ได้จริง</h3>
<p>VPN ช่วยเปลี่ยนเส้นทางเน็ตให้ตรงที่สุด ลดปิงได้ 30-50% เช่น จากปิง 100ms เหลือ 50ms ทำให้ตอบสนองเร็วขึ้น สำคัญมากในเกม PvP อย่าง ROV, Valorant, PUBG</p>

<h3>2. แก้ปัญหาเน็ตกระตุก (Packet Loss)</h3>
<p>บางครั้งเน็ตไม่ได้ช้า แต่ "กระตุก" เพราะ packet loss สูง VPN ช่วยลด packet loss โดยใช้เส้นทางที่เสถียรกว่า</p>

<h3>3. เข้าเซิร์ฟเวอร์ต่างประเทศ</h3>
<p>เกมบางเกมเปิดเซิร์ฟเวอร์ต่างประเทศก่อน เช่น JP, KR, NA ใช้ VPN เปลี่ยน IP เป็นประเทศนั้นก็เข้าเล่นได้ทันที</p>

<h3>4. หลีกเลี่ยง ISP Throttling</h3>
<p>ISP บางค่ายจำกัดความเร็วเน็ตเกม (throttle) โดยเฉพาะช่วงพีคที่มีคนใช้เยอะ VPN เข้ารหัสข้อมูลทำให้ ISP ไม่รู้ว่าเราเล่นเกมอะไร จึงไม่ถูก throttle</p>

<h3>5. ปกป้องข้อมูลส่วนตัว</h3>
<p>ถ้าเล่นเกมผ่าน Wi-Fi สาธารณะ (ร้านกาแฟ ห้าง) VPN จะเข้ารหัสข้อมูลทั้งหมด ป้องกันแฮกเกอร์ขโมยบัญชีเกมของเรา</p>

<h2>VPN แบบไหนเหมาะกับเกมเมอร์?</h2>
<p>ไม่ใช่ VPN ทุกตัวที่เหมาะกับเกม ต้องเลือกที่:</p>
<ul>
<li><strong>ใช้ Protocol เร็ว</strong>: VLESS, WireGuard (ไม่ใช่ OpenVPN ที่ช้า)</li>
<li><strong>มีเซิร์ฟเวอร์ในไทย</strong>: เพื่อลดปิงเมื่อเล่นเกมเซิร์ฟ SEA/TH</li>
<li><strong>ราคาไม่แพง</strong>: ไม่ต้องจ่ายเดือนละหลายร้อย</li>
<li><strong>มี Support ภาษาไทย</strong>: ถ้ามีปัญหาถามได้</li>
</ul>
<p><strong>SimonVPN</strong> ตอบโจทย์ทุกข้อ ใช้ VLESS Protocol ที่เร็วที่สุด เซิร์ฟเวอร์ในไทยหลายจุด ราคาเริ่มต้นไม่กี่บาทต่อวัน มีทีมงานคนไทยคอยช่วยเหลือ 24/7</p>

<h2>สรุป</h2>
<p>VPN เป็นเครื่องมือสำคัญสำหรับเกมเมอร์ ช่วยลดปิง แก้เน็ตกระตุก เข้าเซิร์ฟต่างประเทศ และปกป้องข้อมูลส่วนตัว ถ้ายังไม่เคยลอง สมัคร SimonVPN แล้วทดลองใช้ฟรีได้เลย!</p>
`,
    coverImage: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=1200&h=630&fit=crop',
    category: 'knowledge',
    tags: ['VPN', 'เกมเมอร์', 'ลดปิง', 'VPN คืออะไร', 'เกมออนไลน์', 'ROV', 'PUBG', 'Valorant'],
    readTime: 6,
    metaTitle: 'VPN คืออะไร? ทำไมสายเกมเมอร์ต้องมี [อธิบายง่ายๆ 2025]',
    metaDesc: 'VPN คืออะไร ทำงานยังไง ทำไมเกมเมอร์ต้องใช้ ช่วยลดปิง แก้เน็ตกระตุก เข้าเซิร์ฟต่างประเทศ อธิบายแบบเข้าใจง่าย',
  },
  {
    slug: 'เปรียบเทียบ-v2box-vs-v2rayng',
    title: 'เปรียบเทียบแอป VPN: V2Box vs V2rayNG ตัวไหนดีกว่า?',
    excerpt: 'เปรียบเทียบ V2BOX กับ V2rayNG แอป VPN ยอดนิยม ข้อดี ข้อเสีย ใช้อันไหนดีกว่ากัน สำหรับ iOS และ Android',
    content: `
<h2>V2BOX vs V2rayNG: แอปไหนเหมาะกับเรา?</h2>
<p>สำหรับคนที่ใช้ VPN protocol อย่าง VLESS หรือ VMess จะต้องมีแอป client ไว้เชื่อมต่อ ซึ่งแอปยอดนิยมมี 2 ตัวคือ <strong>V2BOX</strong> (iOS/Android) และ <strong>V2rayNG</strong> (Android) มาดูกันว่าแต่ละตัวมีจุดเด่นอะไรบ้าง</p>

<h2>ตารางเปรียบเทียบ</h2>
<table>
<thead>
<tr><th>คุณสมบัติ</th><th>V2BOX</th><th>V2rayNG</th></tr>
</thead>
<tbody>
<tr><td>แพลตฟอร์ม</td><td>iOS + Android</td><td>Android เท่านั้น</td></tr>
<tr><td>ราคา</td><td>ฟรี</td><td>ฟรี (Open Source)</td></tr>
<tr><td>UI / ความสวย</td><td>สวย ทันสมัย</td><td>เรียบง่าย</td></tr>
<tr><td>VLESS</td><td>รองรับ</td><td>รองรับ</td></tr>
<tr><td>VMess</td><td>รองรับ</td><td>รองรับ</td></tr>
<tr><td>Trojan</td><td>รองรับ</td><td>รองรับ</td></tr>
<tr><td>VLESS-Reality</td><td>รองรับ</td><td>รองรับ</td></tr>
<tr><td>WireGuard</td><td>รองรับ</td><td>ไม่รองรับ</td></tr>
<tr><td>Subscription URL</td><td>รองรับ</td><td>รองรับ</td></tr>
<tr><td>Routing Rules</td><td>มี (ง่าย)</td><td>มี (ซับซ้อนกว่า)</td></tr>
<tr><td>Speed Test ในตัว</td><td>มี</td><td>มี</td></tr>
<tr><td>Open Source</td><td>ไม่</td><td>ใช่</td></tr>
</tbody>
</table>

<h2>V2BOX: จุดเด่นและข้อจำกัด</h2>
<h3>จุดเด่น</h3>
<ul>
<li>รองรับทั้ง <strong>iOS และ Android</strong> — เหมาะถ้าใช้ทั้ง iPhone และ Android</li>
<li>UI สวย ใช้งานง่าย เหมาะกับมือใหม่</li>
<li>รองรับ WireGuard ด้วย</li>
<li>Import จาก Clipboard ง่ายมาก</li>
</ul>
<h3>ข้อจำกัด</h3>
<ul>
<li>ไม่ Open Source (ต้องเชื่อใจ developer)</li>
<li>บาง Apple ID region อาจหาไม่เจอบน App Store</li>
</ul>

<h2>V2rayNG: จุดเด่นและข้อจำกัด</h2>
<h3>จุดเด่น</h3>
<ul>
<li><strong>Open Source</strong> — โค้ดเปิดเผย ตรวจสอบได้</li>
<li>Lightweight ใช้แบตน้อย</li>
<li>ตั้งค่า Routing Rules ได้ละเอียด</li>
<li>Community ใหญ่ มีคนช่วยเหลือเยอะ</li>
</ul>
<h3>ข้อจำกัด</h3>
<ul>
<li><strong>Android เท่านั้น</strong> — ใช้บน iPhone ไม่ได้</li>
<li>UI ไม่สวยเท่า V2BOX</li>
<li>มือใหม่อาจสับสนกับการตั้งค่า</li>
</ul>

<h2>แล้วควรเลือกตัวไหน?</h2>
<ul>
<li><strong>ใช้ iPhone/iPad</strong> → เลือก <strong>V2BOX</strong> เป็นตัวเลือกเดียวที่ดีที่สุด</li>
<li><strong>ใช้ Android + อยากง่าย</strong> → เลือก <strong>V2BOX</strong> เพราะ UI ง่ายกว่า</li>
<li><strong>ใช้ Android + สาย Tech</strong> → เลือก <strong>V2rayNG</strong> เพราะ Open Source ตั้งค่าได้ละเอียด</li>
</ul>

<h2>วิธีใช้แอปทั้ง 2 ตัวกับ SimonVPN</h2>
<p>ไม่ว่าจะเลือกแอปตัวไหน ขั้นตอนเหมือนกัน:</p>
<ol>
<li>ซื้อ VPN จาก SimonVPN</li>
<li>คัดลอก VLESS Link จากหน้ารายการสั่งซื้อ</li>
<li>เปิดแอป > Import from Clipboard</li>
<li>เลือกเซิร์ฟเวอร์ > กดเชื่อมต่อ</li>
</ol>
<p>แค่ 4 ขั้นตอน ใช้ได้ทั้ง 2 แอปเลย! อ่านวิธีตั้งค่าแบบละเอียดได้ที่ <a href="/setup-guide">หน้าวิธีตั้งค่า</a></p>
`,
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop',
    category: 'review',
    tags: ['V2BOX', 'V2rayNG', 'เปรียบเทียบ', 'แอป VPN', 'iOS', 'Android', 'VLESS'],
    readTime: 6,
    metaTitle: 'V2Box vs V2rayNG: เปรียบเทียบแอป VPN ตัวไหนดีกว่า [2025]',
    metaDesc: 'เปรียบเทียบ V2BOX กับ V2rayNG แอป VPN ยอดนิยม ข้อดีข้อเสีย ใช้ตัวไหนดี สำหรับ iOS Android พร้อมวิธีตั้งค่า',
  },
  {
    slug: 'วิธีตั้งค่า-apn-ais-true-dtac-ให้เร็ว',
    title: 'วิธีตั้งค่า APN เน็ต AIS/TRUE/DTAC ให้แรงสุด [2025]',
    excerpt: 'สอนวิธีตั้งค่า APN เน็ตมือถือ AIS TRUE DTAC แบบละเอียด ทั้ง Android และ iOS ให้เน็ตแรง ไม่หลุด เล่นเกมลื่น',
    content: `
<h2>APN คืออะไร? ทำไมต้องตั้ง?</h2>
<p>APN (Access Point Name) เป็นการตั้งค่าที่บอกมือถือว่าจะเชื่อมต่ออินเทอร์เน็ตผ่านเส้นทางไหน คล้ายกับบอกที่อยู่ให้บุรุษไปรษณีย์ ถ้าตั้งไม่ถูกหรือใช้ค่า default เน็ตอาจช้ากว่าที่ควรจะเป็น</p>
<p>การตั้ง APN ให้ถูกต้อง สามารถช่วยให้:</p>
<ul>
<li>เน็ตเร็วขึ้น 10-30%</li>
<li>สัญญาณเสถียรกว่า หลุดน้อยลง</li>
<li>ปิงต่ำลง เล่นเกมลื่นขึ้น</li>
<li>เปิดเว็บเร็วขึ้น</li>
</ul>

<h2>วิธีตั้งค่า APN บน Android</h2>
<ol>
<li>ไปที่ <strong>Settings</strong> (ตั้งค่า)</li>
<li>เลือก <strong>Connections</strong> หรือ <strong>Network & Internet</strong></li>
<li>เลือก <strong>Mobile Networks</strong> (เครือข่ายมือถือ)</li>
<li>เลือก <strong>Access Point Names</strong> (APN)</li>
<li>กดปุ่ม <strong>"+"</strong> เพื่อเพิ่ม APN ใหม่</li>
<li>กรอกค่าตาม APN ค่ายที่ใช้ (ดูด้านล่าง)</li>
<li>กด <strong>Save</strong> แล้วเลือก APN ที่สร้างใหม่</li>
<li><strong>Restart มือถือ</strong></li>
</ol>

<h2>วิธีตั้งค่า APN บน iOS (iPhone)</h2>
<ol>
<li>ไปที่ <strong>Settings</strong> > <strong>Cellular</strong> > <strong>Cellular Data Network</strong></li>
<li>กรอกค่า APN ในช่อง "Cellular Data" ด้านบนสุด</li>
<li>ปิด-เปิด Cellular Data</li>
</ol>
<p><em>หมายเหตุ: iOS บางเวอร์ชันอาจซ่อนเมนูนี้ ต้องลง Carrier Profile ก่อน</em></p>

<h2>ค่า APN สำหรับ AIS</h2>
<table>
<thead><tr><th>ช่อง</th><th>ค่าที่กรอก</th></tr></thead>
<tbody>
<tr><td>Name</td><td>AIS Internet</td></tr>
<tr><td>APN</td><td>internet</td></tr>
<tr><td>Proxy</td><td>ไม่กรอก</td></tr>
<tr><td>Port</td><td>ไม่กรอก</td></tr>
<tr><td>Username</td><td>ไม่กรอก</td></tr>
<tr><td>Password</td><td>ไม่กรอก</td></tr>
<tr><td>MMSC</td><td>http://mms.ais.co.th</td></tr>
<tr><td>MCC</td><td>520</td></tr>
<tr><td>MNC</td><td>01</td></tr>
<tr><td>APN Type</td><td>default,supl,mms</td></tr>
<tr><td>APN Protocol</td><td>IPv4</td></tr>
</tbody>
</table>

<h2>ค่า APN สำหรับ TRUE / TrueMove H</h2>
<table>
<thead><tr><th>ช่อง</th><th>ค่าที่กรอก</th></tr></thead>
<tbody>
<tr><td>Name</td><td>TRUE Internet</td></tr>
<tr><td>APN</td><td>internet</td></tr>
<tr><td>Proxy</td><td>ไม่กรอก</td></tr>
<tr><td>Port</td><td>ไม่กรอก</td></tr>
<tr><td>Username</td><td>true</td></tr>
<tr><td>Password</td><td>true</td></tr>
<tr><td>MCC</td><td>520</td></tr>
<tr><td>MNC</td><td>04</td></tr>
<tr><td>APN Type</td><td>default,supl</td></tr>
<tr><td>APN Protocol</td><td>IPv4</td></tr>
</tbody>
</table>

<h2>ค่า APN สำหรับ DTAC</h2>
<table>
<thead><tr><th>ช่อง</th><th>ค่าที่กรอก</th></tr></thead>
<tbody>
<tr><td>Name</td><td>DTAC Internet</td></tr>
<tr><td>APN</td><td>www.dtac.co.th</td></tr>
<tr><td>Proxy</td><td>ไม่กรอก</td></tr>
<tr><td>Port</td><td>ไม่กรอก</td></tr>
<tr><td>Username</td><td>ไม่กรอก</td></tr>
<tr><td>Password</td><td>ไม่กรอก</td></tr>
<tr><td>MCC</td><td>520</td></tr>
<tr><td>MNC</td><td>05</td></tr>
<tr><td>APN Type</td><td>default,supl</td></tr>
<tr><td>APN Protocol</td><td>IPv4</td></tr>
</tbody>
</table>

<h2>เคล็ดลับเพิ่มเติม</h2>
<ul>
<li><strong>ใช้ IPv4 เท่านั้น</strong>: IPv6 อาจทำให้เน็ตช้าในบางพื้นที่</li>
<li><strong>ลองเปลี่ยน APN Type</strong>: บางเครื่องใช้ "default" อย่างเดียวเร็วกว่า</li>
<li><strong>Restart หลังเปลี่ยนทุกครั้ง</strong>: สำคัญมาก อย่าข้ามขั้นตอนนี้</li>
<li><strong>ใช้ร่วมกับ VPN</strong>: ตั้ง APN ถูก + ใช้ VPN = เน็ตแรงสุดๆ</li>
</ul>

<h2>ตั้ง APN แล้วยังช้า? ลองใช้ VPN เพิ่ม</h2>
<p>ถ้าตั้ง APN ถูกแล้วยังช้า อาจเป็นเพราะ ISP routing ไม่ดี ลองใช้ VPN เพิ่มเติมจะช่วยเปลี่ยนเส้นทางเน็ตให้เร็วขึ้น <a href="/public-vless">ทดลองใช้ SimonVPN ฟรี</a></p>
`,
    coverImage: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=630&fit=crop',
    category: 'guide',
    tags: ['APN', 'AIS', 'TRUE', 'DTAC', 'ตั้งค่าเน็ต', 'เน็ตแรง', 'Android', 'iOS', 'มือถือ'],
    readTime: 8,
    metaTitle: 'วิธีตั้งค่า APN เน็ต AIS TRUE DTAC ให้แรงสุด [2025]',
    metaDesc: 'สอนตั้งค่า APN เน็ตมือถือ AIS TRUE DTAC ทั้ง Android iOS แบบละเอียด ให้เน็ตแรง ไม่หลุด เล่นเกมลื่น พร้อมค่า APN ล่าสุด',
  },
]

async function main() {
  console.log('Starting blog seed...')

  // Get first admin user to use as author
  const admin = await prisma.user.findFirst({
    where: { isAdmin: true },
    select: { id: true, name: true },
  })

  if (!admin) {
    console.error('No admin user found! Please create an admin first.')
    process.exit(1)
  }

  console.log(`Using admin: ${admin.name} (${admin.id})`)

  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    })

    if (existing) {
      console.log(`Skipping "${post.title}" — already exists`)
      continue
    }

    await prisma.blogPost.create({
      data: {
        ...post,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
        createdBy: admin.id,
      },
    })
    console.log(`Created: "${post.title}"`)
  }

  console.log('\nBlog seed completed!')
  console.log(`Total: ${blogPosts.length} articles`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
