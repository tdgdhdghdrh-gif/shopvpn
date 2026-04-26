import { NextRequest, NextResponse } from 'next/server'

// GET - Public: ปิดระบบ overlay ไปเลย
export async function GET() {
  return NextResponse.json({ update: null })
}
