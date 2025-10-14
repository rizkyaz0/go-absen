'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email dan password wajib diisi' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return { error: 'Email atau password salah' }
    }

    // Support both hashed and legacy plain passwords
    const isHashed = typeof user.password === 'string' && user.password.startsWith('$2')
    const passwordOk = isHashed ? await bcrypt.compare(password, user.password) : user.password === password
    if (!passwordOk) return { error: 'Email atau password salah' }

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

export async function registerUser(params: {
  name: string
  email: string
  password: string
}) {
  try {
    const { name, email, password } = params
    if (!name || !email || !password) {
      return { error: 'Semua field wajib diisi' }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: 'Email sudah terdaftar' }
    }

    const hashed = await bcrypt.hash(password, 10)

    // Ensure default Role (Developer) and Status (Active) exist
    let role = await prisma.role.findFirst({ where: { name: 'Developer' } })
    if (!role) {
      role = await prisma.role.upsert({
        where: { id: 2 },
        update: { name: 'Developer' },
        create: { id: 2, name: 'Developer' },
      })
    }

    let status = await prisma.status.findFirst({ where: { name: 'Active' } })
    if (!status) {
      status = await prisma.status.upsert({
        where: { id: 1 },
        update: { name: 'Active' },
        create: { id: 1, name: 'Active' },
      })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        roleId: role.id,
        statusId: status.id,
      },
    })

    // Auto login after registration
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    const cookieStore = await cookies()
    cookieStore.set({
      name: 'token',
      value: token,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    })

    const redirectUrl = '/dashboard'
    return { success: true, message: 'Registrasi berhasil', redirectUrl }
  } catch (err) {
    console.error('Register error:', err)
    return { error: 'Gagal registrasi' }
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