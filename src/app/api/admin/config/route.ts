import { assertAdminSession } from "@/lib/admin-api-auth";
import { SalonConfigSchema, readSalonConfig, writeSalonConfig } from "@/lib/salon-config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const config = await readSalonConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = SalonConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid config.", details: parsed.error.flatten() }, { status: 400 });
  }
  await writeSalonConfig(parsed.data);
  return NextResponse.json({ ok: true });
}
