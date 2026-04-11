import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'

// Allow up to 10MB request body for image uploads
export const maxBodySize = '10mb'

// ImgBB API - free image hosting
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    let body: { image?: string; type?: string }
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('Upload: JSON parse error (body too large or malformed):', parseError)
      return Response.json({ 
        success: false, 
        error: 'รูปภาพมีขนาดใหญ่เกินไป กรุณาลดขนาดหรือใช้ลิงก์รูปภาพแทน' 
      }, { status: 413 })
    }

    const { image, type } = body
    
    if (!image) {
      return Response.json({ success: false, error: 'ไม่พบรูปภาพ' }, { status: 400 })
    }

    // If it's a data URL, extract the base64 part
    let base64Image = image
    if (image.startsWith('data:image')) {
      base64Image = image.split(',')[1]
    }

    // Try ImgBB first if API key is available
    if (IMGBB_API_KEY && type !== 'qr') {
      try {
        const formData = new FormData()
        formData.append('image', base64Image)
        formData.append('key', IMGBB_API_KEY)

        const res = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData
        })

        const data = await res.json()
        if (data.success && data.data?.url) {
          return Response.json({ 
            success: true, 
            url: data.data.url,
            thumb: data.data.thumb?.url || data.data.url
          })
        }
      } catch (e) {
        console.error('ImgBB upload failed:', e)
      }
    }

    // Fallback: return base64 data URL (for QR code storage in DB)
    // For slip check, we need a public URL, so we'll try another method
    if (type === 'qr') {
      // Store as base64 in database - return the full data URL
      return Response.json({ 
        success: true, 
        url: image.startsWith('data:image') ? image : `data:image/jpeg;base64,${base64Image}`,
        isBase64: true
      })
    }

    // For slip images, we need a public URL
    // Try freeimage.host or similar
    try {
      const formData = new FormData()
      formData.append('source', base64Image)
      formData.append('type', 'base64')
      formData.append('action', 'upload')
      formData.append('privacy', 'public')

      const res = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.status_code === 200 && data.image?.url) {
        return Response.json({ 
          success: true, 
          url: data.image.url
        })
      } else {
        console.error('Freeimage response not OK:', JSON.stringify(data).substring(0, 500))
      }
    } catch (e) {
      console.error('Freeimage upload failed:', e)
    }

    // Last resort: try to upload to a temporary service or return error
    return Response.json({ 
      success: false, 
      error: 'ไม่สามารถอัพโหลดรูปได้ กรุณาใช้ลิงก์รูปภาพแทน',
      fallback: true
    })

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการอัพโหลด' 
    }, { status: 500 })
  }
}
