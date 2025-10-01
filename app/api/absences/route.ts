import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  const absences = await prisma.absence.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
          statusId: true,
          createdAt: true,
          updatedAt: true,
          // password tidak disertakan
        },
      },
      shift: true,
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(absences);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const absence = await prisma.absence.create({
    data: {
      userId: data.userId,
      shiftId: data.shiftId || null,
      date: new Date(data.date),
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      status: data.status,
      location: data.location || "",
      note: data.note || "",
    },
  });
  return NextResponse.json(absence);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const updated = await prisma.absence.update({
    where: { id: data.id },
    data: {
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      status: data.status,
      note: data.note,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.absence.delete({ where: { id } });
  return NextResponse.json({ message: "Absensi deleted" });
}
