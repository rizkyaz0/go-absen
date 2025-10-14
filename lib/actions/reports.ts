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

    // Use raw SQL for better performance and accurate calculations
    const summaryData = await prisma.$queryRaw<Array<{
      totalHariKerja: bigint;
      totalAbsences: bigint;
      totalHadir: bigint;
      totalTerlambat: bigint;
      izinDiterima: bigint;
      izinDitolak: bigint;
    }>>`
      SELECT 
        DATEDIFF(${end}, ${start}) + 1 as totalHariKerja,
        (SELECT COUNT(*) FROM Absence WHERE date >= ${start} AND date <= ${end}) as totalAbsences,
        (SELECT COUNT(*) FROM Absence WHERE date >= ${start} AND date <= ${end} AND status = 'Hadir') as totalHadir,
        (SELECT COUNT(*) FROM Absence WHERE date >= ${start} AND date <= ${end} AND status = 'Hadir' AND TIME(checkIn) > '08:00:00') as totalTerlambat,
        (SELECT COUNT(*) FROM LeaveRequest WHERE startDate >= ${start} AND startDate <= ${end} AND status = 'Approved') as izinDiterima,
        (SELECT COUNT(*) FROM LeaveRequest WHERE startDate >= ${start} AND startDate <= ${end} AND status = 'Rejected') as izinDitolak
    `

    const data = summaryData[0]
    const totalHariKerja = Number(data.totalHariKerja)
    const totalAbsences = Number(data.totalAbsences)
    const totalHadir = Number(data.totalHadir)
    const totalTerlambat = Number(data.totalTerlambat)
    const izinDiterima = Number(data.izinDiterima)
    const izinDitolak = Number(data.izinDitolak)

    // Calculate attendance percentage more accurately
    const rataRataKehadiran = totalAbsences > 0 ? (totalHadir / totalAbsences) * 100 : 0

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
    return { success: false, error: 'Failed to fetch summary' }
  }
}

export async function getDailyReport(startDate?: string, endDate?: string, limit: number = 7) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Use raw SQL for better performance
    const dailyData = await prisma.$queryRaw<Array<{
      tanggal: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }>>`
      SELECT 
        DATE(a.date) as tanggal,
        COALESCE(SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END), 0) as hadir,
        COALESCE(SUM(CASE WHEN a.status = 'Hadir' AND TIME(a.checkIn) > '08:00:00' THEN 1 ELSE 0 END), 0) as terlambat,
        COALESCE(SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END), 0) as absen,
        COALESCE(SUM(CASE WHEN lr.status = 'Approved' THEN 1 ELSE 0 END), 0) as izin
      FROM Absence a
      LEFT JOIN LeaveRequest lr ON DATE(lr.startDate) = DATE(a.date)
      WHERE a.date >= ${start} AND a.date <= ${end}
      GROUP BY DATE(a.date)
      ORDER BY a.date DESC
      LIMIT ${limit}
    `

    // Transform the data to match frontend expectations
    const transformedData = dailyData.map((item: {
      tanggal: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }) => ({
      tanggal: item.tanggal,
      hadir: Number(item.hadir),
      terlambat: Number(item.terlambat),
      absen: Number(item.absen),
      izin: Number(item.izin)
    }))

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error fetching daily data:', error)
    return { success: false, error: 'Failed to fetch daily data' }
  }
}

