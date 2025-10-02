import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = parseInt(url.searchParams.get("limit") || "7");
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const dailyData = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end && dailyData.length < limit) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hadir = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          status: "Hadir"
        }
      });

      const terlambat = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          checkIn: {
            gte: new Date(dayStart.getTime() + 8 * 60 * 60 * 1000)
          },
          status: "Hadir"
        }
      });

      const absen = await prisma.absence.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          status: "Alpha"
        }
      });

      const izin = await prisma.leaveRequest.count({
        where: {
          startDate: {
            gte: dayStart,
            lte: dayEnd
          },
          status: "Approved"
        }
      });

      dailyData.push({
        tanggal: dayStart.toISOString().split('T')[0],
        hadir,
        terlambat,
        absen,
        izin
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Error fetching daily data:", error);
    return NextResponse.json({ error: "Failed to fetch daily data" }, { status: 500 });
  }
}
