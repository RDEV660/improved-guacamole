/**
 * Display hours for the public site (Mission, TX).
 */

/** One row per site copy — human-readable hours. */
export const BUSINESS_HOURS_ROWS = [
  { label: "Monday", hours: "Closed" as const },
  { label: "Tuesday – Friday", hours: "10:00 AM – 7:00 PM" as const },
  { label: "Saturday", hours: "9:00 AM – 5:30 PM" as const },
  { label: "Sunday", hours: "Closed" as const },
] as const;

/** Alias for components that expect `BUSINESS_HOURS` (same shape as before). */
export const BUSINESS_HOURS = BUSINESS_HOURS_ROWS;
