import {
  addDaysYMD,
  isYMDInBookingWindow,
  salonMaxBookYMD,
  salonTodayYMD,
} from "@/lib/business-schedule";
import { getStaffById } from "@/lib/staff";
import { loadStaffAbsences } from "@/lib/staff-absences-store";

export const runtime = "nodejs";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

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

/**
 * Public: which staff ids are marked absent per date (booking window only).
 * Used by the booking wizard to grey out / reset preferences.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");

    if (!fromRaw || !YMD.test(fromRaw) || !toRaw || !YMD.test(toRaw)) {
      return Response.json({ error: "Invalid or missing from/to (YYYY-MM-DD)." }, { status: 400 });
    }
    if (fromRaw > toRaw) {
      return Response.json({ error: "from must be on or before to." }, { status: 400 });
    }

    const today = salonTodayYMD();
    const hi = salonMaxBookYMD();
    const from = fromRaw < today ? today : fromRaw;
    const to = toRaw > hi ? hi : toRaw;

    if (from > to) {
      return Response.json({ absentByDate: {} as Record<string, string[]> });
    }

    const days = eachYMDInclusive(from, to);
    if (days.length > 16) {
      return Response.json({ error: "Range cannot exceed 16 days." }, { status: 400 });
    }

    const all = await loadStaffAbsences();
    const absentByDate: Record<string, string[]> = {};

    for (const d of days) {
      if (!isYMDInBookingWindow(d)) continue;
      const raw = all[d];
      if (!Array.isArray(raw) || raw.length === 0) continue;
      const ids = raw.filter((id): id is string => typeof id === "string" && Boolean(getStaffById(id)));
      if (ids.length > 0) {
        absentByDate[d] = ids;
      }
    }

    return Response.json({ absentByDate });
  } catch (e) {
    console.error("[absences-calendar GET]", e);
    return Response.json({ error: "Could not load absence calendar." }, { status: 500 });
  }
}
