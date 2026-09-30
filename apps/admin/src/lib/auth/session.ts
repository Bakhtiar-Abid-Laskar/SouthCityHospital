import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { AuthSession } from "@sch/types";

const ADMIN_SESSION_COOKIE = "sch_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 60 minutes session

export function getJwtSecretKey(): Uint8Array {
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

export async function setSessionCookie(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  const encodedKey = getJwtSecretKey();
  
  const token = await new SignJWT(session as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedKey);

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  if (!token) return null;
  try {
    const encodedKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

export async function requireAdmin(): Promise<AuthSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return user;
}

export async function requireStaffOrAdmin(): Promise<AuthSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
