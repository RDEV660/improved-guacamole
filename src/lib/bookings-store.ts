import { promises as fs } from "fs";
import path from "path";
import type { BookingRecord } from "@/lib/booking-types";
import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";

const DATA_FILE = path.join(process.cwd(), "data", "bookings.json");

async function ensureDataFile(): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function loadBookings(): Promise<BookingRecord[]> {
  if (isRedisDataConfigured()) {
    const data = await redisGetJson<BookingRecord[]>(REDIS_KEYS.bookings);
    return Array.isArray(data) ? data : [];
  }
  try {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
    } catch {
      return [];
    }
  } catch {
    // Read-only FS on serverless (e.g. Vercel) — skip mkdir/write and read if file shipped with deploy.
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
    } catch {
      return [];
    }
  }
}

export async function saveBookings(bookings: BookingRecord[]): Promise<void> {
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.bookings, bookings);
    return;
  }
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), "utf8");
}

export async function appendBooking(booking: BookingRecord): Promise<void> {
  const all = await loadBookings();
  all.push(booking);
  await saveBookings(all);
}
