import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireSuperAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isSuperAdmin: true }
  })
  if (!user?.isSuperAdmin) return null
  return user
}

async function requireAnyAdmin() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isSuperAdmin: true, isAdmin: true, isRevenueAdmin: true, isAgent: true }
  })
  if (!user?.isSuperAdmin && !user?.isAdmin && !user?.isRevenueAdmin && !user?.isAgent) return null
  return user
}

// GET - Get menu settings + role permissions + admin users (for permissions tab)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAnyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Default: return disabled menus + role menus config
    const settings = await prisma.settings.findFirst({
      select: { disabledMenus: true, disabledUserMenus: true, adminRoleMenus: true }
    })

    const result: any = {
      disabledMenus: (settings?.disabledMenus as string[]) || [],
      disabledUserMenus: (settings?.disabledUserMenus as string[]) || [],
      adminRoleMenus: (settings?.adminRoleMenus as any) || null,
    }

    // If requesting admin users for per-user permission management
    if (action === 'users' && admin.isSuperAdmin) {
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { isAdmin: true },
            { isSuperAdmin: true },
            { isRevenueAdmin: true },
            { isAgent: true },
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          isSuperAdmin: true,
          isRevenueAdmin: true,
          isAgent: true,
          adminMenuAccess: true,
        },
        orderBy: [
          { isSuperAdmin: 'desc' },
          { isAdmin: 'desc' },
          { isAgent: 'desc' },
          { isRevenueAdmin: 'desc' },
          { name: 'asc' },
        ]
      })
      result.adminUsers = admins
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to get menu settings:', error)
    return NextResponse.json({ error: 'Failed to get menu settings' }, { status: 500 })
  }
}

// POST - Update disabled menus + role menu config (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })

    const body = await request.json()
    const { disabledMenus, disabledUserMenus, adminRoleMenus } = body

    const updateData: Record<string, unknown> = {}

    // Handle admin menus
    if (Array.isArray(disabledMenus)) {
      updateData.disabledMenus = disabledMenus.filter(
        (m: unknown) => typeof m === 'string' && m.startsWith('/admin')
      )
    }

    // Handle user menus
    if (Array.isArray(disabledUserMenus)) {
      updateData.disabledUserMenus = disabledUserMenus.filter(
        (m: unknown) => typeof m === 'string' && m.startsWith('/')
      )
    }

    // Handle role-based menu config
    if (adminRoleMenus && typeof adminRoleMenus === 'object') {
      const validConfig: Record<string, string[]> = {}
      for (const role of ['admin', 'agent', 'revenueAdmin']) {
        if (Array.isArray(adminRoleMenus[role])) {
          validConfig[role] = adminRoleMenus[role].filter(
            (m: unknown) => typeof m === 'string' && m.startsWith('/admin')
          )
        }
      }
      updateData.adminRoleMenus = validConfig
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid data to update' }, { status: 400 })
    }

    let settings = await prisma.settings.findFirst()

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: updateData
      })
    } else {
      settings = await prisma.settings.create({
        data: updateData
      })
    }

    return NextResponse.json({
      success: true,
      disabledMenus: settings.disabledMenus,
      disabledUserMenus: settings.disabledUserMenus,
      adminRoleMenus: settings.adminRoleMenus,
    })
  } catch (error) {
    console.error('Failed to update menu settings:', error)
    return NextResponse.json({ error: 'Failed to update menu settings' }, { status: 500 })
  }
}

// PUT - Update per-user menu access (Super Admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin()
    if (!admin) return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 })

    const body = await request.json()
    const { userId, adminMenuAccess } = body

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isSuperAdmin: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot modify superAdmin's permissions
    if (targetUser.isSuperAdmin) {
      return NextResponse.json({ error: 'ไม่สามารถแก้ไขสิทธิ์ Super Admin ได้' }, { status: 400 })
    }

    // adminMenuAccess: null = use role default, string[] = custom access
    let accessValue: any = null
    if (Array.isArray(adminMenuAccess)) {
      accessValue = adminMenuAccess.filter(
        (m: unknown) => typeof m === 'string' && m.startsWith('/admin')
      )
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { adminMenuAccess: accessValue },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSuperAdmin: true,
        isRevenueAdmin: true,
        isAgent: true,
        adminMenuAccess: true,
      }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Failed to update user menu access:', error)
    return NextResponse.json({ error: 'Failed to update user menu access' }, { status: 500 })
  }
}
