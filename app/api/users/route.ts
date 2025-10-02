import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { 
        role: true, 
        status: true 
      },
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
        // Exclude password from response
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.roleId || !data.statusId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // TODO: Hash password in production
        roleId: parseInt(data.roleId),
        statusId: parseInt(data.statusId),
      },
      include: {
        role: true,
        status: true
      }
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
