import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getSecret(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export function adminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && getSecret());
}

export async function signAdminSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** Constant-time compare of attempt to ADMIN_PASSWORD when lengths match. */
export function safeEqualPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !attempt) return false;
  if (attempt.length !== expected.length) return false;
  let ok = 0;
  for (let i = 0; i < attempt.length; i++) {
    ok |= attempt.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return ok === 0;
}
