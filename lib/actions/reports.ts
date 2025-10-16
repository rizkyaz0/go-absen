/* eslint-disable @typescript-eslint/no-unused-vars */
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

    // Use raw SQL with local-date comparisons and timezone-adjusted times for event counts
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
    // Compute working days (Mon–Fri) minus holidays set by admin
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: new Date(startYmd + 'T00:00:00.000Z'),
          lte: new Date(endLocal + 'T23:59:59.999Z'),
        },
      },
      select: { date: true, isHalfDay: true },
    })

    // Build a map of YYYY-MM-DD -> deduction (1 for full-day, 0.5 for half-day)
    const holidayDeductionByYmd = new Map<string, number>()
    for (const h of holidays) {
      const ymd = new Date(h.date).toISOString().slice(0, 10)
      holidayDeductionByYmd.set(ymd, Math.max(holidayDeductionByYmd.get(ymd) ?? 0, h.isHalfDay ? 0.5 : 1))
    }

    // Iterate date range in local timezone to count working days
    const start = new Date(startYmd + 'T00:00:00.000Z')
    const end = new Date(endLocal + 'T00:00:00.000Z')
    let workingDays = 0
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const local = toZonedTime(new Date(d), timeZone)
      const day = local.getDay() // 0 Sun ... 6 Sat
      if (day === 0 || day === 6) continue // weekend
      let add = 1
      const ymd = local.toISOString().slice(0, 10)
      if (holidayDeductionByYmd.has(ymd)) {
        add -= holidayDeductionByYmd.get(ymd) as number
      }
      if (add > 0) workingDays += add
    }

    const totalHariKerja = workingDays

    // Count total employees (active only)
    const totalKaryawan = await prisma.user.count({ where: { statusId: 1 } })

    // Count unique present employees per working day (Mon–Fri, excluding full-day holidays)
    const presentAgg = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COALESCE(SUM(t.cnt), 0) AS total
      FROM (
        SELECT DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) AS ymd,
               COUNT(DISTINCT a.userId) AS cnt
        FROM Absence a
        WHERE DATE(DATE_ADD(a.date, INTERVAL 7 HOUR)) BETWEEN ${startYmd} AND ${endLocal}
          AND a.checkIn IS NOT NULL
          AND DAYOFWEEK(DATE_ADD(a.date, INTERVAL 7 HOUR)) NOT IN (1, 7) -- exclude Sunday(1) & Saturday(7)
          AND NOT EXISTS (
            SELECT 1 FROM Holiday h
            WHERE DATE(h.date) = DATE(DATE_ADD(a.date, INTERVAL 7 HOUR))
              AND h.isHalfDay = FALSE
          )
        GROUP BY DATE(DATE_ADD(a.date, INTERVAL 7 HOUR))
      ) t
    `
    const totalHadir = Number(presentAgg[0]?.total || 0)

    const totalTerlambat = Number(data.totalTerlambat)
    const totalAbsen = Number(data.totalAbsen)
    const izinDiterima = Number(data.izinDiterima)
    const izinDitolak = Number(data.izinDitolak)

    // Attendance rate based on unique present vs (workingDays * total employees)
    const totalPossible = totalHariKerja * totalKaryawan
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

    const timeZone = 'Asia/Jakarta'
    const now = new Date()
    const nowLocal = toZonedTime(now, timeZone)
    const defaultStartYmd = (() => {
      const d = new Date(nowLocal)
      d.setDate(d.getDate() - 6)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    const startYmd = startDate || defaultStartYmd
    const endYmd = endDate || `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`

    const start = new Date(startYmd + 'T00:00:00.000Z')
    const end = new Date(endYmd + 'T00:00:00.000Z')

    const [absences, holidays, totalEmployees, approvedLeaves] = await Promise.all([
      prisma.absence.findMany({
        where: {
          date: { gte: start, lte: new Date(end.getTime() + 24 * 3600 * 1000 - 1) },
        },
        select: { userId: true, date: true, checkIn: true },
      }),
      prisma.holiday.findMany({
        where: { date: { gte: start, lte: end } },
        select: { date: true, isHalfDay: true },
      }),
      prisma.user.count({ where: { statusId: 1 } }),
      prisma.leaveRequest.findMany({
        where: {
          status: 'Approved',
          OR: [
            { startDate: { gte: start, lte: end } },
            { endDate: { gte: start, lte: end } },
          ],
        },
        select: { startDate: true, endDate: true },
      }),
    ])

    const holidayFullSet = new Set<string>(
      holidays.filter(h => !h.isHalfDay).map(h => new Date(h.date).toISOString().slice(0, 10))
    )

    const result: Array<{ tanggal: string; hadir: number; terlambat: number; absen: number; izin: number }> = []
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const local = toZonedTime(new Date(d), timeZone)
      const ymd = local.toISOString().slice(0, 10)
      const dow = local.getDay()
      // Skip weekends and full-day holidays
      if (dow === 0 || dow === 6 || holidayFullSet.has(ymd)) continue

      const dayAbsences = absences.filter(a => new Date(a.date).toISOString().slice(0, 10) === ymd)
      const presentSet = new Set<number>()
      let lateCount = 0
      dayAbsences.forEach(a => {
        if (a.checkIn) {
          presentSet.add(a.userId)
          const cin = toZonedTime(new Date(a.checkIn), timeZone)
          if (cin.getHours() > 8 || (cin.getHours() === 8 && cin.getMinutes() > 15)) lateCount += 1
        }
      })

      // Count approved leave overlapping this day
      let dayLeave = 0
      approvedLeaves.forEach(l => {
        const s = new Date(l.startDate)
        const e = new Date(l.endDate)
        const y = new Date(ymd + 'T00:00:00.000Z')
        if (y >= new Date(s.toISOString().slice(0,10) + 'T00:00:00.000Z') && y <= new Date(e.toISOString().slice(0,10) + 'T00:00:00.000Z')) {
          dayLeave += 1
        }
      })

      const hadir = presentSet.size
      const absen = Math.max(totalEmployees - hadir, 0)
      result.push({ tanggal: ymd, hadir, terlambat: lateCount, absen, izin: dayLeave })
      if (result.length >= limit) {
        // keep most recent days; continue loop to maintain correct order if needed
      }
    }

    // Sort desc by tanggal and limit
    const sorted = result.sort((a,b) => (a.tanggal < b.tanggal ? 1 : -1)).slice(0, limit)
    return { success: true, data: sorted }
  } catch (error) {
    console.error('Error fetching daily data:', error)
    return { success: false, error: 'Failed to fetch daily data' }
  }
}

export async function getMonthlyReport(year: number) {
  try {
    await verifyToken()
    const timeZone = 'Asia/Jakarta'
    const totalEmployees = await prisma.user.count({ where: { statusId: 1 } })

    const startYear = new Date(`${year}-01-01T00:00:00.000Z`)
    const endYear = new Date(`${year}-12-31T00:00:00.000Z`)

    const [absences, holidays, approvedLeaves] = await Promise.all([
      prisma.absence.findMany({
        where: { date: { gte: startYear, lte: endYear } },
        select: { userId: true, date: true, checkIn: true },
      }),
      prisma.holiday.findMany({
        where: { date: { gte: startYear, lte: endYear } },
        select: { date: true, isHalfDay: true },
      }),
      prisma.leaveRequest.findMany({
        where: { status: 'Approved', startDate: { lte: endYear }, endDate: { gte: startYear } },
        select: { startDate: true, endDate: true },
      }),
    ])

    const holidayFullSet = new Set<string>(
      holidays.filter(h => !h.isHalfDay).map(h => new Date(h.date).toISOString().slice(0, 10))
    )

    const months: Array<{
      bulan: string
      workingDays: number
      presentUnique: number
      absent: number
      late: number
      leaveDays: number
      attendancePct: number
    }> = []

    for (let m = 0; m < 12; m++) {
      const first = new Date(Date.UTC(year, m, 1))
      const last = new Date(Date.UTC(year, m + 1, 0))
      let workingDays = 0
      let presentUniqueSum = 0
      let lateSum = 0
      let leaveDays = 0

      for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
        const local = toZonedTime(new Date(d), timeZone)
        const ymd = local.toISOString().slice(0, 10)
        const dow = local.getDay()
        if (dow === 0 || dow === 6 || holidayFullSet.has(ymd)) continue
        workingDays += 1

        const dayAbsences = absences.filter(a => new Date(a.date).toISOString().slice(0, 10) === ymd)
        const presentSet = new Set<number>()
        dayAbsences.forEach(a => {
          if (a.checkIn) {
            presentSet.add(a.userId)
            const cin = toZonedTime(new Date(a.checkIn), timeZone)
            if (cin.getHours() > 8 || (cin.getHours() === 8 && cin.getMinutes() > 15)) lateSum += 1
          }
        })
        presentUniqueSum += presentSet.size

        // Leave days overlapping this day
        approvedLeaves.forEach(l => {
          const y = new Date(ymd + 'T00:00:00.000Z')
          const s = new Date(l.startDate)
          const e = new Date(l.endDate)
          if (y >= new Date(s.toISOString().slice(0,10) + 'T00:00:00.000Z') && y <= new Date(e.toISOString().slice(0,10) + 'T00:00:00.000Z')) {
            leaveDays += 1
          }
        })
      }

      const totalPossible = workingDays * totalEmployees
      const attendancePct = totalPossible > 0 ? (presentUniqueSum / totalPossible) * 100 : 0
      const absent = Math.max(totalPossible - presentUniqueSum, 0)
      const bulanNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
      months.push({
        bulan: bulanNames[m],
        workingDays,
        presentUnique: presentUniqueSum,
        absent,
        late: lateSum,
        leaveDays,
        attendancePct: Math.round(attendancePct * 100) / 100,
      })
    }

    return { success: true, data: months }
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