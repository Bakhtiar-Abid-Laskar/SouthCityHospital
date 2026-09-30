import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "sch_admin_session";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY || process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY (or ADMIN_SESSION_SECRET) environment variable must be defined in production."
      );
    }
    return new TextEncoder().encode("sch-dev-local-jwt-secret-key-32-chars-minimum");
  }

  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    if (pathname && pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    const encodedKey = getJwtSecretKey();
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;

    // Staff cannot access admin-only routes
    if (role !== "admin") {
      const adminOnlyPaths = ["/dashboard", "/doctors", "/schedules", "/patients", "/staff"];
      if (adminOnlyPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/bookings", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token: clear cookie and redirect to login
    const loginUrl = new URL("/login", request.url);
    if (pathname && pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctors/:path*",
    "/schedules/:path*",
    "/patients/:path*",
    "/staff/:path*",
    "/bookings/:path*",
    "/queries/:path*",
    "/subscribers/:path*",
  ],
};
