"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ServicesJsonEditor() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services-json")
      .then((r) => r.text())
      .then(setText)
      .catch(() => setErr("Could not load services."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/services-json", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: text,
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErr(data.error ?? "Save failed.");
      return;
    }
    setMsg("Saved. Restart the dev server (or redeploy) so the booking page picks up changes.");
    router.refresh();
  }

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Each service needs an id, category, name, how long it takes (minutes), and price. If something looks wrong after
        saving, use Undo in your editor or restore from backup—invalid data won&apos;t save.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="h-[min(70vh,520px)] w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-mono text-xs text-zinc-200"
      />
      {err ? <p className="text-sm text-red-300">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-500"
      >
        Save services
      </button>
    </div>
  );
}