export async function getMonthlyReport(year: number) {
  try {
    await verifyToken()

    // Use raw SQL for better performance and proper month names
    const monthlyData = await prisma.$queryRaw<Array<{
      bulan: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }>>`
      SELECT 
        CASE 
          WHEN MONTH(a.date) = 1 THEN 'Januari'
          WHEN MONTH(a.date) = 2 THEN 'Februari'
          WHEN MONTH(a.date) = 3 THEN 'Maret'
          WHEN MONTH(a.date) = 4 THEN 'April'
          WHEN MONTH(a.date) = 5 THEN 'Mei'
          WHEN MONTH(a.date) = 6 THEN 'Juni'
          WHEN MONTH(a.date) = 7 THEN 'Juli'
          WHEN MONTH(a.date) = 8 THEN 'Agustus'
          WHEN MONTH(a.date) = 9 THEN 'September'
          WHEN MONTH(a.date) = 10 THEN 'Oktober'
          WHEN MONTH(a.date) = 11 THEN 'November'
          WHEN MONTH(a.date) = 12 THEN 'Desember'
        END as bulan,
        COALESCE(SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END), 0) as hadir,
        COALESCE(SUM(CASE WHEN a.status = 'Hadir' AND TIME(a.checkIn) > '08:00:00' THEN 1 ELSE 0 END), 0) as terlambat,
        COALESCE(SUM(CASE WHEN a.status = 'Alpha' THEN 1 ELSE 0 END), 0) as absen,
        COALESCE(SUM(CASE WHEN lr.status = 'Approved' THEN 1 ELSE 0 END), 0) as izin
      FROM (
        SELECT 1 as month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
        UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      ) m
      LEFT JOIN Absence a ON MONTH(a.date) = m.month_num AND YEAR(a.date) = ${year}
      LEFT JOIN LeaveRequest lr ON MONTH(lr.startDate) = m.month_num AND YEAR(lr.startDate) = ${year}
      GROUP BY m.month_num
      ORDER BY m.month_num
    `

    // Transform the data to match frontend expectations
    const transformedData = monthlyData.map((item: {
      bulan: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }) => ({
      bulan: item.bulan,
      hadir: Number(item.hadir),
      terlambat: Number(item.terlambat),
      absen: Number(item.absen),
      izin: Number(item.izin)
    }))

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error fetching monthly data:', error)
    return { success: false, error: 'Failed to fetch monthly data' }
  }
}

export async function getLateEmployeesReport(startDate?: string, endDate?: string, limit: number = 10) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Get late employees with aggregated count using raw SQL for better performance
    const lateEmployees = await prisma.$queryRaw<Array<{
      id: number;
      nama: string;
      email: string;
      totalTerlambat: bigint;
      bulan: string;
    }>>`
      SELECT 
        u.id,
        u.name as nama,
        u.email,
        COUNT(a.id) as totalTerlambat,
        DATE_FORMAT(a.date, '%Y-%m') as bulan
      FROM User u
      INNER JOIN Absence a ON u.id = a.userId
      WHERE a.date >= ${start}
        AND a.date <= ${end}
        AND a.status = 'Hadir'
        AND TIME(a.checkIn) > '08:00:00'
      GROUP BY u.id, u.name, u.email, DATE_FORMAT(a.date, '%Y-%m')
      ORDER BY totalTerlambat DESC
      LIMIT ${limit}
    `

    // Transform the data to match frontend expectations
    const transformedData = lateEmployees.map((emp: {
      id: number;
      nama: string;
      email: string;
      totalTerlambat: bigint;
      bulan: string;
    }) => ({
      id: emp.id,
      nama: emp.nama,
      jabatan: 'Karyawan', // Default value since we don't have job title in schema
      totalTerlambat: Number(emp.totalTerlambat),
      bulan: emp.bulan
    }))

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error fetching late employees:', error)
    return { success: false, error: 'Failed to fetch late employees' }
  }
}

// New comprehensive report function for better performance
export async function getComprehensiveReport(startDate?: string, endDate?: string) {
  try {
    await verifyToken()

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // Get all data in parallel for better performance
    const [summaryResult, monthlyResult, lateEmployeesResult, dailyResult] = await Promise.all([
      getSummaryReport(startDate, endDate),
      getMonthlyReport(start.getFullYear()),
      getLateEmployeesReport(startDate, endDate, 10),
      getDailyReport(startDate, endDate, 7)
    ])

    return {
      success: true,
      data: {
        summary: summaryResult.success ? summaryResult.data : null,
        monthly: monthlyResult.success ? monthlyResult.data : [],
        lateEmployees: lateEmployeesResult.success ? lateEmployeesResult.data : [],
        daily: dailyResult.success ? dailyResult.data : []
      }
    }
  } catch (error) {
    console.error('Error fetching comprehensive report:', error)
    return { success: false, error: 'Failed to fetch comprehensive report' }
  }
}