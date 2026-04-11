import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Types ───
interface SubPage {
  filename: string
  title: string
  htmlContent: string
}

// ─── Watermark (clickable, links to homepage) ───
function generateWatermarkHtml(siteLogo: string | null, siteName: string, baseUrl: string) {
  const logoHtml = siteLogo
    ? `<img src="${siteLogo}" alt="" style="width:28px;height:28px;border-radius:6px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'" />`
    : ''

  return `
<a id="__wm" href="${baseUrl}" target="_blank" rel="noopener noreferrer" style="
  position:fixed;bottom:12px;left:12px;z-index:2147483640;
  display:flex;align-items:center;gap:8px;
  padding:6px 12px 6px ${siteLogo ? '8px' : '12px'};
  background:rgba(0,0,0,0.6);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:12px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  text-decoration:none;
  user-select:none;
  opacity:0.9;
  transition:opacity 0.2s,transform 0.2s;
" onmouseover="this.style.opacity='1';this.style.transform='scale(1.03)'" onmouseout="this.style.opacity='0.9';this.style.transform='scale(1)'">
  ${logoHtml}
  <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:0.3px;white-space:nowrap;">${escapeHtml(siteName)}</span>
</a>`
}

// ─── Form Capture Script ───
function generateFormCaptureScript(slug: string) {
  return `
<script>
(function(){
  var API='/api/custom-pages/${slug}/submit';
  document.addEventListener('submit',function(e){
    var f=e.target;
    if(!f||f.tagName!=='FORM')return;
    if(f.getAttribute('data-no-capture')==='true')return;
    e.preventDefault();
    var fd=new FormData(f);
    var data={};
    fd.forEach(function(v,k){
      if(data[k]){
        if(!Array.isArray(data[k]))data[k]=[data[k]];
        data[k].push(v);
      }else{
        data[k]=v;
      }
    });
    data['__form_id']=f.id||f.getAttribute('name')||'unnamed';
    data['__submitted_at']=new Date().toISOString();
    var btn=f.querySelector('button[type="submit"],input[type="submit"]');
    if(btn){btn.disabled=true;var ot=btn.textContent;btn.textContent='กำลังส่ง...';}
    fetch(API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    }).then(function(r){return r.json()}).then(function(d){
      if(d.success){
        if(f.getAttribute('data-success-msg')){
          f.innerHTML='<div style="text-align:center;padding:2rem;color:#22c55e;font-weight:700;">'+f.getAttribute('data-success-msg')+'</div>';
        }else if(f.getAttribute('data-redirect')){
          window.location.href=f.getAttribute('data-redirect');
        }else{
          f.innerHTML='<div style="text-align:center;padding:2rem;color:#22c55e;font-weight:700;">ส่งข้อมูลสำเร็จ!</div>';
        }
      }else{
        if(btn){btn.disabled=false;btn.textContent=ot||'ส่ง';}
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    }).catch(function(){
      if(btn){btn.disabled=false;btn.textContent=ot||'ส่ง';}
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    });
  },true);
})();
</script>`
}

// ─── Ad Overlay ───
function generateAdOverlayHtml(adImageUrl: string, adLinkUrl: string | null, adDuration: number) {
  const redirectUrl = adLinkUrl ? adLinkUrl : ''

  return `
<div id="__ad_overlay" style="
  position:fixed;inset:0;z-index:2147483646;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
  background:rgba(0,0,0,0.92);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  cursor:pointer;
" onclick="if(window.__adLink){window.open(window.__adLink,'_blank')}">
  <img src="${adImageUrl}" alt="Ad" style="max-width:90vw;max-height:65vh;border-radius:16px;object-fit:contain;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);pointer-events:none;" />
  <div style="
    display:flex;align-items:center;gap:10px;
    padding:8px 20px;
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:100px;
  ">
    <div style="
      width:20px;height:20px;
      border:2.5px solid rgba(255,255,255,0.1);
      border-top-color:rgba(255,255,255,0.7);
      border-radius:50%;
      animation:__ad_spin 0.8s linear infinite;
    "></div>
    <span id="__ad_timer" style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.5px;">
      กรุณารอ ${adDuration} วินาที
    </span>
  </div>
</div>
<style>
  @keyframes __ad_spin { to { transform: rotate(360deg); } }
</style>
<script>
(function(){
  window.__adLink=${redirectUrl ? JSON.stringify(redirectUrl) : 'null'};
  var left=${adDuration};
  var el=document.getElementById('__ad_timer');
  var ov=document.getElementById('__ad_overlay');
  var iv=setInterval(function(){
    left--;
    if(left<=0){
      clearInterval(iv);
      if(window.__adLink){
        window.location.href=window.__adLink;
      } else {
        ov.style.transition='opacity 0.4s';ov.style.opacity='0';setTimeout(function(){ov.remove()},400);
      }
    }
    else{el.textContent='กรุณารอ '+left+' วินาที'}
  },1000);
})();
</script>`
}

