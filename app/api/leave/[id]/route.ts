// app/api/leave/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // id izin
  const data = await req.json();
  const status = data.status; // harus "Approved" atau "Rejected"

  if (!["Approved", "Rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Status harus 'Approved' atau 'Rejected'" },
      { status: 400 }
    );
  }

  try {
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: Number(id) },
      data: { status },
    });
    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengupdate status izin" },
      { status: 500 }
    );
  }
}
