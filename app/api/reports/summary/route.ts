import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Total hari kerja dalam periode
    const totalHariKerja = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Rata-rata kehadiran
    const totalAbsences = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        }
      }
    });

    const totalHadir = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        },
        status: "Hadir"
      }
    });

    const rataRataKehadiran = totalAbsences > 0 ? (totalHadir / totalAbsences) * 100 : 0;

    // Total terlambat (asumsi terlambat jika checkIn > jam 09:00)
    const totalTerlambat = await prisma.absence.count({
      where: {
        date: {
          gte: start,
          lte: end
        },
        checkIn: { not: null },
        status: "Hadir"
      }
    });

    // Izin diterima
    const izinDiterima = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: start,
          lte: end
        },
        status: "Approved"
      }
    });

    // Izin ditolak
    const izinDitolak = await prisma.leaveRequest.count({
      where: {
        startDate: {
          gte: start,
          lte: end
        },
        status: "Rejected"
      }
    });

    return NextResponse.json({
      totalHariKerja,
      rataRataKehadiran: Math.round(rataRataKehadiran * 100) / 100,
      totalTerlambat,
      izinDiterima,
      izinDitolak
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
