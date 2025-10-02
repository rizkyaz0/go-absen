import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '7');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dailyData = [];
    const currentDate = new Date(start);

    // Get total active employees
    const totalEmployees = await prisma.user.count({
      where: {
        status: {
          name: 'Active'
        }
      }
    });

    let dayCount = 0;
    while (currentDate <= end && dayCount < limit) {
      // Skip weekends
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Get attendance data for this day
      const attendanceData = await prisma.absence.findMany({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
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

      const absen = Math.max(0, totalEmployees - hadir);

      // Get approved leave requests for this day
      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          status: 'Approved',
          startDate: { lte: dayEnd },
          endDate: { gte: dayStart }
        }
      });

      const izin = leaveRequests.length;

      dailyData.push({
        tanggal: currentDate.toISOString().split('T')[0],
        hadir,
        terlambat,
        absen,
        izin
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }

    // Sort by date descending (most recent first)
    dailyData.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json({ error: 'Failed to generate daily report' }, { status: 500 });
  }
}