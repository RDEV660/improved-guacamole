"use client";

import type { Deal } from "@/lib/salon-deals";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `deal-${Date.now()}`;
}

export function DealsEditor() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/deals")
      .then((r) => r.json())
      .then((d: { deals?: Deal[] }) => {
        setDeals(Array.isArray(d.deals) ? d.deals : []);
      })
      .catch(() => setErr("Could not load deals."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/deals", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deals }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErr(data.error ?? "Save failed.");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">
        Toggle <strong className="text-zinc-300">Active</strong> when you want this deal to be available to show on the
        site.
      </p>
      <ul className="space-y-4">
        {deals.map((d, i) => (
          <li key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-zinc-500">Title</span>
                <input
                  value={d.title}
                  onChange={(e) => {
                    const next = [...deals];
                    next[i] = { ...d, title: e.target.value };
                    setDeals(next);
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm">
                <span className="text-zinc-500">Promo code (optional)</span>
                <input
                  value={d.promoCode ?? ""}
                  onChange={(e) => {
                    const next = [...deals];
                    next[i] = { ...d, promoCode: e.target.value || undefined };
                    setDeals(next);
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="text-zinc-500">Description</span>
                <textarea
                  value={d.description}
                  onChange={(e) => {
                    const next = [...deals];
                    next[i] = { ...d, description: e.target.value };
                    setDeals(next);
                  }}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={d.active}
                  onChange={(e) => {
                    const next = [...deals];
                    next[i] = { ...d, active: e.target.checked };
                    setDeals(next);
                  }}
                />
                Active
              </label>
            </div>
            <button
              type="button"
              className="mt-3 text-sm text-red-400 hover:underline"
              onClick={() => setDeals(deals.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        onClick={() =>
          setDeals([
            ...deals,
            {
              id: newId(),
              title: "New deal",
              description: "",
              active: true,
            },
          ])
        }
      >
        Add deal
      </button>
      {err ? <p className="text-sm text-red-300">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-500"
      >
        Save all deals
      </button>
    </div>
  );
}
