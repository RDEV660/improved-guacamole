import { ADMIN_SESSION_COOKIE, adminAuthConfigured, safeEqualPassword, signAdminSessionToken } from "@/lib/admin-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (16+ chars) in the server environment.",
      },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!safeEqualPassword(password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = await signAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Could not create session." }, { status: 500 });
  }

  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
