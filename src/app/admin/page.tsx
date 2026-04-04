import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Simple tools for your salon—no code. Pick colors, who gets booking emails, team names, deals, and services.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/admin/appointments", title: "Appointments", desc: "See who booked and when." },
          {
            href: "/admin/attendance",
            title: "Provider attendance",
            desc: "Mark who is absent so online booking skips them for that day.",
          },
          {
            href: "/admin/settings",
            title: "Look & email",
            desc: "Website colors, closed days, and email alerts for new bookings.",
          },
          { href: "/admin/deals", title: "Deals", desc: "Special offers and promos you can show on the site." },
          {
            href: "/admin/staff",
            title: "Team",
            desc: "Staff names and roles. (Online booking may still use the built-in provider list until updated.)",
          },
          {
            href: "/admin/services",
            title: "Services",
            desc: "What clients can book—edit names, prices, and lengths here.",
          },
        ].map((x) => (
          <li key={x.href}>
            <Link
              href={x.href}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-pink-500/40 hover:bg-zinc-900"
            >
              <span className="font-semibold text-white">{x.title}</span>
              <span className="mt-1 block text-sm text-zinc-500">{x.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
