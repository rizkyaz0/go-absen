'use server'

import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) throw new Error('Unauthorized')

  const payload = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number }
  return payload
}

export async function getAllUsers() {
  try {
    await verifyToken() // Semua user login bisa akses

    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        roleId: true, 
        statusId: true,
        createdAt: true,
        updatedAt: true
      },
    })

    return { success: true, data: users }
  } catch (err) {
    console.error('Error fetching users:', err)
    return { error: 'Unauthorized' }
  }
}

export async function getUserById(id: number) {
  try {
    await verifyToken() // Semua user login bisa akses

    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        roleId: true, 
        statusId: true 
      },
    })

    if (!user) {
      return { error: 'User tidak ditemukan' }
    }

    return { success: true, data: user }
  } catch (err) {
    console.error('Error fetching user:', err)
    return { error: 'Unauthorized' }
  }
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  roleId: number
  statusId: number
}) {
  try {
    const payload = await verifyToken()

    // Hanya admin (roleId = 3) yang bisa membuat user
    if (payload.roleId !== 3) {
      return { error: 'Forbidden' }
    }

    const { name, email, password, roleId, statusId } = userData

    if (!name || !email || !password || !roleId || !statusId) {
      return { error: 'Semua field wajib diisi' }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // nanti bisa pakai bcrypt hash
        roleId,
        statusId,
      },
      select: { 
        id: true, 
        name: true, 
        roleId: true, 
        statusId: true 
      }, // jangan kirim password
    })

    return { success: true, data: newUser }
  } catch (err) {
    console.error('Error creating user:', err)
    return { error: 'Terjadi error' }
  }
}

export async function updateUser(id: number, userData: {
  name: string
  roleId: number
  statusId: number
}) {
  try {
    const payload = await verifyToken()

    // Hanya admin
    if (payload.roleId !== 3) {
      return { error: 'Forbidden' }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: userData.name,
        roleId: userData.roleId,
        statusId: userData.statusId,
      },
      select: { 
        id: true, 
        name: true, 
        roleId: true, 
        statusId: true 
      }, // jangan kirim password/email
    })

    return { success: true, data: updatedUser }
  } catch (err) {
    console.error('Error updating user:', err)
    return { error: 'Gagal memperbarui user' }
  }
}

export async function deleteUser(id: number) {
  try {
    const payload = await verifyToken()

    // Hanya admin
    if (payload.roleId !== 3) {
      return { error: 'Forbidden' }
    }

    if (isNaN(id)) {
      return { error: 'ID tidak valid' }
    }

    await prisma.absence.deleteMany({ where: { userId: id } })
    await prisma.leaveRequest.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })

    return { success: true, message: 'User berhasil dihapus' }
  } catch (err) {
    console.error('Error deleting user:', err)
    return { error: 'Gagal menghapus user' }
  }
}