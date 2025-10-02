import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const statuses = await prisma.status.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Status name is required' }, { status: 400 });
    }

    // Check if status already exists
    const existingStatus = await prisma.status.findUnique({
      where: { name: data.name }
    });

    if (existingStatus) {
      return NextResponse.json({ error: 'Status already exists' }, { status: 409 });
    }

    const status = await prisma.status.create({
      data: {
        name: data.name
      }
    });

    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 });
  }
}