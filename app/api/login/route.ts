import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";

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

    let passwordValid = false;
    try {
      // Jika sudah di-hash
      if (user.password.startsWith("$2")) {
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        // Fallback untuk data lama (plaintext)
        passwordValid = user.password === password;
        if (passwordValid) {
          // Migrasi: hash dan simpan ulang secara transparan
          const newHash = await bcrypt.hash(password, 10);
          await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
        }
      }
    } catch {
      passwordValid = false;
    }

    if (!passwordValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Tentukan redirect URL
    const redirectUrl = user.roleId === 3 ? "/admin/dashboard" : "/dashboard";

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

    // Login API
    response.cookies.set({
      name: "userId",
      value: user.id.toString(),
      path: "/",
      httpOnly: true,
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