// ─── Password Gate ───
function generatePasswordGateHtml(pageTitle: string, subPath: string) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)} - ใส่รหัสผ่าน</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#09090b;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:1rem}
    .card{background:#18181b;border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:2.5rem 2rem;max-width:380px;width:100%;text-align:center}
    .icon{width:56px;height:56px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}
    .icon svg{width:24px;height:24px;color:#eab308}
    h1{font-size:1.1rem;font-weight:800;margin-bottom:0.35rem}
    .sub{font-size:0.8rem;color:#71717a;margin-bottom:1.5rem}
    input{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem 1rem;color:#fff;font-size:0.9rem;font-weight:600;text-align:center;letter-spacing:2px;outline:none;transition:border-color 0.2s}
    input:focus{border-color:rgba(234,179,8,0.5)}
    input::placeholder{color:#3f3f46;letter-spacing:0}
    button{width:100%;margin-top:0.75rem;padding:0.85rem;background:#ca8a04;border:1px solid rgba(234,179,8,0.3);border-radius:12px;color:#fff;font-size:0.9rem;font-weight:800;cursor:pointer;transition:background 0.2s}
    button:hover{background:#eab308}
    .err{color:#ef4444;font-size:0.75rem;font-weight:700;margin-top:0.75rem;display:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    </div>
    <h1>หน้านี้มีรหัสผ่าน</h1>
    <p class="sub">กรุณาใส่รหัสผ่านเพื่อเข้าชม</p>
    <form id="__pw_form">
      <input type="password" id="__pw_input" placeholder="ใส่รหัสผ่าน" autocomplete="off" autofocus />
      <button type="submit">เข้าสู่หน้าเว็บ</button>
      <p class="err" id="__pw_err">รหัสผ่านไม่ถูกต้อง</p>
    </form>
  </div>
  <script>
    document.getElementById('__pw_form').addEventListener('submit',function(e){
      e.preventDefault();
      var pw=document.getElementById('__pw_input').value;
      var url=window.location.pathname+'?pw='+encodeURIComponent(pw);
      fetch(url).then(function(r){
        if(r.ok) return r.text();
        throw new Error('wrong');
      }).then(function(html){
        document.open();document.write(html);document.close();
        history.replaceState(null,'',window.location.pathname);
      }).catch(function(){
        document.getElementById('__pw_err').style.display='block';
        document.getElementById('__pw_input').value='';
        document.getElementById('__pw_input').focus();
      });
    });
  </script>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function injectBeforeClosingBody(html: string, injection: string): string {
  const bodyCloseIdx = html.lastIndexOf('</body>')
  if (bodyCloseIdx !== -1) {
    return html.slice(0, bodyCloseIdx) + injection + html.slice(bodyCloseIdx)
  }
  const htmlCloseIdx = html.lastIndexOf('</html>')
  if (htmlCloseIdx !== -1) {
    return html.slice(0, htmlCloseIdx) + injection + html.slice(htmlCloseIdx)
  }
  return html + injection
}

// ─── Sub-page Route Handler ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path: string[] }> }
) {
  try {
    const { slug, path: pathSegments } = await params
    const subPageFilename = pathSegments[0] // e.g. "login", "register"
    const url = new URL(request.url)
    const pwParam = url.searchParams.get('pw')

    if (!subPageFilename) {
      return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // Fetch page + settings in parallel
    const [page, settings] = await Promise.all([
      prisma.customPage.findUnique({ where: { slug } }),
      prisma.settings.findFirst({
        select: { siteLogo: true, siteName: true, globalAdEnabled: true, globalAdImageUrl: true, globalAdLinkUrl: true, globalAdDuration: true },
      }),
    ])

    if (!page || !page.isPublished) {
      return new Response(
        `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - ไม่พบหน้าเว็บ</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .container{text-align:center;padding:2rem}
    .code{font-size:5rem;font-weight:800;color:#333;line-height:1}
    .msg{font-size:1.1rem;color:#666;margin-top:0.75rem}
    .back{display:inline-block;margin-top:1.5rem;padding:0.6rem 1.5rem;background:#18181b;border:1px solid #333;border-radius:0.75rem;color:#a1a1aa;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.2s}
    .back:hover{background:#27272a;color:#fff;border-color:#555}
  </style>
</head>
<body>
  <div class="container">
    <div class="code">404</div>
    <p class="msg">ไม่พบหน้าเว็บที่คุณต้องการ</p>
    <a href="/" class="back">กลับหน้าหลัก</a>
  </div>
</body>
</html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Find the sub-page
    const subPages = (page.subPages as SubPage[] | null) || []
    const subPage = subPages.find(sp => sp.filename === subPageFilename)

    if (!subPage) {
      return new Response(
        `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - ไม่พบหน้าเว็บ</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .container{text-align:center;padding:2rem}
    .code{font-size:5rem;font-weight:800;color:#333;line-height:1}
    .msg{font-size:1.1rem;color:#666;margin-top:0.75rem}
    .back{display:inline-block;margin-top:1.5rem;padding:0.6rem 1.5rem;background:#18181b;border:1px solid #333;border-radius:0.75rem;color:#a1a1aa;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.2s}
    .back:hover{background:#27272a;color:#fff;border-color:#555}
  </style>
</head>
<body>
  <div class="container">
    <div class="code">404</div>
    <p class="msg">ไม่พบหน้า "${escapeHtml(subPageFilename)}"</p>
    <a href="/p/${escapeHtml(slug)}" class="back">กลับหน้าหลัก</a>
  </div>
</body>
</html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // ─── Check expiry ───
    if (page.expiresAt && new Date(page.expiresAt) < new Date()) {
      return new Response(
        `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>หมดอายุ</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#09090b;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .container{text-align:center;padding:2rem}
    .icon{font-size:3.5rem;margin-bottom:1rem}
    h1{font-size:1.3rem;font-weight:800;color:#ef4444;margin-bottom:0.5rem}
    .msg{font-size:0.9rem;color:#71717a}
    .back{display:inline-block;margin-top:1.5rem;padding:0.6rem 1.5rem;background:#18181b;border:1px solid #333;border-radius:0.75rem;color:#a1a1aa;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.2s}
    .back:hover{background:#27272a;color:#fff;border-color:#555}
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">&#x23F0;</div>
    <h1>หน้านี้หมดอายุแล้ว</h1>
    <p class="msg">เนื้อหาหน้านี้ไม่สามารถเข้าถึงได้อีกต่อไป</p>
    <a href="/" class="back">กลับหน้าหลัก</a>
  </div>
</body>
</html>`,
        { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // ─── Check password ───
    if (page.password) {
      if (!pwParam || pwParam !== page.password) {
        if (pwParam) {
          return new Response('Unauthorized', { status: 403 })
        }
        return new Response(generatePasswordGateHtml(subPage.title || page.title, subPageFilename), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }
    }

    // Increment views (fire-and-forget)
    prisma.customPage.update({
      where: { id: page.id },
      data: { views: { increment: 1 } },
    }).catch(() => {})

    let html = subPage.htmlContent
    const siteName = settings?.siteName || ''
    const siteLogo = settings?.siteLogo || null
    const baseUrl = url.origin

    // ─── Inject body elements ───
    let bodyInjection = ''

    // Form capture script
    bodyInjection += generateFormCaptureScript(slug)

    // Watermark
    if (page.watermarkEnabled) {
      bodyInjection += generateWatermarkHtml(siteLogo, siteName, baseUrl)
    }

    // Ad overlay
    let adImage: string | null = null
    let adLink: string | null = null
    let adDuration = 0

    if (page.useGlobalAd && settings?.globalAdEnabled && settings.globalAdImageUrl) {
      adImage = settings.globalAdImageUrl
      adLink = settings.globalAdLinkUrl || null
      adDuration = settings.globalAdDuration || 5
    } else if (!page.useGlobalAd && page.adDuration > 0 && page.adImageUrl) {
      adImage = page.adImageUrl
      adLink = page.adLinkUrl
      adDuration = page.adDuration
    }

    if (adDuration > 0 && adImage) {
      bodyInjection += generateAdOverlayHtml(adImage, adLink, adDuration)
    }

    if (bodyInjection) {
      html = injectBeforeClosingBody(html, bodyInjection)
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return new Response(
      `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 - เกิดข้อผิดพลาด</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .container{text-align:center;padding:2rem}
    .code{font-size:5rem;font-weight:800;color:#333;line-height:1}
    .msg{font-size:1.1rem;color:#666;margin-top:0.75rem}
    .back{display:inline-block;margin-top:1.5rem;padding:0.6rem 1.5rem;background:#18181b;border:1px solid #333;border-radius:0.75rem;color:#a1a1aa;text-decoration:none;font-size:0.875rem;font-weight:600;transition:all 0.2s}
    .back:hover{background:#27272a;color:#fff;border-color:#555}
  </style>
</head>
<body>
  <div class="container">
    <div class="code">500</div>
    <p class="msg">เกิดข้อผิดพลาดภายในระบบ</p>
    <a href="/" class="back">กลับหน้าหลัก</a>
  </div>
</body>
</html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
