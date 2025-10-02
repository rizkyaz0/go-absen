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

    // Check if user already checked in today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.absence.findFirst({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        error: 'You have already checked in today',
        attendance: existingAttendance 
      }, { status: 409 });
    }

    // Create new attendance record
    const now = new Date();
    const attendance = await prisma.absence.create({
      data: {
        userId: userId,
        date: today,
        checkIn: now,
        status: 'Hadir',
        location: data.location || 'Main Office',
        note: data.note || null,
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

    // Determine if late
    const nineAM = new Date(now);
    nineAM.setHours(9, 0, 0, 0);
    const isLate = now > nineAM;

    return NextResponse.json({
      message: isLate ? 'Checked in successfully (Late)' : 'Checked in successfully',
      attendance,
      isLate
    }, { status: 201 });
  } catch (error) {
    console.error('Error checking in:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}