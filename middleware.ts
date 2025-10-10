import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Halaman publik (tidak perlu login)
const publicPaths = ["/", "/login", "/register"];

// Halaman yang boleh diakses non-admin
const allowedForNonAdmin = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.replace(/\/$/, "") || "/";

  // ✅ 1️⃣ Jika halaman public (/, /login, /register) → lanjut saja
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // ✅ 2️⃣ Kalau belum login dan mencoba buka halaman private → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ 3️⃣ Kalau sudah login → verifikasi JWT
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const roleId = (payload as any).roleId;

    // Admin boleh akses semua
    if (roleId === 3) {
      return NextResponse.next();
    }

    // Non-admin hanya boleh halaman tertentu
    if (!allowedForNonAdmin.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
