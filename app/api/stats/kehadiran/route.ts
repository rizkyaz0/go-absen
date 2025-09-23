import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const kehadiran = await prisma.absence.count({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        status: "Hadir",
      },
    });

    return NextResponse.json({ value: kehadiran });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ value: 0 });
  }
}
