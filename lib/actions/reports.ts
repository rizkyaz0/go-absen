'use server'

// Reports don't need caching as they are complex queries
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

export async function getSummaryReport(startDate?: string, endDate?: string) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    // Total hari kerja dalam periode
    const totalHariKerja = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Rata-rata kehadiran
    const totalAbsences = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        }
      }
    })

    const totalHadir = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        },
        status: 'Hadir'
      }
    })

    const rataRataKehadiran = totalAbsences > 0 ? (totalHadir / totalAbsences) * 100 : 0

    // Total terlambat (asumsi terlambat jika checkIn > jam 8:00)
    const totalTerlambat = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        },
        checkIn: {
          gte: new Date(start.getTime() + 8 * 60 * 60 * 1000) // 8 jam setelah start date
        },
        status: 'Hadir'
      }
    })

    // Izin diterima
    const izinDiterima = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: start,
          lte: end
        },
        status: 'Approved'
      }
    })

    // Izin ditolak
    const izinDitolak = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: start,
          lte: end
        },
        status: 'Rejected'
      }
    })

    return {
      success: true,
      data: {
        totalHariKerja,
        rataRataKehadiran: Math.round(rataRataKehadiran * 100) / 100,
        totalTerlambat,
        izinDiterima,
        izinDitolak
      }
    }
  } catch (error) {
    console.error('Error fetching summary:', error)
    return { error: 'Failed to fetch summary' }
  }
}

export async function getDailyReport(startDate?: string, endDate?: string, limit: number = 7) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const dailyData = []
    const currentDate = new Date(start)
    
    while (currentDate <= end && dailyData.length < limit) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const hadir = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'Hadir'
        }
      })

      const terlambat = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          checkIn: {
            gte: new Date(dayStart.getTime() + 8 * 60 * 60 * 1000)
          },
          status: 'Hadir'
        }
      })

      const absen = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'Alpha'
        }
      })

      const izin = await prisma.leaveRequest.count({
        where: {
          startDate: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'Approved'
        }
      })

      dailyData.push({
        tanggal: dayStart.toISOString().split('T')[0],
        hadir,
        terlambat,
        absen,
        izin
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { success: true, data: dailyData }
  } catch (error) {
    console.error('Error fetching daily data:', error)
    return { error: 'Failed to fetch daily data' }
  }
}

export async function getMonthlyReport(year: number) {
  try {
    await verifyToken()

    const monthlyData = []
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const hadir = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          status: 'Hadir'
        }
      })

      const terlambat = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          checkIn: {
            gte: new Date(startDate.getTime() + 8 * 60 * 60 * 1000)
          },
          status: 'Hadir'
        }
      })

      const absen = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          status: 'Alpha'
        }
      })

      const izin = await prisma.leaveRequest.count({
        where: {
          startDate: {
            gte: startDate,
            lte: endDate
          },
          status: 'Approved'
        }
      })

      monthlyData.push({
        bulan: month.toString(),
        hadir,
        terlambat,
        absen,
        izin
      })
    }

    return { success: true, data: monthlyData }
  } catch (error) {
    console.error('Error fetching monthly data:', error)
    return { error: 'Failed to fetch monthly data' }
  }
}

export async function getLateEmployeesReport(startDate?: string, endDate?: string, limit: number = 10) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const lateEmployees = await prisma.absence.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        },
        checkIn: {
          gte: new Date(start.getTime() + 8 * 60 * 60 * 1000) // 8 jam setelah start date
        },
        status: 'Hadir'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        checkIn: 'desc'
      },
      take: limit
    })

    return { success: true, data: lateEmployees }
  } catch (error) {
    console.error('Error fetching late employees:', error)
    return { error: 'Failed to fetch late employees' }
  }
}