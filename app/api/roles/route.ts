import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name: data.name
      }
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}