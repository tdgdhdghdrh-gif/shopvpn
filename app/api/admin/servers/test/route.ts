import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import https from 'https'
import http from 'http'

// Test connection to 3X-UI panel with detailed logging
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { host, port, path, username, password } = body

    if (!host || !port || !path || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize inputs to prevent ERR_UNESCAPED_CHARACTERS
    const cleanHost = host.trim()
    const cleanPath = path.trim()
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    // Ensure path starts with / and doesn't end with /
    let normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
    if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.substring(0, normalizedPath.length - 1)
    }

    const results: any = {
      tests: [],
      success: false
    }

    // Prepare JSON payload like 3X-UI expects
    const jsonPayload = JSON.stringify({
      username: cleanUsername,
      password: cleanPassword,
      twoFactorCode: ""
    })

    // Test 1: HTTPS GET /login page
    const testHttpsGet = await new Promise<{ success: boolean; status?: number; error?: string }>((resolve) => {
      try {
        const req = https.request({
          hostname: cleanHost,
          port: port,
          path: `${normalizedPath}/login`,
          method: 'GET',
          rejectUnauthorized: false,
          timeout: 15000,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            resolve({ 
              success: res.statusCode === 200 || res.statusCode === 302,
              status: res.statusCode
            })
          })
        })
        
        req.on('error', (err) => resolve({ success: false, error: err.message }))
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }) })
        req.end()
      } catch (err: any) {
        resolve({ success: false, error: err.message })
      }
    })
    
    results.tests.push({ name: 'HTTPS GET /login', ...testHttpsGet })

    // Test 2: HTTPS POST /login with JSON payload
    const testHttpsPost = await new Promise<{ success: boolean; status?: number; error?: string; response?: string; msg?: string }>((resolve) => {
      try {
        const req = https.request({
          hostname: cleanHost,
          port: port,
          path: `${normalizedPath}/login`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonPayload),
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': `https://${cleanHost}:${port}`,
            'Referer': `https://${cleanHost}:${port}${normalizedPath}/`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          rejectUnauthorized: false,
          timeout: 15000,
        }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            let isSuccess = false
            let msg = ''
            
            try {
              // Try to parse JSON response
              const jsonResponse = JSON.parse(data)
              isSuccess = jsonResponse.success === true
              msg = jsonResponse.msg || ''
            } catch {
              // If not JSON, check for success indicators in text
              isSuccess = data.includes('"success":true') || 
                         data.includes('dashboard') || 
                         res.statusCode === 302
            }
            
            resolve({ 
              success: isSuccess,
              status: res.statusCode,
              msg,
              response: data.substring(0, 500)
            })
          })
        })
        
        req.on('error', (err) => resolve({ success: false, error: err.message }))
        req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }) })
        req.write(jsonPayload)
        req.end()
      } catch (err: any) {
        resolve({ success: false, error: err.message })
      }
    })
    
    results.tests.push({ name: 'HTTPS POST /login', ...testHttpsPost })

    // Test 3: HTTP if HTTPS fails
    if (!testHttpsPost.success) {
      const testHttpPost = await new Promise<{ success: boolean; status?: number; error?: string; response?: string; msg?: string }>((resolve) => {
        try {
          const req = http.request({
            hostname: cleanHost,
            port: port,
            path: `${normalizedPath}/login`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(jsonPayload),
              'Accept': 'application/json, text/plain, */*',
              'X-Requested-With': 'XMLHttpRequest',
              'Origin': `http://${cleanHost}:${port}`,
              'Referer': `http://${cleanHost}:${port}${normalizedPath}/`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000,
          }, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
              let isSuccess = false
              let msg = ''
              
              try {
                const jsonResponse = JSON.parse(data)
                isSuccess = jsonResponse.success === true
                msg = jsonResponse.msg || ''
              } catch {
                isSuccess = data.includes('"success":true') || 
                           data.includes('dashboard') || 
                           res.statusCode === 302
              }
              
              resolve({ 
                success: isSuccess,
                status: res.statusCode,
                msg,
                response: data.substring(0, 500)
              })
            })
          })
          
          req.on('error', (err) => resolve({ success: false, error: err.message }))
          req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }) })
          req.write(jsonPayload)
          req.end()
        } catch (err: any) {
          resolve({ success: false, error: err.message })
        }
      })
      
      results.tests.push({ name: 'HTTP POST /login', ...testHttpPost })
      
      if (testHttpPost.success) {
        results.success = true
        results.useHttp = true
      }
    } else {
      results.success = true
      results.useHttp = false
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Test connection error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
