import type { BookingRecord, ConfirmBookingBody } from "@/lib/booking-types";
import { resolveAssignedStaffId } from "@/lib/booking-availability";
import { isYMDInBookingWindow } from "@/lib/business-schedule";
import { getDayWindowForYMDWithBlackouts, timeToMinutes } from "@/lib/booking-hours";
import { appendBooking, loadBookings } from "@/lib/bookings-store";
import { getChargeBearerToken, refreshCloverTokensAndPersist } from "@/lib/clover-charge-auth";
import { cloverEcomBaseUrl } from "@/lib/clover-config";
import { sendNewBookingNotifications } from "@/lib/notify-booking";
import { getMergedBlackoutDates } from "@/lib/salon-config";
import { getServiceByIdForApi, getStaffEligibleForServicesForApi } from "@/lib/services-api";
import { absentStaffSetForDate, loadStaffAbsences } from "@/lib/staff-absences-store";
import { getStaffById } from "@/lib/staff";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "127.0.0.1";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "127.0.0.1";
}

export async function POST(req: Request) {
  let body: ConfirmBookingBody;
  try {
    body = (await req.json()) as ConfirmBookingBody;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    serviceIds,
    preferredStaffId: prefRaw,
    date,
    startTime,
    sourceToken,
  } = body;

  const preferredStaffId =
    prefRaw === undefined || prefRaw === null || String(prefRaw).trim() === ""
      ? null
      : String(prefRaw).trim();

  if (
    !customerName?.trim() ||
    !customerEmail?.trim() ||
    !customerPhone?.trim() ||
    !Array.isArray(serviceIds) ||
    serviceIds.length === 0 ||
    !date ||
    !startTime ||
    !sourceToken?.trim()
  ) {
    return Response.json({ error: "Missing required booking or payment fields." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date." }, { status: 400 });
  }
  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return Response.json({ error: "Invalid startTime (use HH:mm)." }, { status: 400 });
  }

  if (!isYMDInBookingWindow(date)) {
    return Response.json({ error: "Date is outside the booking window." }, { status: 400 });
  }

  const blackoutDates = await getMergedBlackoutDates();
  const window = getDayWindowForYMDWithBlackouts(date, blackoutDates);
  if (!window) {
    return Response.json({ error: "Salon is closed that day." }, { status: 400 });
  }

  let totalCents = 0;
  let durationMin = 0;
  for (const id of serviceIds) {
    const svc = await getServiceByIdForApi(id);
    if (!svc) {
      return Response.json({ error: `Unknown service: ${id}` }, { status: 400 });
    }
    totalCents += svc.priceCents;
    durationMin += svc.durationMin;
  }

  const eligible = await getStaffEligibleForServicesForApi(serviceIds);
  if (eligible.length === 0) {
    return Response.json(
      { error: "No single team member can perform all chosen services together." },
      { status: 400 }
    );
  }

  if (preferredStaffId) {
    if (!getStaffById(preferredStaffId)) {
      return Response.json({ error: "Invalid staff selection." }, { status: 400 });
    }
    if (!eligible.includes(preferredStaffId)) {
      return Response.json(
        { error: "Selected team member cannot perform all chosen services." },
        { status: 400 }
      );
    }
  }

  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMin;
  if (startMin < window.openMin || endMin > window.closeMin) {
    return Response.json({ error: "Selected time is outside business hours." }, { status: 400 });
  }

  const [existing, absences] = await Promise.all([loadBookings(), loadStaffAbsences()]);
  const active = existing.filter((b) => b.paymentStatus !== "failed");
  const absentStaffIdsForDay = absentStaffSetForDate(absences, date);

  const assignedStaffId = await resolveAssignedStaffId({
    serviceIds,
    preferredStaffId,
    date,
    startTime,
    durationMin,
    bookings: active,
    absentStaffIdsForDay,
  });

  if (!assignedStaffId) {
    return Response.json(
      {
        error:
          preferredStaffId != null
            ? "That time is no longer available for the selected team member."
            : "That time is no longer available. Please pick another slot.",
      },
      { status: 409 }
    );
  }

  let bearer = await getChargeBearerToken();
  if (!bearer) {
    const boot = await refreshCloverTokensAndPersist();
    bearer = boot?.access_token;
  }
  if (!bearer) {
    return Response.json(
      {
        error:
          "Clover charge token missing. Set CLOVER_ACCESS_TOKEN, or CLOVER_APP_ID + CLOVER_REFRESH_TOKEN (and Redis on Vercel to persist refreshed tokens).",
      },
      { status: 503 }
    );
  }

  const chargeUrl = `${cloverEcomBaseUrl()}/v1/charges`;
  const chargeBody = JSON.stringify({
    amount: totalCents,
    currency: "usd",
    source: sourceToken.trim(),
  });

  const postCharge = (auth: string) =>
    fetch(chargeUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${auth}`,
        "x-forwarded-for": clientIp(req),
      },
      body: chargeBody,
    });

  let chargeRes = await postCharge(bearer);
  if (chargeRes.status === 401) {
    const refreshed = await refreshCloverTokensAndPersist();
    if (refreshed?.access_token) {
      chargeRes = await postCharge(refreshed.access_token);
    }
  }

  const chargeText = await chargeRes.text();
  let chargeJson: { id?: string; status?: string; message?: string };
  try {
    chargeJson = JSON.parse(chargeText) as typeof chargeJson;
  } catch {
    chargeJson = {};
  }

  if (!chargeRes.ok) {
    return Response.json(
      {
        error: "Payment was declined or could not be processed.",
        cloverStatus: chargeRes.status,
        details: chargeJson,
      },
      { status: 402 }
    );
  }

  const booking: BookingRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    serviceIds,
    preferredStaffId,
    assignedStaffId,
    date,
    startTime,
    totalCents,
    durationMin,
    cloverChargeId: chargeJson.id,
    paymentStatus: "paid",
  };

  await appendBooking(booking);

  void sendNewBookingNotifications(booking).catch((e) => {
    console.error("[notify-booking]", e);
  });

  return Response.json({
    ok: true,
    bookingId: booking.id,
    cloverChargeId: chargeJson.id,
    amountCents: totalCents,
  });
}
