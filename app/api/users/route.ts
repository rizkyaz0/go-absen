import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { role: true, status: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password, // nanti bisa pakai hashing bcrypt
      roleId: data.roleId,
      statusId: data.statusId,
    },
  });
  return NextResponse.json(user);
}
