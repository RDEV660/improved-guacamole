"use client";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/settings", label: "Look & email" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/staff", label: "Team" },
  { href: "/admin/services", label: "Services" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="font-display text-lg font-semibold tracking-tight text-white">
            Lily&apos;s — Admin
          </p>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {LINKS.map(({ href, label }) => {
              const on = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                    on ? "bg-pink-600/30 text-pink-200" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
