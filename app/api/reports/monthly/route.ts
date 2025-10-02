import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());

    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const hadir = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          status: "Hadir"
        }
      });

      const terlambat = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          checkIn: {
            gte: new Date(startDate.getTime() + 8 * 60 * 60 * 1000)
          },
          status: "Hadir"
        }
      });

      const absen = await prisma.absence.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          status: "Alpha"
        }
      });

      const izin = await prisma.leaveRequest.count({
        where: {
          startDate: {
            gte: startDate,
            lte: endDate
          },
          status: "Approved"
        }
      });

      monthlyData.push({
        bulan: new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        hadir,
        terlambat,
        absen,
        izin
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    return NextResponse.json({ error: "Failed to fetch monthly data" }, { status: 500 });
  }
}
