// file: /app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      roleId: true,
      statusId: true,
    },
  });
  if (!user)
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 }
    );
  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const data = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        roleId: data.roleId,
        statusId: data.statusId,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params sebagai Promise
) {
  try {
    const { id } = await params; // Await params terlebih dahulu
    const userId = Number(id);

    // Validasi ID
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.absence.deleteMany({ where: { userId } });
    await prisma.leaveRequest.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
