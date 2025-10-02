import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Halaman yang bisa diakses user non-admin
const allowedForNonAdmin = ["/dashboard", "/api/me", "/api/stats", "/api/stats/kehadiran", "/api/stats/cuti"];
// Halaman yang tidak perlu middleware
const publicPaths = ["/login", "/register", "/api/login", "/api/logout"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewati halaman publik (login, register, dll)
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const roleId = req.cookies.get("roleId")?.value;

  // Kalau tidak ada cookie roleId → redirect ke login
  if (!roleId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin roleId = 3
  if (roleId === "3") {
    return NextResponse.next();
  }

  // Non-admin hanya boleh akses path tertentu
  if (!allowedForNonAdmin.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Role 1 atau halaman diizinkan → lanjut
  return NextResponse.next();
}

// Middleware dijalankan di semua halaman kecuali /api, /_next, favicon
export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
