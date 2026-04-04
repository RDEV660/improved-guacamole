import { TikTokIcon } from "@/components/tiktok-icon";
import { BUSINESS_HOURS } from "@/lib/business-schedule";
import { SITE } from "@/lib/site";
import { CalendarDays, Facebook } from "lucide-react";

export function HoursSchedule() {
  return (
    <div
      id="lily-hours"
      className="scroll-mt-24 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.06] p-6 shadow-md ring-1 ring-primary/15 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CalendarDays className="size-6" aria-hidden />
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Salon Hours
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Plan Your Visit To Our Mission Location — Walk-Ins Welcome{" "}
              <span className="text-foreground/90">Tuesday Through Saturday</span>
              . We&apos;re Closed Sundays And Mondays So The Team Can Rest And Reset.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-card"
          >
            <Facebook className="size-4 text-[#1877F2]" aria-hidden />
            Updates On Facebook
          </a>
          <a
            href={SITE.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-card"
          >
            <TikTokIcon className="size-4 shrink-0" />
            TikTok
          </a>
        </div>
      </div>

      <dl className="mt-8 overflow-hidden rounded-2xl border border-border bg-background/90">
        {BUSINESS_HOURS.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col gap-0.5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4 ${
              i !== 0 ? "border-t border-border" : ""
            }`}
          >
            <dt className="font-semibold text-foreground">{row.label}</dt>
            <dd
              className={
                row.hours === "Closed"
                  ? "text-sm font-medium uppercase tracking-wide text-muted"
                  : "text-sm text-foreground sm:text-right sm:text-base"
              }
            >
              {row.hours}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Questions About Hours?</span> Call{" "}
          <a href={SITE.phoneTel} className="font-semibold text-primary underline-offset-2 hover:underline">
            {SITE.phoneDisplay}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
