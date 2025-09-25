import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Tentukan redirect URL
    const redirectUrl = user.roleId === 1 ? "/admin" : "/dashboard";

    const response = NextResponse.json({
      message: "Login berhasil",
      redirectUrl,
    });

    // Set cookie roleId httpOnly
    response.cookies.set({
      name: "roleId",
      value: user.roleId.toString(),
      path: "/",
      httpOnly: true, // tidak bisa diubah di browser
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
