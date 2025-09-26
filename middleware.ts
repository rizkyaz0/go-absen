import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Halaman publik
const publicPaths = ["/login", "/register"];
// API publik / user
const publicApi = ["/api/login", "/api/register", "/api/me", "/api/absences"];
// Halaman non-admin yang boleh diakses user selain role 3
const allowedForNonAdmin = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewati halaman publik
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Lewati API publik
  if (publicApi.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const roleId = req.cookies.get("roleId")?.value;

  // Jika belum login
  if (!roleId) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Proteksi halaman non-API
  if (!pathname.startsWith("/api")) {
    if (roleId !== "3" && !allowedForNonAdmin.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Proteksi API admin/private (selain publicApi)
  if (
    pathname.startsWith("/api") &&
    !publicApi.some((p) => pathname.startsWith(p))
  ) {
    if (roleId !== "3") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Middleware dijalankan di semua halaman + API
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // semua kecuali _next/static, _next/image, favicon
  ],
};
