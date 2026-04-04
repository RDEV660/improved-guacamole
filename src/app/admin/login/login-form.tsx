"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  /** Defer the password form until after hydration so extensions (e.g. LastPass) cannot break SSR markup. */
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    setFormReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setConfigured(d.configured === true))
      .catch(() => setConfigured(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      const from = search.get("from") || "/admin";
      router.push(from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="font-display text-2xl font-semibold text-white">Admin login</h1>
        <p className="mt-1 text-sm text-zinc-500">Owner / manager access</p>

        {configured === false ? (
          <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            Server is missing <code className="text-xs">ADMIN_PASSWORD</code> or{" "}
            <code className="text-xs">ADMIN_SESSION_SECRET</code> (16+ characters). Add them to{" "}
            <code className="text-xs">.env.local</code> and restart the dev server.
          </p>
        ) : null}

        {!formReady ? (
          <div
            className="mt-6 space-y-4"
            aria-busy="true"
            aria-label="Loading sign-in form"
          >
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-zinc-800/80" />
              <div className="h-[52px] w-full rounded-xl bg-zinc-800/50" />
            </div>
            <div className="h-12 w-full rounded-xl bg-pink-600/25" />
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="admin-pw" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <input
                id="admin-pw"
                name="admin_password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading || configured === false}
              className="w-full rounded-xl bg-pink-600 py-3 text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
