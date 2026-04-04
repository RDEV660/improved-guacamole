/**
 * Canonical origin for metadata (Open Graph, canonical URL).
 *
 * Set in `.env.local`:
 *   NEXT_PUBLIC_SITE_URL=https://your-domain.com
 *
 * On Vercel, if unset, falls back to the deployment URL. Local dev defaults to localhost.
 */
export function getSiteCanonicalUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}
