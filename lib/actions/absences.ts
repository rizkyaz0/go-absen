'use server'

import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) throw new Error('Unauthorized')

  const payload = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number }
  return payload
}

export async function getAllAbsences() {
  try {
    await verifyToken()

    const absences = await prisma.absence.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
            // password tidak disertakan
          },
        },
        shift: true,
      },
      orderBy: { date: 'desc' },
    })

    return { success: true, data: absences }
  } catch (err) {
    console.error('Error fetching absences:', err)
    return { error: 'Unauthorized' }
  }
}

export async function getAbsencesByUser(userId: number) {
  try {
    await verifyToken()

    const absences = await prisma.absence.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        shift: true,
      },
      orderBy: { date: 'desc' },
    })

    return { success: true, data: absences }
  } catch (err) {
    console.error('Error fetching user absences:', err)
    return { error: 'Unauthorized' }
  }
}

export async function createAbsence(absenceData: {
  userId: number
  shiftId?: number
  date: string
  checkIn?: string
  checkOut?: string
  status: string
  location?: string
  note?: string
}) {
  try {
    await verifyToken()

    const absence = await prisma.absence.create({
      data: {
        userId: absenceData.userId,
        shiftId: absenceData.shiftId || null,
        date: new Date(absenceData.date),
        checkIn: absenceData.checkIn ? new Date(absenceData.checkIn) : null,
        checkOut: absenceData.checkOut ? new Date(absenceData.checkOut) : null,
        status: absenceData.status,
        location: absenceData.location || '',
        note: absenceData.note || '',
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/admin/dashboard/absensi')
    return { success: true, data: absence }
  } catch (err) {
    console.error('Error creating absence:', err)
    return { error: 'Gagal membuat absensi' }
  }
}

export async function updateAbsence(id: number, absenceData: {
  checkIn?: string
  checkOut?: string
  status: string
  note?: string
}) {
  try {
    await verifyToken()

    const updated = await prisma.absence.update({
      where: { id },
      data: {
        checkIn: absenceData.checkIn ? new Date(absenceData.checkIn) : undefined,
        checkOut: absenceData.checkOut ? new Date(absenceData.checkOut) : undefined,
        status: absenceData.status,
        note: absenceData.note,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/admin/dashboard/absensi')
    return { success: true, data: updated }
  } catch (err) {
    console.error('Error updating absence:', err)
    return { error: 'Gagal memperbarui absensi' }
  }
}

export async function deleteAbsence(id: number) {
  try {
    await verifyToken()

    if (!id) {
      return { error: 'ID required' }
    }

    await prisma.absence.delete({ where: { id } })
    revalidatePath('/admin/dashboard/absensi')
    revalidatePath('/dashboard')
    return { success: true, message: 'Absensi deleted' }
  } catch (err) {
    console.error('Error deleting absence:', err)
    return { error: 'Gagal menghapus absensi' }
  }
}

export async function toggleAbsenceAction(userId: number, shiftId: number = 1) {
  try {
    await verifyToken()
    
    // Get today's date in UTC+7
    const today = new Date()
    const todayUTC7 = new Date(today.getTime() + 7 * 60 * 60 * 1000)
    const todayDateString = todayUTC7.toISOString().slice(0, 10)
    
    // Check if there's already an absence record for today
    const existingAbsence = await prisma.absence.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(todayDateString + 'T00:00:00.000Z'),
          lt: new Date(todayDateString + 'T23:59:59.999Z')
        }
      }
    })

    if (!existingAbsence) {
      // Create new absence record for check-in
      const checkInTime = new Date()
      const checkInUTC7 = new Date(checkInTime.getTime() + 7 * 60 * 60 * 1000)
      
      const newAbsence = await prisma.absence.create({
        data: {
          userId,
          shiftId,
          date: checkInUTC7,
          checkIn: checkInUTC7,
          status: 'Hadir',
          location: 'Kantor Pusat',
          note: 'Datang tepat waktu'
        }
      })

      revalidatePath('/dashboard')
      revalidatePath('/admin/dashboard/absensi')
      
      return { 
        success: true, 
        action: 'checkin',
        data: newAbsence,
        message: 'Absen masuk berhasil!' 
      }
    } else if (existingAbsence.checkIn && !existingAbsence.checkOut) {
      // Update existing record for check-out
      const now = new Date()
      const nowWIB = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
      
      const updatedAbsence = await prisma.absence.update({
        where: { id: existingAbsence.id },
        data: {
          checkOut: nowWIB,
          status: 'Pulang',
          note: 'Pulang sesuai jadwal'
        }
      })

      revalidatePath('/dashboard')
      revalidatePath('/admin/dashboard/absensi')
      
      return { 
        success: true, 
        action: 'checkout',
        data: updatedAbsence,
        message: 'Absen pulang berhasil!' 
      }
    } else {
      // Already completed both check-in and check-out
      return { 
        success: false, 
        error: 'Anda sudah selesai absen hari ini' 
      }
    }
  } catch (err) {
    console.error('Error toggling absence:', err)
    return { error: 'Gagal melakukan absensi' }
  }
}