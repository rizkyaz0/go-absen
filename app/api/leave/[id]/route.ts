import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid leave request ID' }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
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

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    return NextResponse.json(leave);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    return NextResponse.json({ error: 'Failed to fetch leave request' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid leave request ID' }, { status: 400 });
    }

    // Check if leave request exists
    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existingLeave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Only allow status updates for now
    const updateData: any = {};
    if (data.status && ['Pending', 'Approved', 'Rejected'].includes(data.status)) {
      updateData.status = data.status;
    }
    if (data.approvedBy) {
      updateData.approvedBy = parseInt(data.approvedBy);
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
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
        }
      }
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid leave request ID' }, { status: 400 });
    }

    // Check if leave request exists
    const existingLeave = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existingLeave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Only allow deletion if status is Pending
    if (existingLeave.status !== 'Pending') {
      return NextResponse.json({ error: 'Cannot delete approved or rejected leave requests' }, { status: 400 });
    }

    await prisma.leaveRequest.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
  }
}