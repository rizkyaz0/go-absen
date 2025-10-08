'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
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

// Cached version for getAllLeaveRequests
export const getCachedAllLeaveRequests = unstable_cache(
  async () => {
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            roleId: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
            // password tidak disertakan
          },
        },
      },
    })

    return { success: true, data: leaves }
  },
  ['all-leave-requests'],
  { 
    tags: ['leave', 'requests'],
    revalidate: 60 // 60 seconds
  }
)

// Wrapper function that handles authentication
export async function getAllLeaveRequestsCached() {
  try {
    await verifyToken()
    return await getCachedAllLeaveRequests()
  } catch (err) {
    console.error('Error fetching leave requests:', err)
    return { error: 'Unauthorized' }
  }
}

// Keep original for backward compatibility
export const getAllLeaveRequests = cache(async () => {
  try {
    await verifyToken()

    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            roleId: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
            // password tidak disertakan
          },
        },
      },
    })

    return { success: true, data: leaves }
  } catch (err) {
    console.error('Error fetching leave requests:', err)
    return { error: 'Unauthorized' }
  }
})

export async function createLeaveRequest(leaveData: {
  userId: number
  startDate: string
  endDate: string
  type: string
  reason?: string
}) {
  try {
    await verifyToken()

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: leaveData.userId,
        startDate: new Date(leaveData.startDate),
        endDate: new Date(leaveData.endDate),
        type: leaveData.type,
        status: 'Pending',
        reason: leaveData.reason || '',
        approvedBy: null,
      },
    })

    return { success: true, data: leave }
  } catch (err) {
    console.error('Error creating leave request:', err)
    return { error: 'Gagal membuat permintaan cuti' }
  }
}

export async function updateLeaveRequestStatus(id: number, status: 'Approved' | 'Rejected') {
  try {
    const payload = await verifyToken()

    // Hanya admin yang bisa approve/reject
    if (payload.roleId !== 3) {
      return { error: 'Forbidden' }
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: payload.userId,
      },
    })

    return { success: true, data: updated }
  } catch (err) {
    console.error('Error updating leave request:', err)
    return { error: 'Gagal memperbarui status cuti' }
  }
}

export async function deleteLeaveRequest(id: number) {
  try {
    await verifyToken()

    await prisma.leaveRequest.delete({ where: { id } })
    return { success: true, message: 'Permintaan cuti berhasil dihapus' }
  } catch (err) {
    console.error('Error deleting leave request:', err)
    return { error: 'Gagal menghapus permintaan cuti' }
  }
}