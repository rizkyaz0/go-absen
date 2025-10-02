import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set({ name: "roleId", value: "", maxAge: 0, path: "/" });
  res.cookies.set({ name: "userId", value: "", maxAge: 0, path: "/" });
  return res;
}

