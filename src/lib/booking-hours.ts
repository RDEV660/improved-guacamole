import { dayOfWeekFromYMD, WEEKLY_BOOKABLE_MINUTES } from "@/lib/business-schedule";

/**
 * Business windows in local time (Mission, TX) — driven by business-schedule.
 */
export type DayWindow = { openMin: number; closeMin: number } | null;

/** Minutes from midnight for "10:00" etc. */
export function hm(h: number, m: number): number {
  return h * 60 + m;
}

/** 0 = Sunday … 6 = Saturday */
export function getDayWindow(dayOfWeek: number): DayWindow {
  if (dayOfWeek < 0 || dayOfWeek > 6) return null;
  return WEEKLY_BOOKABLE_MINUTES[dayOfWeek] ?? null;
}

/** Bookable window for YYYY-MM-DD given merged blackout list + weekly hours. */
export function getDayWindowForYMDWithBlackouts(
  ymd: string,
  blackoutDates: readonly string[]
): DayWindow {
  if (blackoutDates.includes(ymd)) return null;
  const dow = dayOfWeekFromYMD(ymd);
  if (Number.isNaN(dow)) return null;
  return getDayWindow(dow);
}

export function parseLocalDate(dateStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const SLOT_STEP = 30;

export function buildSlotStarts(window: DayWindow, durationMin: number): number[] {
  if (!window) return [];
  const starts: number[] = [];
  for (let t = window.openMin; t + durationMin <= window.closeMin; t += SLOT_STEP) {
    starts.push(t);
  }
  return starts;
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
