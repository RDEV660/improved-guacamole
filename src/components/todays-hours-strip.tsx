"use client";

import { SITE } from "@/lib/site";
import { Clock, Star } from "lucide-react";
import { useState } from "react";

type TodayInfo = { title: string; detail: string; tone: "open" | "closed" | "appt" };

function getTodayInfo(): TodayInfo {
  const day = new Date().getDay();
  if (day === 0) {
    return {
      title: "Closed Sundays",
      detail: "We reopen Tuesday at 10:00 AM.",
      tone: "closed",
    };
  }
  if (day === 1) {
    return {
      title: "Closed Mondays",
      detail: "We Reopen Tuesday At 10:00 AM.",
      tone: "closed",
    };
  }
  if (day >= 2 && day <= 5) {
    return {
      title: "Open Today",
      detail: "10:00 AM – 7:00 PM",
      tone: "open",
    };
  }
  return {
    title: "Open Today (Saturday)",
    detail: "9:00 AM – 5:30 PM",
    tone: "open",
  };
}

export function TodaysHoursStrip() {
  // Lazy initializer: runs once on mount — no useEffect, so nothing can get “stuck” loading.
  const [info] = useState<TodayInfo>(getTodayInfo);

  const clockClass =
    info.tone === "open"
      ? "text-primary"
      : info.tone === "closed"
        ? "text-muted"
        : "text-accent";

  return (
    <div className="mt-10 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
      <div className="flex items-start gap-2 sm:items-center">
        <Clock className={`mt-0.5 size-4 shrink-0 sm:mt-0 ${clockClass}`} aria-hidden />
        <div>
          <span className="font-semibold text-foreground">{info.title}</span>
          <span className="text-muted"> · </span>
          <span className="text-muted">{info.detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Star className="size-4 shrink-0 text-accent" aria-hidden />
        <span className="text-muted">
          Loved on{" "}
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            Facebook
          </a>
          ,{" "}
          <a
            href={SITE.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            TikTok
          </a>{" "}
          &amp; Google
        </span>
      </div>
    </div>
  );
}
