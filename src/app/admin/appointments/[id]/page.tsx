import { loadBookings } from "@/lib/bookings-store";
import { formatPriceUSD } from "@/lib/services";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminAppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  const bookings = await loadBookings();
  const b = bookings.find((x) => x.id === id);
  if (!b) notFound();

  return (
    <div>
      <Link href="/admin/appointments" className="text-sm text-pink-400 hover:underline">
        ← All appointments
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-white">Booking detail</h1>
      <p className="mt-1 font-mono text-sm text-zinc-500">{b.id}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs font-semibold uppercase text-zinc-500">When</dt>
          <dd className="mt-1 text-lg text-white">
            {b.date} at {b.startTime}
          </dd>
          <dd className="text-sm text-zinc-400">{b.durationMin} minutes</dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <dt className="text-xs font-semibold uppercase text-zinc-500">Payment</dt>
          <dd className="mt-1 text-lg text-white">{formatPriceUSD(b.totalCents)}</dd>
          <dd className="text-sm text-zinc-400">{b.paymentStatus}</dd>
          {b.cloverChargeId ? (
            <dd className="mt-1 font-mono text-xs text-zinc-500">Clover: {b.cloverChargeId}</dd>
          ) : null}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase text-zinc-500">Customer</dt>
          <dd className="mt-1 text-white">{b.customerName}</dd>
          <dd className="text-zinc-400">{b.customerEmail}</dd>
          <dd className="text-zinc-400">{b.customerPhone}</dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase text-zinc-500">Services</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {b.serviceIds.map((id) => (
              <span key={id} className="rounded-lg bg-zinc-800 px-2 py-1 text-sm text-zinc-200">
                {id}
              </span>
            ))}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase text-zinc-500">Staff</dt>
          <dd className="mt-1 text-zinc-200">Preferred: {b.preferredStaffId ?? "—"}</dd>
          <dd className="text-zinc-200">Assigned: {b.assignedStaffId ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
