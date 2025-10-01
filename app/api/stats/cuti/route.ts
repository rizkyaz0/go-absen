import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { LeaveRequest } from "@prisma/client";

// Misal kuota cuti per tahun = 12 hari
const CUTI_KUOTA = 12;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");
    const userId = userIdParam ? parseInt(userIdParam) : null;

    if (!userId) return NextResponse.json({ value: CUTI_KUOTA });

    const approvedCuti = await prisma.leaveRequest.findMany({
      where: {
        userId,
        type: "Cuti",
        status: "Diterima",
      },
    });

    let usedDays = 0;
    approvedCuti.forEach((leave: LeaveRequest) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      usedDays += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    });

    const remainingCuti = CUTI_KUOTA - usedDays;

    return NextResponse.json({ value: remainingCuti });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ value: CUTI_KUOTA });
  }
}
