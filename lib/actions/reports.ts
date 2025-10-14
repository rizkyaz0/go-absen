'use server'

// Reports don't need caching as they are complex queries
import { prisma } from '@/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { toZonedTime } from 'date-fns-tz'

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

    // Normalize input range to local date strings (Asia/Jakarta) and compare using local date in SQL
    const timeZone = 'Asia/Jakarta'
    const now = new Date()
    const nowLocal = toZonedTime(now, timeZone)
    const startYmd = startDate
      ? startDate
      : `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-01`
    const endLocal = endDate
      ? endDate
      : `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`

    // Use raw SQL with local-date comparisons and timezone-adjusted times
    const summaryData = await prisma.$queryRaw<Array<{
      totalHari: bigint;
      totalHadir: bigint;
      totalTerlambat: bigint;
      totalAbsen: bigint;
      izinDiterima: bigint;
      izinDitolak: bigint;
    }>>`
      SELECT 
        (DATEDIFF(${endLocal}, ${startYmd}) + 1) as totalHari,
        (
          SELECT COUNT(*) 
          FROM Absence a
          WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endLocal}
            AND a.checkIn IS NOT NULL
        ) as totalHadir,
        (
          SELECT COUNT(*) 
          FROM Absence a
          WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endLocal}
            AND a.checkIn IS NOT NULL
            AND TIME(DATE_ADD(a.checkIn, INTERVAL 7 HOUR)) > '08:00:00'
        ) as totalTerlambat,
        (
          SELECT COUNT(*) 
          FROM Absence a
          WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endLocal}
            AND a.status IN ('Absen', 'Alpha')
        ) as totalAbsen,
        (
          SELECT COUNT(*) 
          FROM LeaveRequest l
          WHERE l.status = 'Approved'
            AND DATE(DATE_ADD(l.startDate, INTERVAL 7 HOUR)) <= ${endLocal}
            AND DATE(DATE_ADD(l.endDate, INTERVAL 7 HOUR)) >= ${startYmd}
        ) as izinDiterima,
        (
          SELECT COUNT(*) 
          FROM LeaveRequest l
          WHERE l.status = 'Rejected'
            AND DATE(DATE_ADD(l.startDate, INTERVAL 7 HOUR)) <= ${endLocal}
            AND DATE(DATE_ADD(l.endDate, INTERVAL 7 HOUR)) >= ${startYmd}
        ) as izinDitolak
    `

    const data = summaryData[0]
    const totalHariKerja = Number(data.totalHari)
    const totalHadir = Number(data.totalHadir)
    const totalTerlambat = Number(data.totalTerlambat)
    const totalAbsen = Number(data.totalAbsen)
    const izinDiterima = Number(data.izinDiterima)
    const izinDitolak = Number(data.izinDitolak)

    // Attendance rate based on hadir vs (hadir + absen) to match monthly table logic
    const totalPossible = totalHadir + totalAbsen
    const rataRataKehadiran = totalPossible > 0 ? (totalHadir / totalPossible) * 100 : 0

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

    // Normalize to local date strings
    const timeZone = 'Asia/Jakarta'
    const now = new Date()
    const nowLocal = toZonedTime(now, timeZone)
    const defaultStartYmd = (() => {
      const d = new Date(nowLocal)
      d.setDate(d.getDate() - 6) // last 7 days inclusive
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    const startYmd = startDate || defaultStartYmd
    const endYmd = endDate || `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`

    // Use raw SQL with timezone-adjusted grouping and comparisons; treat 'Izin' and 'Sakit' as leave days
    const dailyData = await prisma.$queryRaw<Array<{
      tanggal: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }>>`
      SELECT 
        DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) as tanggal,
        COALESCE(SUM(CASE WHEN a.checkIn IS NOT NULL THEN 1 ELSE 0 END), 0) as hadir,
        COALESCE(SUM(CASE WHEN a.checkIn IS NOT NULL AND TIME(DATE_ADD(a.checkIn, INTERVAL 7 HOUR)) > '08:00:00' THEN 1 ELSE 0 END), 0) as terlambat,
        COALESCE(SUM(CASE WHEN a.status IN ('Absen', 'Alpha') THEN 1 ELSE 0 END), 0) as absen,
        COALESCE(SUM(CASE WHEN a.status IN ('Izin', 'Sakit') THEN 1 ELSE 0 END), 0) as izin
      FROM Absence a
      WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endYmd}
      GROUP BY DATE(DATE_ADD(a.date, INTERVAL 7 HOUR))
      ORDER BY tanggal DESC
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

    // Use raw SQL with timezone-adjusted month extraction and presence/late logic
    const monthlyData = await prisma.$queryRaw<Array<{
      bulan: string;
      hadir: bigint;
      terlambat: bigint;
      absen: bigint;
      izin: bigint;
    }>>`
      SELECT 
        CASE 
          WHEN m.month_num = 1 THEN 'Januari'
          WHEN m.month_num = 2 THEN 'Februari'
          WHEN m.month_num = 3 THEN 'Maret'
          WHEN m.month_num = 4 THEN 'April'
          WHEN m.month_num = 5 THEN 'Mei'
          WHEN m.month_num = 6 THEN 'Juni'
          WHEN m.month_num = 7 THEN 'Juli'
          WHEN m.month_num = 8 THEN 'Agustus'
          WHEN m.month_num = 9 THEN 'September'
          WHEN m.month_num = 10 THEN 'Oktober'
          WHEN m.month_num = 11 THEN 'November'
          WHEN m.month_num = 12 THEN 'Desember'
        END as bulan,
        COALESCE(SUM(CASE WHEN a.checkIn IS NOT NULL THEN 1 ELSE 0 END), 0) as hadir,
        COALESCE(SUM(CASE WHEN a.checkIn IS NOT NULL AND TIME(DATE_ADD(a.checkIn, INTERVAL 7 HOUR)) > '08:00:00' THEN 1 ELSE 0 END), 0) as terlambat,
        COALESCE(SUM(CASE WHEN a.status IN ('Absen', 'Alpha') THEN 1 ELSE 0 END), 0) as absen,
        COALESCE(SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END), 0) as izin
      FROM (
        SELECT 1 as month_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
        UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      ) m
      LEFT JOIN Absence a ON MONTH(DATE_ADD(a.date, INTERVAL 7 HOUR)) = m.month_num AND YEAR(DATE_ADD(a.date, INTERVAL 7 HOUR)) = ${year}
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

    const timeZone = 'Asia/Jakarta'
    const now = new Date()
    const nowLocal = toZonedTime(now, timeZone)
    const defaultStartYmd = (() => {
      const d = new Date(nowLocal)
      d.setDate(d.getDate() - 30)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    const startYmd = startDate || defaultStartYmd
    const endYmd = endDate || `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`

    // Get late employees with aggregated count using timezone-adjusted logic
    const lateEmployees = await prisma.$queryRaw<Array<{
      id: number;
      nama: string;
      email: string;
      roleName: string;
      totalTerlambat: bigint;
      bulan: string;
    }>>`
      SELECT 
        u.id,
        u.name as nama,
        u.email,
        r.name as roleName,
        COUNT(a.id) as totalTerlambat,
        DATE_FORMAT(DATE_ADD(a.date, INTERVAL 7 HOUR), '%Y-%m') as bulan
      FROM User u
      INNER JOIN Absence a ON u.id = a.userId
      INNER JOIN Role r ON u.roleId = r.id
      WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endYmd}
        AND a.checkIn IS NOT NULL
        AND TIME(DATE_ADD(a.checkIn, INTERVAL 7 HOUR)) > '08:00:00'
      GROUP BY u.id, u.name, u.email, r.name, DATE_FORMAT(DATE_ADD(a.date, INTERVAL 7 HOUR), '%Y-%m')
      ORDER BY totalTerlambat DESC
      LIMIT ${limit}
    `

    // Transform the data to match frontend expectations
    const transformedData = lateEmployees.map((emp: {
      id: number;
      nama: string;
      email: string;
      roleName: string;
      totalTerlambat: bigint;
      bulan: string;
    }) => ({
      id: emp.id,
      nama: emp.nama,
      jabatan: emp.roleName,
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
    console.log('Comprehensive report params:', { startDate, endDate, start: start.getFullYear() })

    // Get all data in parallel for better performance
    const [summaryResult, monthlyResult, lateEmployeesResult, dailyResult] = await Promise.all([
      getSummaryReport(startDate, endDate),
      getMonthlyReport(start.getFullYear()),
      getLateEmployeesReport(startDate, endDate, 10),
      getDailyReport(startDate, endDate, 7)
    ])

    console.log('Comprehensive report results:', {
      summary: summaryResult.success ? 'success' : summaryResult.error,
      monthly: monthlyResult.success ? 'success' : monthlyResult.error,
      lateEmployees: lateEmployeesResult.success ? 'success' : lateEmployeesResult.error,
      daily: dailyResult.success ? 'success' : dailyResult.error
    })

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