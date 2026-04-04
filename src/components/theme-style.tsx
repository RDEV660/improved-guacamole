import { readSalonConfig, themeToCssVars } from "@/lib/salon-config";

/** Server-only: overrides :root CSS variables from data/salon-config.json */
export async function ThemeStyle() {
  const cfg = await readSalonConfig();
  const css = themeToCssVars(cfg.theme);
  return <style id="salon-theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
