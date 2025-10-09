'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email dan password wajib diisi' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return { error: 'Email atau password salah' }
    }

    // Buat JWT token
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'token',
      value: token,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 hari
    })

    const redirectUrl = user.roleId === 3 ? '/admin/dashboard' : '/dashboard'
    
    return { 
      success: true, 
      message: 'Login berhasil',
      redirectUrl 
    }
  } catch (err) {
    console.error(err)
    return { error: 'Terjadi kesalahan server' }
  }
}

// Cached version for getCurrentUser
export const getCachedCurrentUser = unstable_cache(
  async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        roleId: true,
        statusId: true,
      },
    })

    if (!user) {
      return { error: 'User tidak ditemukan' }
    }

    return {
      ...user,
      shiftId: 1, // default shiftId
    }
  },
  ['current-user'],
  { 
    tags: ['auth', 'user'],
    revalidate: 60 // 60 seconds
  }
)

// Wrapper function that handles authentication
export async function getCurrentUserCached() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return { error: 'Belum login' }
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number
      roleId: number
    }

    return await getCachedCurrentUser(payload.userId)
  } catch (err) {
    console.error('JWT verify error:', err)
    return { error: 'Terjadi error' }
  }
}

// Keep original for backward compatibility
export const getCurrentUser = cache(async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return { error: 'Belum login' }
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number
      roleId: number
    }

    // Ambil data user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        roleId: true,
        statusId: true,
      },
    })

    if (!user) {
      return { error: 'User tidak ditemukan' }
    }

    return {
      ...user,
      shiftId: 1, // default shiftId
    }
  } catch (err) {
    console.error('JWT verify error:', err)
    return { error: 'Terjadi error' }
  }
})

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    return { success: true }
  } catch (err) {
    console.error('Logout error:', err)
    return { error: 'Gagal logout' }
  }
}