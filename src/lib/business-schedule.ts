/**
 * Single source of truth for bookable hours + display copy (Mission, TX).
 * Weekday for a Y-M-D string uses the Gregorian calendar (same label worldwide).
 */

export const BOOKING_TIMEZONE = "America/Chicago";

/** Max days ahead (inclusive of today as day 0) for online booking */
export const BOOKING_MAX_DAYS_AHEAD = 14;

/**
 * Optional closed dates for online booking (YYYY-MM-DD), e.g. holidays.
 * Also blocks display as closed if wired through getDayWindowForYMD.
 */
export const BOOKING_BLACKOUT_DATES: readonly string[] = [];

/** One row per site copy — `hours` is human-readable; windows drive booking. */
export const BUSINESS_HOURS_ROWS = [
  { label: "Monday", hours: "Closed" as const },
  { label: "Tuesday – Friday", hours: "10:00 AM – 7:00 PM" as const },
  { label: "Saturday", hours: "9:00 AM – 5:30 PM" as const },
  { label: "Sunday", hours: "Closed" as const },
] as const;

/** Alias for components that expect `BUSINESS_HOURS` (same shape as before). */
export const BUSINESS_HOURS = BUSINESS_HOURS_ROWS;

/** 0 = Sunday … 6 = Saturday. Null = closed that day. */
export const WEEKLY_BOOKABLE_MINUTES: (null | { openMin: number; closeMin: number })[] = [
  /* Sun */ null,
  /* Mon */ null,
  /* Tue */ { openMin: 10 * 60, closeMin: 19 * 60 },
  /* Wed */ { openMin: 10 * 60, closeMin: 19 * 60 },
  /* Thu */ { openMin: 10 * 60, closeMin: 19 * 60 },
  /* Fri */ { openMin: 10 * 60, closeMin: 19 * 60 },
  /* Sat */ { openMin: 9 * 60 + 0, closeMin: 17 * 60 + 30 },
];

/** Gregorian calendar weekday 0–6 (Sun–Sat) for YYYY-MM-DD */
export function dayOfWeekFromYMD(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Today’s calendar date in the salon timezone (YYYY-MM-DD). */
export function salonTodayYMD(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const mo = parts.find((p) => p.type === "month")?.value ?? "";
  const da = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${mo}-${da}`;
}

export function addDaysYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Inclusive max bookable date (YYYY-MM-DD) in salon TZ */
export function salonMaxBookYMD(now = new Date()): string {
  return addDaysYMD(salonTodayYMD(now), BOOKING_MAX_DAYS_AHEAD);
}

/**
 * true if ymd is within [today, today+BOOKING_MAX_DAYS_AHEAD] in salon calendar.
 */
export function isYMDInBookingWindow(ymd: string, now = new Date()): boolean {
  const lo = salonTodayYMD(now);
  const hi = salonMaxBookYMD(now);
  return ymd >= lo && ymd <= hi;
}
