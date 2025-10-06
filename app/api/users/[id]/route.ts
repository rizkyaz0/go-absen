// file: /app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const { payload } = (await jwtVerify(token, JWT_SECRET)) as any;
  return payload as { userId: number; roleId: number };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyToken(req); // Semua user login bisa akses

    const userId = Number(params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, roleId: true, statusId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyToken(req);

    // Hanya admin
    if (payload.roleId !== 3) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = Number(params.id);
    const data = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        roleId: data.roleId,
        statusId: data.statusId,
      },
      select: { id: true, name: true, roleId: true, statusId: true }, // jangan kirim password/email
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyToken(req);

    // Hanya admin
    if (payload.roleId !== 3) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.absence.deleteMany({ where: { userId } });
    await prisma.leaveRequest.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
