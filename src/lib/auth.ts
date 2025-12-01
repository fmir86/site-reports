import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "wp-reports-session";
const SESSION_DURATION_DAYS = parseInt(
  process.env.SESSION_DURATION_DAYS || "30",
  10
);

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || process.env.SITE_PASSWORD || "fallback-secret";
  return new TextEncoder().encode(secret);
}

export async function createSession(): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getJwtSecret());

  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validatePassword(password: string): boolean {
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    console.error("SITE_PASSWORD environment variable is not set");
    return false;
  }

  return password === sitePassword;
}
