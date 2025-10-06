import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwtVerify(token, JWT_SECRET) as unknown as {
      userId: number;
      roleId: number;
    };

    // Contoh: ambil semua user tanpa kirim password/email
    const users = await prisma.user.findMany({
      select: { id: true, name: true, roleId: true, statusId: true },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = (await jwtVerify(token, JWT_SECRET)) as any;

    // Hanya admin (roleId = 3) yang bisa membuat user
    if (payload.roleId !== 3) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, roleId, statusId } = await req.json();

    if (!name || !email || !password || !roleId || !statusId) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // nanti bisa pakai bcrypt hash
        roleId,
        statusId,
      },
      select: { id: true, name: true, roleId: true, statusId: true }, // jangan kirim password
    });

    return NextResponse.json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Terjadi error" }, { status: 500 });
  }
}
