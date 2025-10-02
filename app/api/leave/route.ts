import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    const whereClause: any = {};
    if (userId) whereClause.userId = parseInt(userId);
    if (status) whereClause.status = status;

    const leaves = await prisma.leaveRequest.findMany({
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
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId || !data.startDate || !data.endDate || !data.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(data.userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate > endDate) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId: parseInt(data.userId),
        status: { in: ['Pending', 'Approved'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        ]
      }
    });

    if (overlappingLeave) {
      return NextResponse.json({ error: 'Overlapping leave request exists' }, { status: 409 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: parseInt(data.userId),
        startDate: startDate,
        endDate: endDate,
        type: data.type,
        status: "Pending",
        reason: data.reason || "",
        approvedBy: data.approvedBy ? parseInt(data.approvedBy) : null,
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
        }
      }
    });
    
    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}
