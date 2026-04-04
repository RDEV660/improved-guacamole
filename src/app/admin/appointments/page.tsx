import { formatPriceUSD } from "@/lib/services";
import { loadBookings } from "@/lib/bookings-store";
import { readSalonConfig } from "@/lib/salon-config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const bookings = await loadBookings();
  const salonCfg = await readSalonConfig();
  const smtpOn = Boolean(process.env.SMTP_URL?.trim());
  const bookingEmailsReady = smtpOn && salonCfg.notifyEmails.length > 0;

  const sorted = [...bookings].sort((a, b) => {
    const da = a.date.localeCompare(b.date);
    if (da !== 0) return da;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Appointments</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {sorted.length} booking{sorted.length === 1 ? "" : "s"} from your online scheduler.
      </p>
      {!bookingEmailsReady ? (
        <div className="mt-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-medium text-amber-50">Want an email when someone books?</p>
          <p className="mt-1 text-amber-100/90">
            {smtpOn
              ? "Add one or more email addresses under Look & email so we know who to notify."
              : "Open Look & email to add addresses, and ask whoever hosts the site to turn on outgoing mail (they’ll use SMTP_URL)—then you’ll get alerts automatically."}
          </p>
          <Link
            href="/admin/settings"
            className="mt-3 inline-block font-medium text-pink-300 hover:text-pink-200 hover:underline"
          >
            Open Look, closed days & booking emails →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-500">
          New bookings are emailed to: {salonCfg.notifyEmails.join(", ")}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Services</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              sorted.map((b) => (
                <tr key={b.id} className="border-b border-zinc-800/80 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 font-medium text-zinc-200">{b.date}</td>
                  <td className="px-4 py-3 text-zinc-400">{b.startTime}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-200">{b.customerName}</div>
                    <div className="text-xs text-zinc-500">{b.customerEmail}</div>
                    <div className="text-xs text-zinc-500">{b.customerPhone}</div>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-xs text-zinc-400">
                    {b.serviceIds.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {b.assignedStaffId ?? b.preferredStaffId ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        b.paymentStatus === "paid"
                          ? "text-emerald-400"
                          : b.paymentStatus === "failed"
                            ? "text-red-400"
                            : "text-amber-300"
                      }
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-200">
                    {formatPriceUSD(b.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/appointments/${encodeURIComponent(b.id)}`}
                      className="text-pink-400 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
