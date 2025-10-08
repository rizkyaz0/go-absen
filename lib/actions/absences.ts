'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import jwt from 'jsonwebtoken'
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

async function verifyToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) throw new Error('Unauthorized')

  const payload = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number }
  return payload
}

export const getAllAbsences = cache(async () => {
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
})

// Cached version with longer TTL for admin dashboard
export const getCachedAllAbsences = unstable_cache(
  async () => {
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
  },
  ['all-absences'],
  { 
    tags: ['absences'],
    revalidate: 60 // 1 minute
  }
)

export const getAbsencesByUser = cache(async (userId: number) => {
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
})

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

    const timeZone = 'Asia/Jakarta'
    
    // Convert input dates to proper timezone handling
    const dateUTC = fromZonedTime(new Date(absenceData.date), timeZone)
    const checkInUTC = absenceData.checkIn ? fromZonedTime(new Date(absenceData.checkIn), timeZone) : null
    const checkOutUTC = absenceData.checkOut ? fromZonedTime(new Date(absenceData.checkOut), timeZone) : null

    const absence = await prisma.absence.create({
      data: {
        userId: absenceData.userId,
        shiftId: absenceData.shiftId || null,
        date: dateUTC,
        checkIn: checkInUTC,
        checkOut: checkOutUTC,
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

    const timeZone = 'Asia/Jakarta'
    
    // Convert input dates to proper timezone handling
    const checkInUTC = absenceData.checkIn ? fromZonedTime(new Date(absenceData.checkIn), timeZone) : undefined
    const checkOutUTC = absenceData.checkOut ? fromZonedTime(new Date(absenceData.checkOut), timeZone) : undefined

    const updated = await prisma.absence.update({
      where: { id },
      data: {
        checkIn: checkInUTC,
        checkOut: checkOutUTC,
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
    
    const timeZone = 'Asia/Jakarta'
    const now = new Date()
    
    // Get current time in Asia/Jakarta timezone
    const localTime = toZonedTime(now, timeZone)
    const todayDateString = format(localTime, 'yyyy-MM-dd', { timeZone })
    
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
      // Convert local time to UTC for database storage
      const checkInUTC = fromZonedTime(localTime, timeZone)
      
      const newAbsence = await prisma.absence.create({
        data: {
          userId,
          shiftId,
          date: checkInUTC,
          checkIn: checkInUTC,
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
      // Check if it's before 17:00 local time
      const currentHour = localTime.getHours()
      if (currentHour < 17) {
        return { 
          success: false, 
          error: 'Belum waktu pulang. Silakan tunggu hingga jam 17:00.' 
        }
      }
      
      // Update existing record for check-out
      // Convert local time to UTC for database storage
      const checkOutUTC = fromZonedTime(localTime, timeZone)
      
      const updatedAbsence = await prisma.absence.update({
        where: { id: existingAbsence.id },
        data: {
          checkOut: checkOutUTC,
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