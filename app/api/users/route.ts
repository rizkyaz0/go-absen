import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        statusId: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
        status: { select: { id: true, name: true } },
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data?.name || !data?.email || !data?.password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: data.roleId ?? 2,
        statusId: data.statusId ?? 1,
      },
      select: { id: true, name: true, email: true, roleId: true, statusId: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambah user" }, { status: 500 });
  }
}
