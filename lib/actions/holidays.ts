"use server"

import { prisma } from "@/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { unstable_cache, revalidateTag } from "next/cache"

const JWT_SECRET = process.env.JWT_SECRET || "secret_key"

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) throw new Error("Unauthorized")

  const payload = jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number }
  if (payload.roleId !== 3) {
    throw new Error("Forbidden")
  }
  return payload
}

export const getCachedHolidays = unstable_cache(
  async () => {
    const items = await prisma.holiday.findMany({ orderBy: { date: "asc" } })
    return { success: true, data: items }
  },
  ["holidays"],
  { tags: ["holidays"], revalidate: 300 }
)

export async function getHolidays() {
  try {
    await verifyAdmin()
    return await getCachedHolidays()
  } catch (err) {
    console.error("Get holidays error:", err)
    return { error: "Unauthorized" }
  }
}

export async function createHoliday(input: { date: string; name: string; isHalfDay?: boolean }) {
  try {
    await verifyAdmin()
    const created = await prisma.holiday.create({
      data: {
        date: new Date(input.date),
        name: input.name,
        isHalfDay: !!input.isHalfDay,
      },
    })
    revalidateTag("holidays")
    revalidateTag("reports")
    return { success: true, data: created }
  } catch (err) {
    console.error("Create holiday error:", err)
    return { error: "Gagal menambahkan hari libur" }
  }
}

export async function deleteHoliday(id: number) {
  try {
    await verifyAdmin()
    await prisma.holiday.delete({ where: { id } })
    revalidateTag("holidays")
    revalidateTag("reports")
    return { success: true }
  } catch (err) {
    console.error("Delete holiday error:", err)
    return { error: "Gagal menghapus hari libur" }
  }
}