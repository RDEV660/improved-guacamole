import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Simple tools for your salon—no code. Pick colors, team names, and deals for the site.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          {
            href: "/admin/settings",
            title: "Look",
            desc: "Website colors and branding.",
          },
          { href: "/admin/deals", title: "Deals", desc: "Special offers and promos you can show on the site." },
          {
            href: "/admin/staff",
            title: "Team",
            desc: "Staff names and roles shown on the site.",
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
