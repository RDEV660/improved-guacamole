import { assertAdminSession } from "@/lib/admin-api-auth";
import { isYMDInBookingWindow, salonMaxBookYMD, salonTodayYMD } from "@/lib/business-schedule";
import { getStaffById, STAFF } from "@/lib/staff";
import { loadStaffAbsences, setAbsentStaffForDate } from "@/lib/staff-absences-store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  if (!(await assertAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const staff = STAFF.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
  }));

  if (!date) {
    return NextResponse.json({
      staff,
      salonTodayYMD: salonTodayYMD(),
      salonMaxBookYMD: salonMaxBookYMD(),
      absences: await loadStaffAbsences(),
    });
  }

  if (!YMD.test(date)) {
    return NextResponse.json({ error: "Invalid date (use YYYY-MM-DD)." }, { status: 400 });
  }

  const absences = await loadStaffAbsences();
  const raw = absences[date];
  const absentStaffIds = Array.isArray(raw)
    ? raw.filter((id) => typeof id === "string" && getStaffById(id))
    : [];

  return NextResponse.json({
    staff,
    absentStaffIds,
    date,
    salonTodayYMD: salonTodayYMD(),
    salonMaxBookYMD: salonMaxBookYMD(),
  });
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const rec = body as { date?: unknown; absentStaffIds?: unknown };
  const date = typeof rec.date === "string" ? rec.date.trim() : "";
  if (!YMD.test(date)) {
    return NextResponse.json({ error: "Invalid or missing date (YYYY-MM-DD)." }, { status: 400 });
  }

  if (!isYMDInBookingWindow(date)) {
    return NextResponse.json(
      { error: "Date must be within the online booking window (today through max bookable day)." },
      { status: 400 }
    );
  }

  if (!Array.isArray(rec.absentStaffIds)) {
    return NextResponse.json({ error: "absentStaffIds must be an array of staff ids." }, { status: 400 });
  }

  const ids = rec.absentStaffIds.filter((id): id is string => typeof id === "string" && id.trim() !== "");
  for (const id of ids) {
    if (!getStaffById(id)) {
      return NextResponse.json({ error: `Unknown staff id: ${id}` }, { status: 400 });
    }
  }

  await setAbsentStaffForDate(date, ids);
  return NextResponse.json({ ok: true });
}
