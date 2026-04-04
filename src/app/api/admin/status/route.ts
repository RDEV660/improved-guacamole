import { adminAuthConfigured } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ configured: adminAuthConfigured() });
}
