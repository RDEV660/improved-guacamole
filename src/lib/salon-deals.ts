import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

const DEALS_PATH = path.join(process.cwd(), "data", "deals.json");

export const DealSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  promoCode: z.string().optional(),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  active: z.boolean(),
});

export type Deal = z.infer<typeof DealSchema>;

export const DealsFileSchema = z.object({
  deals: z.array(DealSchema),
});

export type DealsFile = z.infer<typeof DealsFileSchema>;

const DEFAULT: DealsFile = { deals: [] };

async function ensureFile(): Promise<void> {
  const dir = path.dirname(DEALS_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DEALS_PATH);
  } catch {
    await fs.writeFile(DEALS_PATH, JSON.stringify(DEFAULT, null, 2), "utf8");
  }
}

export async function readDealsFile(): Promise<DealsFile> {
  if (isRedisDataConfigured()) {
    const parsed = await redisGetJson<unknown>(REDIS_KEYS.deals);
    const r = DealsFileSchema.safeParse(parsed);
    if (r.success) return r.data;
    return DEFAULT;
  }
  await ensureFile();
  const raw = await fs.readFile(DEALS_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = DealsFileSchema.safeParse(parsed);
    if (r.success) return r.data;
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export async function writeDealsFile(data: DealsFile): Promise<void> {
  const parsed = DealsFileSchema.parse(data);
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.deals, parsed);
    return;
  }
  await ensureFile();
  await fs.writeFile(DEALS_PATH, JSON.stringify(parsed, null, 2), "utf8");
}
