export type CloverEnv = "sandbox" | "production";

export function getCloverEnv(): CloverEnv {
  const v = process.env.CLOVER_ENV ?? process.env.NEXT_PUBLIC_CLOVER_ENV;
  return v === "production" ? "production" : "sandbox";
}

export function cloverTokenBaseUrl(): string {
  return getCloverEnv() === "production"
    ? "https://token.clover.com"
    : "https://token-sandbox.dev.clover.com";
}

export function cloverEcomBaseUrl(): string {
  return getCloverEnv() === "production"
    ? "https://scl.clover.com"
    : "https://scl-sandbox.dev.clover.com";
}

export function getCloverAccessToken(): string | undefined {
  return process.env.CLOVER_ACCESS_TOKEN?.trim() || undefined;
}

export function getCloverPakmsKey(): string | undefined {
  return (
    process.env.CLOVER_PAKMS_KEY?.trim() ||
    process.env.NEXT_PUBLIC_CLOVER_PAKMS_KEY?.trim() ||
    undefined
  );
}
