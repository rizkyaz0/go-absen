// app/api/stats/kehadiran/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = parseInt(url.searchParams.get("userId") || "0");
    if (!userId) return NextResponse.json({ value: 0 });

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM Absence
      WHERE userId = ${userId}
        AND checkIn IS NOT NULL
        AND YEAR(date) = ${year}
        AND MONTH(date) = ${month}
    `;

    const hadirCount = Number(result[0]?.count || 0);

    return NextResponse.json({ value: hadirCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ value: 0 });
  }
}
