"use client";

import type { SalonConfig } from "@/lib/salon-config";
import { DEFAULT_SALON_THEME } from "@/lib/salon-config-defaults";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ThemeKey = keyof SalonConfig["theme"];

const THEME_FIELDS: { key: ThemeKey; title: string; hint: string }[] = [
  { key: "primary", title: "Main brand color", hint: "Buttons, links, and highlights on your site." },
  { key: "accent", title: "Second accent", hint: "Extra pops of color that pair with your main brand color." },
  { key: "background", title: "Page background", hint: "The color behind most of the page." },
  { key: "foreground", title: "Main text", hint: "Headings and body text." },
  { key: "card", title: "Boxes & cards", hint: "Background for sections and cards." },
  { key: "border", title: "Lines & borders", hint: "Outlines and dividers." },
];

function isSixDigitHex(s: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(s.trim());
}

function normalizeHex(s: string): string {
  const t = s.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(t)) return `#${t.slice(1).toLowerCase()}`;
  if (/^[0-9A-Fa-f]{6}$/i.test(t)) return `#${t.toLowerCase()}`;
  if (/^#[0-9A-Fa-f]{3}$/i.test(t)) {
    const x = t.slice(1).toLowerCase();
    return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`;
  }
  return "#000000";
}

type Props = {
  initial: SalonConfig;
};

export function AdminSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState(initial.theme);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setThemeKey(key: ThemeKey, raw: string) {
    const next = raw.startsWith("#") ? raw : `#${raw}`;
    setTheme((t) => ({ ...t, [key]: next }));
  }

  function onBlurHex(key: ThemeKey) {
    const v = theme[key];
    if (!isSixDigitHex(v)) {
      setTheme((t) => ({ ...t, [key]: normalizeHex(v) }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    for (const { key } of THEME_FIELDS) {
      if (!isSixDigitHex(theme[key])) {
        setErr(`Color "${THEME_FIELDS.find((f) => f.key === key)?.title}" must look like #ff2d78 (six digits after #).`);
        return;
      }
    }
    setSaving(true);
    const body: SalonConfig = { theme };
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not save. Check colors, then try again.");
        return;
      }
      setMsg("Saved. Open your public site in a new tab to see color changes.");
      router.refresh();
    } catch {
      setErr("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-10">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Website colors</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Tap the color square or type the code. You don&apos;t need to know code—just pick what looks good.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme({ ...DEFAULT_SALON_THEME })}
            className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Reset to default look
          </button>
        </div>
        <ul className="mt-6 space-y-4">
          {THEME_FIELDS.map(({ key, title, hint }) => (
            <li
              key={key}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 sm:flex-row sm:items-center"
            >
              <input
                type="color"
                aria-label={`${title} picker`}
                value={isSixDigitHex(theme[key]) ? theme[key] : normalizeHex(theme[key])}
                onChange={(e) => setThemeKey(key, e.target.value)}
                className="h-14 w-16 shrink-0 cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white">{title}</div>
                <p className="text-xs text-zinc-500">{hint}</p>
                <label className="mt-2 block text-xs text-zinc-500">
                  Color code
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={(e) => setThemeKey(key, e.target.value)}
                    onBlur={() => onBlurHex(key)}
                    className="mt-1 block w-full max-w-[9rem] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
                    autoComplete="off"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {err ? (
        <p className="text-sm text-red-300" role="alert">
          {err}
        </p>
      ) : null}
      {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-pink-600 px-8 py-3 text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
