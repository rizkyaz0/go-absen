import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const lateEmployees = await prisma.absence.groupBy({
      by: ['userId'],
      where: {
        date: {
          gte: start,
          lte: end
        },
        checkIn: {
          gte: new Date(start.getTime() + 8 * 60 * 60 * 1000)
        },
        status: "Hadir"
      },
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: limit
    });

    const employeesWithDetails = await Promise.all(
      lateEmployees.map(async (employee: { userId: number; _count: { userId: bigint } }) => {
        const user = await prisma.user.findUnique({
          where: { id: employee.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: { name: true }
            }
          }
        });

        return {
          id: employee.userId,
          nama: user?.name || "Unknown",
          jabatan: user?.role?.name || "Unknown",
          totalTerlambat: Number(employee._count.userId),
          bulan: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        };
      })
    );

    return NextResponse.json(employeesWithDetails);
  } catch (error) {
    console.error("Error fetching late employees:", error);
    return NextResponse.json({ error: "Failed to fetch late employees" }, { status: 500 });
  }
}
