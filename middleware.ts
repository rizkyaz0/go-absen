import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Halaman publik
const publicPaths = ["/", "/login"];
const allowedForNonAdmin = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname.replace(/\/$/, "");
  const token = req.cookies.get("token")?.value;

  // 🌐 1️⃣ Izinkan halaman publik diakses tanpa token
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    // 🧭 Jika user SUDAH login dan buka / atau /login, arahkan ke dashboard sesuai role
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const roleId = (payload as any).roleId;

        if (roleId === 3) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } catch {
        // Token rusak → biarkan ke halaman publik
        return NextResponse.next();
      }
    }

    // Kalau belum login, tetap di halaman publik
    return NextResponse.next();
  }

  // 🔒 2️⃣ Jika bukan halaman publik dan tidak ada token → ke /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const roleId = (payload as any).roleId;

    // 🧑‍💼 3️⃣ Admin (roleId === 3) boleh akses semua halaman
    if (roleId === 3) return NextResponse.next();

    // 👤 4️⃣ Non-admin hanya boleh akses halaman tertentu
    if (!allowedForNonAdmin.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ⚙️ Terapkan middleware ke semua route kecuali _next, api, favicon
export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
