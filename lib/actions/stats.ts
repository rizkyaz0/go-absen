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

export async function getAttendanceStats(userId: number) {
  try {
    await verifyToken()

    if (!userId) {
      return { success: true, data: { value: 0 } }
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM Absence
      WHERE userId = ${userId}
        AND checkIn IS NOT NULL
        AND YEAR(date) = ${year}
        AND MONTH(date) = ${month}
    `

    const hadirCount = Number(result[0]?.count || 0)

    return { success: true, data: { value: hadirCount } }
  } catch (err) {
    console.error('Error fetching attendance stats:', err)
    return { success: true, data: { value: 0 } }
  }
}

export async function getLeaveStats() {
  try {
    await verifyToken()

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    // Total cuti dalam bulan ini
    const totalCuti = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        }
      }
    })

    // Cuti yang disetujui
    const cutiDisetujui = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        },
        status: 'Approved'
      }
    })

    // Cuti yang ditolak
    const cutiDitolak = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        },
        status: 'Rejected'
      }
    })

    // Cuti yang pending
    const cutiPending = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        },
        status: 'Pending'
      }
    })

    return {
      success: true,
      data: {
        totalCuti,
        cutiDisetujui,
        cutiDitolak,
        cutiPending
      }
    }
  } catch (err) {
    console.error('Error fetching leave stats:', err)
    return { error: 'Failed to fetch leave stats' }
  }
}

export async function getUserLeaveStats(userId: number) {
  try {
    await verifyToken()

    if (!userId) {
      return { success: true, data: { remainingLeave: 2, usedLeave: 0 } }
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    // Ambil semua cuti yang disetujui untuk user ini dalam bulan ini
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        userId: userId,
        status: 'Approved',
        startDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0)
        }
      },
      select: {
        startDate: true,
        endDate: true
      }
    })

    // Hitung total hari cuti yang sudah digunakan
    let usedLeaveDays = 0
    approvedLeaves.forEach((leave: { startDate: Date; endDate: Date }) => {
      const startDate = new Date(leave.startDate)
      const endDate = new Date(leave.endDate)
      
      // Hitung perbedaan hari (1 cuti = 1 hari)
      // Jika startDate dan endDate sama, maka 1 hari
      // Jika berbeda, hitung selisih hari + 1 (termasuk hari terakhir)
      const timeDiff = endDate.getTime() - startDate.getTime()
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1
      
      usedLeaveDays += daysDiff
    })

    // Jatah cuti per bulan = 2 hari
    const monthlyLeaveQuota = 2
    const remainingLeave = Math.max(0, monthlyLeaveQuota - usedLeaveDays)

    return {
      success: true,
      data: {
        remainingLeave,
        usedLeave: usedLeaveDays,
        monthlyQuota: monthlyLeaveQuota
      }
    }
  } catch (err) {
    console.error('Error fetching user leave stats:', err)
    return { success: true, data: { remainingLeave: 2, usedLeave: 0 } }
  }
}