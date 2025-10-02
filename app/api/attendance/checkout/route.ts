import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userId = parseInt(data.userId);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find today's attendance record
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.absence.findFirst({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (!attendance) {
      return NextResponse.json({ 
        error: 'No check-in record found for today. Please check in first.' 
      }, { status: 404 });
    }

    if (attendance.checkOut) {
      return NextResponse.json({ 
        error: 'You have already checked out today',
        attendance 
      }, { status: 409 });
    }

    // Update attendance record with check-out time
    const now = new Date();
    const updatedAttendance = await prisma.absence.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        note: data.note ? `${attendance.note || ''} | ${data.note}`.trim() : attendance.note,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          }
        }
      }
    });

    // Calculate work duration
    const checkInTime = new Date(attendance.checkIn!);
    const workDuration = Math.round((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 100)) / 100; // hours

    return NextResponse.json({
      message: 'Checked out successfully',
      attendance: updatedAttendance,
      workDuration: `${workDuration.toFixed(1)} hours`
    });
  } catch (error) {
    console.error('Error checking out:', error);
    return NextResponse.json({ error: 'Failed to check out' }, { status: 500 });
  }
}