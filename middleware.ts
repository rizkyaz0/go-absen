import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Halaman yang bisa diakses user selain roleId 1
const allowedForNonAdmin = ["/dashboard"];
// Halaman yang tidak perlu middleware
const publicPaths = ["/login", "/register"];

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

  // Kalau roleId bukan 1 → hanya boleh akses halaman tertentu
  if (roleId !== "3" && !allowedForNonAdmin.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Role 1 atau halaman diizinkan → lanjut
  return NextResponse.next();
}

// Middleware dijalankan di semua halaman kecuali /api, /_next, favicon
export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
