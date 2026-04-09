import { DEFAULT_SALON_THEME } from "@/lib/salon-config-defaults";
import { isRedisDataConfigured, redisGetJson, redisSetJson, REDIS_KEYS } from "@/lib/redis-data";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

const CONFIG_PATH = path.join(process.cwd(), "data", "salon-config.json");

const ThemeSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  card: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  border: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const SalonConfigSchema = z.object({
  theme: ThemeSchema,
});

export type SalonConfig = z.infer<typeof SalonConfigSchema>;

/** Accepts legacy configs that included booking-only fields. */
const LegacySalonConfigSchema = z.object({
  theme: ThemeSchema,
  blackoutDates: z.array(z.string()).optional(),
  notifyEmails: z.array(z.string().email()).optional(),
});

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  theme: { ...DEFAULT_SALON_THEME },
};

function normalizeConfig(raw: unknown): SalonConfig | null {
  const modern = SalonConfigSchema.safeParse(raw);
  if (modern.success) return modern.data;
  const legacy = LegacySalonConfigSchema.safeParse(raw);
  if (legacy.success) return { theme: legacy.data.theme };
  return null;
}

async function ensureConfigFile(): Promise<void> {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(CONFIG_PATH);
  } catch {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_SALON_CONFIG, null, 2), "utf8");
  }
}

export async function readSalonConfig(): Promise<SalonConfig> {
  if (isRedisDataConfigured()) {
    const parsed = await redisGetJson<unknown>(REDIS_KEYS.salonConfig);
    const n = normalizeConfig(parsed);
    if (n) return n;
    return DEFAULT_SALON_CONFIG;
  }
  try {
    await ensureConfigFile();
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    try {
      const parsed = JSON.parse(raw) as unknown;
      const n = normalizeConfig(parsed);
      if (n) return n;
    } catch {
      /* fall through */
    }
  } catch {
    try {
      const raw = await fs.readFile(CONFIG_PATH, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const n = normalizeConfig(parsed);
      if (n) return n;
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_SALON_CONFIG;
}

export async function writeSalonConfig(config: SalonConfig): Promise<void> {
  const parsed = SalonConfigSchema.parse(config);
  if (isRedisDataConfigured()) {
    await redisSetJson(REDIS_KEYS.salonConfig, parsed);
    return;
  }
  await ensureConfigFile();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), "utf8");
}

export function themeToCssVars(theme: SalonConfig["theme"]): string {
  return [
    `:root {`,
    `  --primary: ${theme.primary};`,
    `  --accent: ${theme.accent};`,
    `  --background: ${theme.background};`,
    `  --foreground: ${theme.foreground};`,
    `  --card: ${theme.card};`,
    `  --border: ${theme.border};`,
    `}`,
  ].join("\n");
}
