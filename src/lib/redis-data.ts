import { Redis } from "@upstash/redis";

/**
 * Persistent JSON blobs for serverless (Vercel). Uses Upstash Redis via REST.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN from Vercel Storage,
 * or legacy KV_REST_API_URL + KV_REST_API_TOKEN from an older Vercel KV link.
 */
export function isRedisDataConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url?.trim() && token?.trim());
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url?.trim() || !token?.trim()) return null;
  return new Redis({ url: url.trim(), token: token.trim() });
}

export const REDIS_KEYS = {
  salonConfig: "lilys:data:salon-config",
  deals: "lilys:data:deals",
  staffDirectory: "lilys:data:staff-directory",
} as const;

/**
 * Upstash client's GET auto-deserializes JSON strings into objects/arrays.
 * Do not JSON.parse again or loads always return null.
 */
export async function redisGetJson<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  const raw: unknown = await r.get(key);
  if (raw == null || raw === "") return null;
  if (typeof raw === "object") {
    return raw as T;
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export async function redisSetJson(key: string, value: unknown): Promise<void> {
  const r = getRedis();
  if (!r) throw new Error("Redis is not configured.");
  try {
    await r.set(key, JSON.stringify(value));
  } catch (e) {
    console.error("[redisSetJson]", key, e);
    throw new Error(
      "Could not write to Redis. Check UPSTASH_REDIS_* or KV_REST_API_URL / KV_REST_API_TOKEN."
    );
  }
}
