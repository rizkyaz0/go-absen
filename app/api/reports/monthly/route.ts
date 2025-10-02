import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const monthlyData = [];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Get attendance data for the month
      const attendanceData = await prisma.absence.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Count different types of attendance
      const hadir = attendanceData.filter(a => a.checkIn !== null).length;
      const terlambat = attendanceData.filter(a => {
        if (!a.checkIn) return false;
        const checkInTime = new Date(a.checkIn);
        const nineAM = new Date(checkInTime);
        nineAM.setHours(9, 0, 0, 0);
        return checkInTime > nineAM;
      }).length;

      // Get total employees for the month
      const totalEmployees = await prisma.user.count({
        where: {
          status: {
            name: 'Active'
          },
          createdAt: {
            lte: endDate
          }
        }
      });

      // Calculate working days in the month
      let workingDays = 0;
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const totalPossibleAttendance = totalEmployees * workingDays;
      const absen = Math.max(0, totalPossibleAttendance - hadir);

      // Get leave requests for the month
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          status: 'Approved',
          OR: [
            {
              startDate: { gte: startDate, lte: endDate }
            },
            {
              endDate: { gte: startDate, lte: endDate }
            },
            {
              startDate: { lte: startDate },
              endDate: { gte: endDate }
            }
          ]
        }
      });

      const izin = leaveRequests.length;

      monthlyData.push({
        bulan: months[month],
        hadir,
        terlambat,
        absen,
        izin
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json({ error: 'Failed to generate monthly report' }, { status: 500 });
  }
}