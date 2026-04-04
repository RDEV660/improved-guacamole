import type { StaffMember } from "@/lib/staff";
import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

const STAFF_PATH = path.join(process.cwd(), "data", "staff-directory.json");

const MemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
});

export const StaffFileSchema = z.object({
  members: z.array(MemberSchema),
});

export type StaffDirectoryFile = z.infer<typeof StaffFileSchema>;

const DEFAULT: StaffDirectoryFile = { members: [] };

async function ensureFile(): Promise<void> {
  const dir = path.dirname(STAFF_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(STAFF_PATH);
  } catch {
    await fs.writeFile(STAFF_PATH, JSON.stringify(DEFAULT, null, 2), "utf8");
  }
}

export async function readStaffDirectoryFile(): Promise<StaffDirectoryFile> {
  if (isRedisDataConfigured()) {
    const parsed = await redisGetJson<unknown>(REDIS_KEYS.staffDirectory);
    const r = StaffFileSchema.safeParse(parsed);
    if (r.success) return r.data;
    return DEFAULT;
  }
  await ensureFile();
  const raw = await fs.readFile(STAFF_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = StaffFileSchema.safeParse(parsed);
    if (r.success) return r.data;
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export async function writeStaffDirectoryFile(data: StaffDirectoryFile): Promise<void> {
  const parsed = StaffFileSchema.parse(data);
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.staffDirectory, parsed);
    return;
  }
  await ensureFile();
  await fs.writeFile(STAFF_PATH, JSON.stringify(parsed, null, 2), "utf8");
}

/** For display only — booking eligibility still uses code in staff.ts + services.ts */
export function toStaffMembers(file: StaffDirectoryFile): StaffMember[] {
  return file.members.map((m) => ({ id: m.id, name: m.name, role: m.role }));
}
