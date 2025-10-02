import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const limit = searchParams.get('limit');

    const whereClause: any = {};
    if (userId) whereClause.userId = parseInt(userId);
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.date = {
        gte: targetDate,
        lt: nextDay
      };
    }

    const absences = await prisma.absence.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            statusId: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        shift: true,
      },
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json(absences);
  } catch (error) {
    console.error('Error fetching absences:', error);
    return NextResponse.json({ error: 'Failed to fetch absences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId || !data.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(data.userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if absence already exists for this date
    const existingAbsence = await prisma.absence.findFirst({
      where: {
        userId: parseInt(data.userId),
        date: {
          gte: new Date(data.date),
          lt: new Date(new Date(data.date).getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingAbsence) {
      return NextResponse.json({ error: 'Attendance record already exists for this date' }, { status: 409 });
    }

    const absence = await prisma.absence.create({
      data: {
        userId: parseInt(data.userId),
        shiftId: data.shiftId ? parseInt(data.shiftId) : null,
        date: new Date(data.date),
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        status: data.status || 'Hadir',
        location: data.location || "Main Office",
        note: data.note || "",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            statusId: true,
            role: true,
            status: true,
          }
        },
        shift: true
      }
    });
    
    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error('Error creating absence:', error);
    return NextResponse.json({ error: 'Failed to create absence record' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Absence ID required' }, { status: 400 });
    }

    // Check if absence exists
    const existingAbsence = await prisma.absence.findUnique({
      where: { id: parseInt(data.id) }
    });

    if (!existingAbsence) {
      return NextResponse.json({ error: 'Absence record not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (data.checkIn !== undefined) updateData.checkIn = data.checkIn ? new Date(data.checkIn) : null;
    if (data.checkOut !== undefined) updateData.checkOut = data.checkOut ? new Date(data.checkOut) : null;
    if (data.status) updateData.status = data.status;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.location !== undefined) updateData.location = data.location;

    const updated = await prisma.absence.update({
      where: { id: parseInt(data.id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roleId: true,
            statusId: true,
            role: true,
            status: true,
          }
        },
        shift: true
      }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating absence:', error);
    return NextResponse.json({ error: 'Failed to update absence record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");
    
    if (!id) {
      return NextResponse.json({ error: "Absence ID required" }, { status: 400 });
    }

    // Check if absence exists
    const existingAbsence = await prisma.absence.findUnique({
      where: { id }
    });

    if (!existingAbsence) {
      return NextResponse.json({ error: 'Absence record not found' }, { status: 404 });
    }

    await prisma.absence.delete({ where: { id } });
    return NextResponse.json({ message: "Absence record deleted successfully" });
  } catch (error) {
    console.error('Error deleting absence:', error);
    return NextResponse.json({ error: 'Failed to delete absence record' }, { status: 500 });
  }
}
