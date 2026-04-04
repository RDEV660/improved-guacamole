import { isYMDInBookingWindow } from "@/lib/business-schedule";
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const durationMin = Number(searchParams.get("durationMin"));
  const serviceIds = parseServiceIds(searchParams.get("serviceIds"));
  const prefRaw = searchParams.get("preferredStaffId");
  const preferredStaffId =
    prefRaw == null || prefRaw.trim() === "" || prefRaw.trim().toLowerCase() === "any"
      ? null
      : prefRaw.trim();

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid or missing date (YYYY-MM-DD)." }, { status: 400 });
  }
  if (!isYMDInBookingWindow(date)) {
    return Response.json({ error: "Date is outside the booking window." }, { status: 400 });
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
  const absentStaffIdsForDay = absentStaffSetForDate(absences, date);
  const { slots, closed } = computeOpenSlots({
    dateYMD: date,
    durationMin,
    bookings: bookings.filter((b) => b.paymentStatus !== "failed"),
    eligibleStaffIds,
    preferredStaffId,
    blackoutDates,
    absentStaffIdsForDay,
  });

  return Response.json({ slots, closed });
}
