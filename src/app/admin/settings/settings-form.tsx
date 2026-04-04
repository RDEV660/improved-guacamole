"use client";

import type { SalonConfig } from "@/lib/salon-config";
import { DEFAULT_SALON_THEME } from "@/lib/salon-config-defaults";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  /** True when the server has SMTP_URL set (hosting mail). */
  smtpConfigured: boolean;
};

export function AdminSettingsForm({ initial, smtpConfigured }: Props) {
  const router = useRouter();
  const [theme, setTheme] = useState(initial.theme);
  const [blackoutDates, setBlackoutDates] = useState<string[]>(() =>
    [...initial.blackoutDates].sort(),
  );
  const [notifyEmails, setNotifyEmails] = useState<string[]>(initial.notifyEmails);
  const [datePick, setDatePick] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const alertsFullyOn = smtpConfigured && notifyEmails.length > 0;

  const friendlyBlackoutPreview = useMemo(() => {
    return blackoutDates.map((d) => {
      const [y, m, day] = d.split("-").map(Number);
      if (!y || !m || !day) return d;
      try {
        return new Date(y, m - 1, day).toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return d;
      }
    });
  }, [blackoutDates]);

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

  function addBlackoutFromPicker() {
    if (!datePick) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePick)) return;
    setBlackoutDates((prev) => [...new Set([...prev, datePick])].sort());
    setDatePick("");
  }

  function removeBlackout(d: string) {
    setBlackoutDates((prev) => prev.filter((x) => x !== d));
  }

  function applyBulkBlackouts() {
    const parts = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
    setBlackoutDates((prev) => [...new Set([...prev, ...parts])].sort());
    setBulkText("");
  }

  function addEmail() {
    const e = emailDraft.trim().toLowerCase();
    if (!e || !e.includes("@")) {
      setErr("Enter a valid email address.");
      return;
    }
    setErr(null);
    if (notifyEmails.includes(e)) {
      setEmailDraft("");
      return;
    }
    setNotifyEmails((prev) => [...prev, e]);
    setEmailDraft("");
  }

  function removeEmail(e: string) {
    setNotifyEmails((prev) => prev.filter((x) => x !== e));
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
    const body: SalonConfig = { theme, blackoutDates, notifyEmails };
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not save. Check colors and dates, then try again.");
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

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Closed days (no online booking)</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Add holidays or days you&apos;re closed. Clients won&apos;t be able to pick those days on the booking page.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-sm text-zinc-400">
            Pick a date
            <input
              type="date"
              value={datePick}
              onChange={(e) => setDatePick(e.target.value)}
              className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
          </label>
          <button
            type="button"
            onClick={addBlackoutFromPicker}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
          >
            Add this day
          </button>
        </div>
        {blackoutDates.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {blackoutDates.map((d, i) => (
              <li
                key={d}
                className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200"
              >
                <span title={d}>{friendlyBlackoutPreview[i] ?? d}</span>
                <button
                  type="button"
                  onClick={() => removeBlackout(d)}
                  className="text-zinc-500 hover:text-red-300"
                  aria-label={`Remove ${d}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No extra closed days yet (your normal weekly hours still apply).</p>
        )}
        <details className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
          <summary className="cursor-pointer text-sm font-medium text-zinc-300">Paste several dates at once</summary>
          <p className="mt-2 text-xs text-zinc-500">
            One date per line, format <span className="text-zinc-400">2026-12-25</span> (year-month-day).
          </p>
          <div className="mt-2 space-y-2">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
              placeholder={"2026-12-25\n2026-01-01"}
            />
            <button
              type="button"
              onClick={applyBulkBlackouts}
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600"
            >
              Add pasted dates
            </button>
          </div>
        </details>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Email when someone books</h2>
        <p className="mt-1 text-sm text-zinc-400">
          We&apos;ll send the details of each new appointment to the addresses you list. Your website host must enable
          outgoing email once (see status below)—you only manage who receives the messages here.
        </p>

        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            alertsFullyOn
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : "border-amber-500/40 bg-amber-500/10 text-amber-100"
          }`}
        >
          {alertsFullyOn ? (
            <>
              <p className="font-medium text-emerald-50">Email alerts are on</p>
              <p className="mt-1 text-emerald-100/90">
                New bookings will be emailed to: {notifyEmails.join(", ")}
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-amber-50">Finish setup to get booking emails</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-100/90">
                {notifyEmails.length === 0 ? (
                  <li>Add at least one email address below.</li>
                ) : (
                  <li>
                    You have {notifyEmails.length} address{notifyEmails.length === 1 ? "" : "es"} saved—good.
                  </li>
                )}
                {!smtpConfigured ? (
                  <li>
                    Ask whoever hosts this site to add <strong className="font-semibold">SMTP_URL</strong> (and
                    optionally <strong className="font-semibold">SMTP_FROM</strong>) to the server environment. That
                    turns on outgoing mail—no extra services required beyond your mail provider.
                  </li>
                ) : (
                  <li>Outgoing mail is configured on the server.</li>
                )}
              </ul>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-2">
          <label className="min-w-[200px] flex-1 text-sm text-zinc-400">
            Email address
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              placeholder="you@yourbusiness.com"
              autoComplete="email"
            />
          </label>
          <button
            type="button"
            onClick={addEmail}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500"
          >
            Add recipient
          </button>
        </div>
        {notifyEmails.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {notifyEmails.map((em) => (
              <li
                key={em}
                className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              >
                <span>{em}</span>
                <button
                  type="button"
                  onClick={() => removeEmail(em)}
                  className="shrink-0 text-zinc-500 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
        {saving ? "Saving…" : "Save all settings"}
      </button>
    </form>
  );
}
