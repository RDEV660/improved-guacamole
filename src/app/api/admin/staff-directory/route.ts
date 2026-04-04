import { assertAdminSession } from "@/lib/admin-api-auth";
import { readStaffDirectoryFile, StaffFileSchema, writeStaffDirectoryFile } from "@/lib/salon-staff-file";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const data = await readStaffDirectoryFile();
  return NextResponse.json(data);
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
  const parsed = StaffFileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid staff file.", details: parsed.error.flatten() }, { status: 400 });
  }
  await writeStaffDirectoryFile(parsed.data);
  return NextResponse.json({ ok: true });
}
