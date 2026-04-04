import type { BookingRecord } from "@/lib/booking-types";
import {
  buildSlotStarts,
  getDayWindowForYMDWithBlackouts,
  minutesToTime,
  rangesOverlap,
  timeToMinutes,
} from "@/lib/booking-hours";
import { getStaffEligibleForServicesForApi } from "@/lib/services-api";

/** Legacy rows without assignedStaffId block the whole salon for that interval. */
function bookingBlocksStaff(
  b: BookingRecord,
  date: string,
  startMin: number,
  endMin: number,
  staffId: string
): boolean {
  if (b.date !== date || b.paymentStatus === "failed") return false;
  const bs = timeToMinutes(b.startTime);
  const be = bs + b.durationMin;
  if (!rangesOverlap(startMin, endMin, bs, be)) return false;

  const assigned = b.assignedStaffId;
  if (assigned != null && assigned !== "") {
    return assigned === staffId;
  }
  return true;
}

export function staffIsFreeAt(
  staffId: string,
  date: string,
  startMin: number,
  endMin: number,
  bookings: BookingRecord[],
  absentStaffIdsForDay: ReadonlySet<string> = new Set()
): boolean {
  if (absentStaffIdsForDay.has(staffId)) return false;
  return !bookings.some((b) => bookingBlocksStaff(b, date, startMin, endMin, staffId));
}

export function computeOpenSlots(params: {
  dateYMD: string;
  durationMin: number;
  bookings: BookingRecord[];
  eligibleStaffIds: readonly string[];
  preferredStaffId: string | null;
  blackoutDates: readonly string[];
  /** Whole-day absences (manager-marked); those staff cannot take bookings that day. */
  absentStaffIdsForDay?: ReadonlySet<string>;
}): { slots: string[]; closed: boolean } {
  const {
    dateYMD,
    durationMin,
    bookings,
    eligibleStaffIds,
    preferredStaffId,
    blackoutDates,
    absentStaffIdsForDay = new Set(),
  } = params;
  const window = getDayWindowForYMDWithBlackouts(dateYMD, blackoutDates);
  if (!window) {
    return { slots: [], closed: true };
  }
  if (eligibleStaffIds.length === 0) {
    return { slots: [], closed: false };
  }

  const candidates = buildSlotStarts(window, durationMin);
  const slots: string[] = [];

  for (const startMin of candidates) {
    const endMin = startMin + durationMin;
    if (preferredStaffId) {
      if (
        eligibleStaffIds.includes(preferredStaffId) &&
        staffIsFreeAt(preferredStaffId, dateYMD, startMin, endMin, bookings, absentStaffIdsForDay)
      ) {
        slots.push(minutesToTime(startMin));
      }
    } else {
      const anyFree = eligibleStaffIds.some((id) =>
        staffIsFreeAt(id, dateYMD, startMin, endMin, bookings, absentStaffIdsForDay)
      );
      if (anyFree) slots.push(minutesToTime(startMin));
    }
  }

  return { slots, closed: false };
}

/**
 * Resolve who gets the appointment. Returns null if no eligible staff is free at this slot.
 */
export async function resolveAssignedStaffId(params: {
  serviceIds: string[];
  preferredStaffId: string | null;
  date: string;
  startTime: string;
  durationMin: number;
  bookings: BookingRecord[];
  absentStaffIdsForDay?: ReadonlySet<string>;
}): Promise<string | null> {
  const {
    serviceIds,
    preferredStaffId,
    date,
    startTime,
    durationMin,
    bookings,
    absentStaffIdsForDay = new Set(),
  } = params;
  const eligible = await getStaffEligibleForServicesForApi(serviceIds);
  if (eligible.length === 0) return null;

  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMin;

  if (preferredStaffId) {
    if (!eligible.includes(preferredStaffId)) return null;
    if (!staffIsFreeAt(preferredStaffId, date, startMin, endMin, bookings, absentStaffIdsForDay))
      return null;
    return preferredStaffId;
  }

  for (const id of eligible) {
    if (staffIsFreeAt(id, date, startMin, endMin, bookings, absentStaffIdsForDay)) return id;
  }
  return null;
}
