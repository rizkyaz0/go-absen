import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      include: {
        role: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's attendance record
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.absence.findFirst({
      where: {
        userId: userIdInt,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Determine current status
    let status = 'not_checked_in';
    let canCheckIn = true;
    let canCheckOut = false;
    let isLate = false;
    let workDuration = null;

    if (attendance) {
      if (attendance.checkIn && !attendance.checkOut) {
        status = 'checked_in';
        canCheckIn = false;
        canCheckOut = true;
        
        // Check if late
        const checkInTime = new Date(attendance.checkIn);
        const nineAM = new Date(checkInTime);
        nineAM.setHours(9, 0, 0, 0);
        isLate = checkInTime > nineAM;
        
        // Calculate current work duration
        const now = new Date();
        const duration = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 100)) / 100;
        workDuration = `${duration.toFixed(1)} hours`;
      } else if (attendance.checkIn && attendance.checkOut) {
        status = 'checked_out';
        canCheckIn = false;
        canCheckOut = false;
        
        // Calculate total work duration
        const checkInTime = new Date(attendance.checkIn);
        const checkOutTime = new Date(attendance.checkOut);
        const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 100)) / 100;
        workDuration = `${duration.toFixed(1)} hours`;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
        status: user.status?.name
      },
      attendance,
      status,
      canCheckIn,
      canCheckOut,
      isLate,
      workDuration,
      today: today.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error getting attendance status:', error);
    return NextResponse.json({ error: 'Failed to get attendance status' }, { status: 500 });
  }
}