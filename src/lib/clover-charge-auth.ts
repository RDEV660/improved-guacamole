import { cloverOAuthRefresh } from "@/lib/clover-oauth";
import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";

type StoredOAuth = {
  access_token: string;
  refresh_token?: string;
  access_token_expiration?: number;
  refresh_token_expiration?: number;
};

/**
 * Bearer for Ecommerce `/v1/charges`. Prefers Redis-stored pair after refresh; else `CLOVER_ACCESS_TOKEN`.
 */
export async function getChargeBearerToken(): Promise<string | undefined> {
  if (isRedisDataConfigured()) {
    const s = await redisGetJson<StoredOAuth>(REDIS_KEYS.cloverOAuth);
    const t = s?.access_token?.trim();
    if (t) return t;
  }
  return process.env.CLOVER_ACCESS_TOKEN?.trim();
}

/**
 * v2 OAuth refresh; persists new tokens to Redis when configured (required so the new refresh_token is kept).
 */
export async function refreshCloverTokensAndPersist(): Promise<{ access_token: string } | null> {
  const clientId = process.env.CLOVER_APP_ID?.trim();
  let refreshToken: string | undefined;
  if (isRedisDataConfigured()) {
    const s = await redisGetJson<StoredOAuth>(REDIS_KEYS.cloverOAuth);
    refreshToken = s?.refresh_token?.trim();
  }
  refreshToken = refreshToken || process.env.CLOVER_REFRESH_TOKEN?.trim();
  if (!clientId || !refreshToken) return null;

  const data = await cloverOAuthRefresh({ client_id: clientId, refresh_token: refreshToken });
  if (!data?.access_token) return null;

  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.cloverOAuth, {
      access_token: data.access_token,
      refresh_token: (data.refresh_token ?? refreshToken).trim(),
      access_token_expiration: data.access_token_expiration,
      refresh_token_expiration: data.refresh_token_expiration,
    });
  }

  return { access_token: data.access_token };
}
