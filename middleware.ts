import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Halaman publik
const publicPaths = ["/login", "/register"];
// Halaman yang boleh diakses non-admin
const allowedForNonAdmin = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.replace(/\/$/, "");

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = (payload as any).userId;
    const roleId = (payload as any).roleId;

    // Jika admin (roleId === 3) → boleh akses semua halaman
    if (roleId === 3) {
      return NextResponse.next();
    }

    // Non-admin hanya boleh akses halaman tertentu
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
