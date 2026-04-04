import { assertAdminSession } from "@/lib/admin-api-auth";
import { readServicesJsonRaw, writeServicesJsonValidated } from "@/lib/salon-services-persist";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const raw = await readServicesJsonRaw();
  return new NextResponse(raw, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function PUT(req: Request) {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const text = await req.text();
  try {
    await writeServicesJsonValidated(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid services JSON.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
