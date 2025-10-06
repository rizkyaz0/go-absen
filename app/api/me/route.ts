// /app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
export const runtime = "nodejs"; // supaya jsonwebtoken bisa jalan

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }

    // verify token
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      roleId: number;
    };

    // ambil data user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        roleId: true,
        statusId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      shiftId: 1, // default shiftId
    });
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.json({ error: "Terjadi error" }, { status: 500 });
  }
}
