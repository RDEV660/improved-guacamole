/**
 * Default theme colors — safe to import from Client Components (no Node `fs`).
 * Keep in sync with `DEFAULT_SALON_CONFIG` in `salon-config.ts`.
 */
export const DEFAULT_SALON_THEME = {
  primary: "#ff2d78",
  accent: "#ff85b4",
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#121212",
  border: "#2a2a2a",
} as const;
