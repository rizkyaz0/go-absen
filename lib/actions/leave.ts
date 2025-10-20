'use server'

import { cache } from 'react'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

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

    // Invalidate cached data so dashboards reflect the latest state immediately
    revalidateTag('leave')
    revalidateTag('requests')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard/izin')
    revalidatePath('/dashboard')

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

    // Invalidate caches to ensure dashboards and lists update instantly
    revalidateTag('leave')
    revalidateTag('requests')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard/izin')
    revalidatePath('/dashboard')

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
    // Invalidate caches to reflect deletion
    revalidateTag('leave')
    revalidateTag('requests')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard/izin')
    revalidatePath('/dashboard')
    return { success: true, message: 'Permintaan cuti berhasil dihapus' }
  } catch (err) {
    console.error('Error deleting leave request:', err)
    return { error: 'Gagal menghapus permintaan cuti' }
  }
}

// Reset jatah cuti bulanan: tidak menghapus data, hanya membuat entri log reset
// dan nantinya perhitungan sisa jatah cuti berdasarkan bulan berjalan.
export async function resetMonthlyLeaveQuota() {
  try {
    const payload = await verifyToken()
    // Hanya admin (roleId = 3) yang boleh reset
    if (payload.roleId !== 3) {
      return { error: 'Forbidden' }
    }

    // Catat reset ke tabel LeaveReset (untuk audit trail)
    await prisma.leaveReset.create({ data: {} })

    // Setiap user akan DIJAMIN memiliki sisa 2 hari bulan ini dengan cara
    // mengatur quota(user, bulan) = usedDays + 2 sehingga remaining = quota - usedDays = 2
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0)

    const activeUsers = await prisma.user.findMany({ where: { statusId: 1 }, select: { id: true } })
    for (const u of activeUsers) {
      const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId: u.id,
          status: 'Approved',
          startDate: { gte: periodStart, lte: periodEnd },
        },
        select: { startDate: true, endDate: true },
      })

      let usedLeaveDays = 0
      for (const l of approvedLeaves) {
        const s = new Date(l.startDate)
        const e = new Date(l.endDate)
        const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1
        usedLeaveDays += Math.max(diff, 0)
      }

      const targetQuota = usedLeaveDays + 2
      await prisma.leaveQuota.upsert({
        where: { userId_year_month: { userId: u.id, year, month } },
        update: { quota: targetQuota },
        create: { userId: u.id, year, month, quota: targetQuota },
      })
    }

    // Revalidate terkait halaman izin dan dashboard
    revalidateTag('leave')
    revalidateTag('requests')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/dashboard/izin')
    revalidatePath('/dashboard')

    return { success: true, message: 'Jatah cuti bulanan telah di-reset (berlaku bulan berjalan).' }
  } catch (err) {
    console.error('Error resetting monthly leave quota:', err)
    return { error: 'Gagal reset jatah cuti' }
  }
}