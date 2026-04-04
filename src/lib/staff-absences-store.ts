import { promises as fs } from "fs";
import path from "path";
import { getStaffById } from "@/lib/staff";
import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";

const DATA_FILE = path.join(process.cwd(), "data", "staff-absences.json");

type AbsencesFile = Record<string, string[]>;

async function ensureDataFile(): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "{}", "utf8");
  }
}

export async function loadStaffAbsences(): Promise<AbsencesFile> {
  if (isRedisDataConfigured()) {
    const data = await redisGetJson<AbsencesFile>(REDIS_KEYS.staffAbsences);
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    return {};
  }
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as AbsencesFile;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export async function saveStaffAbsences(data: AbsencesFile): Promise<void> {
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.staffAbsences, data);
    return;
  }
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function absentStaffSetForDate(
  absences: AbsencesFile,
  dateYMD: string
): ReadonlySet<string> {
  const raw = absences[dateYMD];
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.filter((id) => typeof id === "string" && getStaffById(id)));
}

export async function setAbsentStaffForDate(
  dateYMD: string,
  absentStaffIds: string[]
): Promise<void> {
  const unique = [...new Set(absentStaffIds)].filter((id) => getStaffById(id));
  const all = await loadStaffAbsences();
  if (unique.length === 0) {
    delete all[dateYMD];
  } else {
    all[dateYMD] = unique;
  }
  await saveStaffAbsences(all);
}
