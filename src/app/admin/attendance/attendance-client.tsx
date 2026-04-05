"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type StaffRow = { id: string; name: string; role?: string };

type Props = { initialDateYMD: string };

export function AttendanceEditor({ initialDateYMD }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDateYMD);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [absent, setAbsent] = useState<Set<string>>(new Set());
  const [minYMD, setMinYMD] = useState(initialDateYMD);
  const [maxYMD, setMaxYMD] = useState(initialDateYMD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadForDate = useCallback(async (ymd: string) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/staff-absences?date=${encodeURIComponent(ymd)}`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        error?: string;
        absentStaffIds?: string[];
        staff?: StaffRow[];
        salonTodayYMD?: string;
        salonMaxBookYMD?: string;
      };
      if (!res.ok) {
        setErr(data.error ?? "Could not load attendance.");
        return;
      }
      if (Array.isArray(data.staff)) setStaff(data.staff);
      if (data.salonTodayYMD) setMinYMD(data.salonTodayYMD);
      if (data.salonMaxBookYMD) setMaxYMD(data.salonMaxBookYMD);
      setAbsent(new Set(Array.isArray(data.absentStaffIds) ? data.absentStaffIds : []));
    } catch {
      setErr("Could not load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadForDate(date);
  }, [date, loadForDate]);

  async function save() {
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff-absences", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, absentStaffIds: [...absent] }),
        credentials: "same-origin",
      });
      const text = await res.text();
      let data: { error?: string };
      try {
        data = JSON.parse(text) as { error?: string };
      } catch {
        setErr("Save failed — server returned an invalid response. Check the console or try again.");
        return;
      }
      if (!res.ok) {
        setErr(data.error ?? "Save failed.");
        return;
      }
      setMsg("Saved. Online booking will skip absent providers for this date.");
      await loadForDate(date);
      router.refresh();
    } catch {
      setErr("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(id: string) {
    setAbsent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading && staff.length === 0) {
    return <p className="text-zinc-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">
        Mark team members <strong className="text-zinc-300">absent</strong> for a given day. They will not receive new
        online appointments that day; anyone not checked stays available (subject to existing bookings).
      </p>

      <label className="block text-sm">
        <span className="text-zinc-500">Date</span>
        <input
          type="date"
          value={date}
          min={minYMD}
          max={maxYMD}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        />
      </label>

      {loading ? (
        <p className="text-zinc-500">Updating…</p>
      ) : (
        <ul className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          {staff.map((s) => (
            <li key={s.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-800/60">
                <input
                  type="checkbox"
                  checked={absent.has(s.id)}
                  onChange={() => toggle(s.id)}
                  className="size-4 rounded border-zinc-600 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-white">
                  {s.name}
                  {s.role ? <span className="ml-2 text-zinc-500">({s.role})</span> : null}
                </span>
                <span className="ml-auto text-sm text-zinc-500">{absent.has(s.id) ? "Absent" : "Available"}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving || loading}
        className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-500 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save attendance"}
      </button>
    </div>
  );
}
