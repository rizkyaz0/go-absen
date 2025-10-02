import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Calculate total working days (excluding weekends)
    let totalWorkingDays = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        totalWorkingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get attendance data
    const attendanceData = await prisma.absence.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        user: true
      }
    });

    // Get total employees
    const totalEmployees = await prisma.user.count({
      where: {
        status: {
          name: 'Active'
        }
      }
    });

    // Calculate attendance statistics
    const totalPossibleAttendance = totalEmployees * totalWorkingDays;
    const actualAttendance = attendanceData.filter(a => a.checkIn !== null).length;
    const averageAttendance = totalPossibleAttendance > 0 
      ? Math.round((actualAttendance / totalPossibleAttendance) * 100) 
      : 0;

    // Count late arrivals (after 9:00 AM)
    const lateArrivals = attendanceData.filter(a => {
      if (!a.checkIn) return false;
      const checkInTime = new Date(a.checkIn);
      const nineAM = new Date(checkInTime);
      nineAM.setHours(9, 0, 0, 0);
      return checkInTime > nineAM;
    }).length;

    // Get leave request statistics
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        OR: [
          {
            startDate: { gte: start, lte: end }
          },
          {
            endDate: { gte: start, lte: end }
          },
          {
            startDate: { lte: start },
            endDate: { gte: end }
          }
        ]
      }
    });

    const approvedLeaves = leaveRequests.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaveRequests.filter(l => l.status === 'Rejected').length;

    const summary = {
      totalHariKerja: totalWorkingDays,
      rataRataKehadiran: averageAttendance,
      totalTerlambat: lateArrivals,
      izinDiterima: approvedLeaves,
      izinDitolak: rejectedLeaves
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating summary report:', error);
    return NextResponse.json({ error: 'Failed to generate summary report' }, { status: 500 });
  }
}