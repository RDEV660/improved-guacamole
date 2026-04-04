"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Member = { id: string; name: string; role?: string };

export function StaffDirectoryEditor() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/staff-directory")
      .then((r) => r.json())
      .then((d: { members?: Member[] }) => {
        setMembers(Array.isArray(d.members) ? d.members : []);
      })
      .catch(() => setErr("Could not load staff directory."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/admin/staff-directory", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ members }),
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
        Use short IDs only with letters, numbers, and dashes (example: <span className="text-zinc-400">maria</span>).
        If you&apos;re not sure, leave the ID as it is.
      </p>
      <ul className="space-y-3">
        {members.map((m, i) => (
          <li key={m.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <label className="text-sm">
              <span className="text-zinc-500">Short ID (for the system)</span>
              <input
                value={m.id}
                onChange={(e) => {
                  const next = [...members];
                  next[i] = { ...m, id: e.target.value };
                  setMembers(next);
                }}
                className="mt-1 w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
              />
            </label>
            <label className="text-sm">
              <span className="text-zinc-500">Display name</span>
              <input
                value={m.name}
                onChange={(e) => {
                  const next = [...members];
                  next[i] = { ...m, name: e.target.value };
                  setMembers(next);
                }}
                className="mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm">
              <span className="text-zinc-500">Title / role (optional)</span>
              <input
                value={m.role ?? ""}
                onChange={(e) => {
                  const next = [...members];
                  next[i] = { ...m, role: e.target.value || undefined };
                  setMembers(next);
                }}
                className="mt-1 w-40 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              />
            </label>
            <button
              type="button"
              className="text-sm text-red-400 hover:underline"
              onClick={() => setMembers(members.filter((_, j) => j !== i))}
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
          setMembers([...members, { id: `person-${members.length + 1}`, name: "New team member", role: "" }])
        }
      >
        Add team member
      </button>
      {err ? <p className="text-sm text-red-300">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-300">{msg}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-500"
      >
        Save team
      </button>
    </div>
  );
}
