import { getCloverEnv } from "@/lib/clover-config";

export type CloverApiRegion = "na" | "eu" | "la";

export function getCloverApiRegion(): CloverApiRegion {
  const r = (process.env.CLOVER_API_REGION || "na").toLowerCase();
  if (r === "eu" || r === "la") return r;
  return "na";
}

/** Host for OAuth token, refresh, and recovery (not ecomm SCL). */
export function cloverOAuthApiOrigin(): string {
  if (getCloverEnv() !== "production") {
    return "https://apisandbox.dev.clover.com";
  }
  switch (getCloverApiRegion()) {
    case "eu":
      return "https://api.eu.clover.com";
    case "la":
      return "https://api.la.clover.com";
    default:
      return "https://api.clover.com";
  }
}

export type CloverOAuthTokenResponse = {
  access_token: string;
  access_token_expiration?: number;
  refresh_token?: string;
  refresh_token_expiration?: number;
};

export async function cloverOAuthRefresh(params: {
  client_id: string;
  refresh_token: string;
}): Promise<CloverOAuthTokenResponse | null> {
  const res = await fetch(`${cloverOAuthApiOrigin()}/oauth/v2/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: params.client_id,
      refresh_token: params.refresh_token,
    }),
  });
  if (!res.ok) return null;
  return (await res.json()) as CloverOAuthTokenResponse;
}

export async function cloverOAuthExchangeCode(params: {
  client_id: string;
  client_secret: string;
  code: string;
}): Promise<CloverOAuthTokenResponse | null> {
  const res = await fetch(`${cloverOAuthApiOrigin()}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: params.client_id,
      client_secret: params.client_secret,
      code: params.code,
    }),
  });
  if (!res.ok) return null;
  return (await res.json()) as CloverOAuthTokenResponse;
}
