import {
  addDaysYMD,
  isYMDInBookingWindow,
  salonTodayYMD,
} from "@/lib/business-schedule";
import { computeOpenSlots } from "@/lib/booking-availability";
import { loadBookings } from "@/lib/bookings-store";
import { getMergedBlackoutDates } from "@/lib/salon-config";
import { absentStaffSetForDate, loadStaffAbsences } from "@/lib/staff-absences-store";
import { getServiceByIdForApi, getStaffEligibleForServicesForApi } from "@/lib/services-api";
import { getStaffById } from "@/lib/staff";

export const runtime = "nodejs";

function parseServiceIds(raw: string | null): string[] | null {
  if (!raw || !raw.trim()) return null;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function eachYMDInclusive(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  let guard = 0;
  while (cur <= to && guard++ < 32) {
    out.push(cur);
    if (cur === to) break;
    cur = addDaysYMD(cur, 1);
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const durationMin = Number(searchParams.get("durationMin"));
    const serviceIds = parseServiceIds(searchParams.get("serviceIds"));
    const prefRaw = searchParams.get("preferredStaffId");
    const preferredStaffId =
      prefRaw == null || prefRaw.trim() === "" || prefRaw.trim().toLowerCase() === "any"
        ? null
        : prefRaw.trim();

    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return Response.json({ error: "Invalid or missing from (YYYY-MM-DD)." }, { status: 400 });
    }
    if (!to || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return Response.json({ error: "Invalid or missing to (YYYY-MM-DD)." }, { status: 400 });
    }
    if (from > to) {
      return Response.json({ error: "from must be on or before to." }, { status: 400 });
    }

    const today = salonTodayYMD();
    if (from < today) {
      return Response.json({ error: "from cannot be before today." }, { status: 400 });
    }

    const days = eachYMDInclusive(from, to);
    if (days.length > 15) {
      return Response.json({ error: "Range cannot exceed 15 days." }, { status: 400 });
    }

    if (!Number.isFinite(durationMin) || durationMin < 15 || durationMin > 480) {
      return Response.json({ error: "Invalid durationMin." }, { status: 400 });
    }
    if (!serviceIds?.length) {
      return Response.json({ error: "Missing or invalid serviceIds (comma-separated)." }, { status: 400 });
    }

    for (const id of serviceIds) {
      if (!(await getServiceByIdForApi(id))) {
        return Response.json({ error: `Unknown service: ${id}` }, { status: 400 });
      }
    }

    if (preferredStaffId && !getStaffById(preferredStaffId)) {
      return Response.json({ error: "Invalid preferredStaffId." }, { status: 400 });
    }

    const eligibleStaffIds = await getStaffEligibleForServicesForApi(serviceIds);
    if (eligibleStaffIds.length === 0) {
      return Response.json(
        { error: "No staff can perform all selected services together." },
        { status: 400 }
      );
    }

    const [bookings, blackoutDates, absences] = await Promise.all([
      loadBookings(),
      getMergedBlackoutDates(),
      loadStaffAbsences(),
    ]);
    const active = bookings.filter((b) => b.paymentStatus !== "failed");

    const result: { date: string; closed: boolean; hasSlots: boolean }[] = [];

    for (const date of days) {
      if (!isYMDInBookingWindow(date)) {
        result.push({ date, closed: true, hasSlots: false });
        continue;
      }
      const { slots, closed } = computeOpenSlots({
        dateYMD: date,
        durationMin,
        bookings: active,
        eligibleStaffIds,
        preferredStaffId,
        blackoutDates,
        absentStaffIdsForDay: absentStaffSetForDate(absences, date),
      });
      result.push({ date, closed, hasSlots: slots.length > 0 });
    }

    return Response.json({ days: result });
  } catch (e) {
    console.error("[bookings/availability/range]", e);
    return Response.json(
      { error: "Could not load calendar. Please refresh or try again." },
      { status: 500 }
    );
  }
}
