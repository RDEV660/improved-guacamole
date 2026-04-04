"use client";

import { SITE } from "@/lib/site";
import { TikTokIcon } from "@/components/tiktok-icon";
import { Calendar, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-foreground">
              Lily&apos;s Beauty Lounge
            </p>
            <p className="mt-1 text-sm text-muted">
              Full-Service Beauty Salon · Mission, Texas
            </p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
              Tue–Fri 10–7 · Sat 9–5:30 · Sun By Appointment · Mon Closed
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Calendar className="size-4 shrink-0" aria-hidden />
              Book online
            </Link>
            <a
              href={SITE.mapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-xs items-start gap-2 rounded-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {SITE.address}
            </a>
            <a
              href={SITE.phoneTel}
              className="inline-flex items-center gap-2 rounded-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Instagram className="size-4 shrink-0" aria-hidden />
              @lilys.beauty.lounge
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <Facebook className="size-4 shrink-0 text-[#1877F2]" aria-hidden />
              Facebook
            </a>
            <a
              href={SITE.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <TikTokIcon className="size-4 shrink-0" />
              TikTok
            </a>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Lily&apos;s Beauty Lounge. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
