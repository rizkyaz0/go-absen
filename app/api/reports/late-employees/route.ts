import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get all late arrivals in the date range
    const lateArrivals = await prisma.absence.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        },
        checkIn: {
          not: null
        }
      },
      include: {
        user: {
          include: {
            role: true
          }
        }
      }
    });

    // Filter for actual late arrivals (after 9:00 AM)
    const actualLateArrivals = lateArrivals.filter(absence => {
      if (!absence.checkIn) return false;
      const checkInTime = new Date(absence.checkIn);
      const nineAM = new Date(checkInTime);
      nineAM.setHours(9, 0, 0, 0);
      return checkInTime > nineAM;
    });

    // Group by user and count late arrivals
    const userLateCount: { [key: number]: { user: any, count: number } } = {};
    
    actualLateArrivals.forEach(absence => {
      const userId = absence.userId;
      if (!userLateCount[userId]) {
        userLateCount[userId] = {
          user: absence.user,
          count: 0
        };
      }
      userLateCount[userId].count++;
    });

    // Convert to array and sort by count (descending)
    const lateEmployees = Object.values(userLateCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        id: item.user.id,
        nama: item.user.name,
        jabatan: item.user.role?.name || 'Employee',
        totalTerlambat: item.count,
        bulan: `${start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} - ${end.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
      }));

    return NextResponse.json(lateEmployees);
  } catch (error) {
    console.error('Error generating late employees report:', error);
    return NextResponse.json({ error: 'Failed to generate late employees report' }, { status: 500 });
  }
}