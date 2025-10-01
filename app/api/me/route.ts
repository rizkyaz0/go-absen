// /app/api/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/userId=(\d+)/);
    if (!match)
      return NextResponse.json({ error: "Belum login" }, { status: 401 });

    const userId = parseInt(match[1]);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({
      id: user.id,
      name: user.name,
      roleId: user.roleId,
      statusId: user.statusId,
      shiftId: 1, // default shiftId, bisa diubah sesuai kebutuhan
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi error" }, { status: 500 });
  }
}
