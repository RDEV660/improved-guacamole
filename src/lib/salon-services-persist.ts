import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

const SERVICES_PATH = path.join(process.cwd(), "data", "services.json");

export const BookableServiceJsonSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  durationMin: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  startingAt: z.boolean().optional(),
  staffIds: z.array(z.string().min(1)).min(1),
});

export const ServicesArraySchema = z.array(BookableServiceJsonSchema).min(1);

export type PersistedBookableService = z.infer<typeof BookableServiceJsonSchema>;

export async function readServicesJsonRaw(): Promise<string> {
  if (isRedisDataConfigured()) {
    const arr = await redisGetJson<unknown>(REDIS_KEYS.servicesJson);
    if (Array.isArray(arr) && arr.length > 0) {
      return JSON.stringify(arr, null, 2);
    }
    try {
      return await fs.readFile(SERVICES_PATH, "utf8");
    } catch {
      return "[]";
    }
  }
  try {
    return await fs.readFile(SERVICES_PATH, "utf8");
  } catch {
    return "[]";
  }
}

export async function readValidatedServicesArray(): Promise<PersistedBookableService[]> {
  const raw = await readServicesJsonRaw();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const r = ServicesArraySchema.safeParse(parsed);
  return r.success ? r.data : [];
}

export async function writeServicesJsonValidated(jsonText: string): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid JSON.");
  }
  ServicesArraySchema.parse(parsed);
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.servicesJson, parsed);
    return;
  }
  const dir = path.dirname(SERVICES_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SERVICES_PATH, JSON.stringify(parsed, null, 2), "utf8");
}
