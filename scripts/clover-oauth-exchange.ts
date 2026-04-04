/**
 * Exchange a one-time Clover v2 OAuth `code` for access + refresh tokens (high-trust app).
 *
 * Usage (from repo root, with .env.local loaded or env vars set):
 *   npx tsx scripts/clover-oauth-exchange.ts <AUTHORIZATION_CODE>
 *
 * Or set CLOVER_OAUTH_CODE instead of argv.
 *
 * Requires: CLOVER_APP_ID, CLOVER_APP_SECRET, CLOVER_ENV (sandbox|production), optional CLOVER_API_REGION (na|eu|la)
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const code = (process.argv[2] || process.env.CLOVER_OAUTH_CODE || "").trim();
  const client_id = (process.env.CLOVER_APP_ID || "").trim();
  const client_secret = (process.env.CLOVER_APP_SECRET || "").trim();

  if (!code) {
    console.error("Missing authorization code. Pass as argv or set CLOVER_OAUTH_CODE.");
    process.exit(1);
  }
  if (!client_id || !client_secret) {
    console.error("Set CLOVER_APP_ID and CLOVER_APP_SECRET.");
    process.exit(1);
  }

  const production = (process.env.CLOVER_ENV || process.env.NEXT_PUBLIC_CLOVER_ENV || "sandbox") === "production";
  const region = (process.env.CLOVER_API_REGION || "na").toLowerCase();
  let origin: string;
  if (!production) {
    origin = "https://apisandbox.dev.clover.com";
  } else if (region === "eu") {
    origin = "https://api.eu.clover.com";
  } else if (region === "la") {
    origin = "https://api.la.clover.com";
  } else {
    origin = "https://api.clover.com";
  }

  const res = await fetch(`${origin}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id, client_secret, code }),
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    console.error("Token exchange failed:", res.status, data);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
  console.log("\n--- Vercel / .env.local ---");
  console.log("Set CLOVER_ACCESS_TOKEN to access_token from the JSON above.");
  if (typeof data === "object" && data && "refresh_token" in data) {
    console.log("Set CLOVER_REFRESH_TOKEN to refresh_token (keep secret).");
    console.log("Set CLOVER_APP_ID to the same App ID you used here.");
    console.log(
      "On Vercel with Upstash Redis: after the first token refresh, new tokens are stored under lilys:data:clover-oauth — keep CLOVER_REFRESH_TOKEN updated if you rotate outside the app."
    );
  }
  console.log(
    "Fetch PAKMS with your merchant access token: https://docs.clover.com/dev/reference/getapikey — set CLOVER_PAKMS_KEY."
  );
}

void main();
