import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(){
    const leaves = await prisma.leaveRequest.findMany({include: {user: true}})
    return NextResponse.json(leaves)
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const leave = await prisma.leaveRequest.create({
    data: {
      userId: data.userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      type: data.type,
      status: "Pending",
      reason: data.reason || "",
      approvedBy: null,
    },
  });
  return NextResponse.json(leave);
}