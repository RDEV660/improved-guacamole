import { HoursSchedule } from "@/components/hours-schedule";
import { InstagramWorkGallery } from "@/components/instagram-work-gallery";
import { MapEmbed } from "@/components/map-embed";
import { TikTokIcon } from "@/components/tiktok-icon";
import { TodaysHoursStrip } from "@/components/todays-hours-strip";
import { SITE } from "@/lib/site";
import {
  CreditCard,
  Droplets,
  Facebook,
  Heart,
  Instagram,
  MapPin,
  Palette,
  Phone,
  Scissors,
  Sparkle,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Users,
    title: "Walk-Ins Welcome",
    body: "Stop By When It Works For You — We’re Happy To Fit You In When We Can.",
  },
  {
    icon: CreditCard,
    title: "Pay With Clover",
    body: "Book Online And Pay Securely — We Process Cards Through Clover.",
  },
] as const;

const SERVICES = [
  {
    icon: Sparkles,
    title: "Nails & Pedicures",
    body: "Manicures, Pedicures, And Polish — From Classic Sets To Nail Art For Every Occasion.",
  },
  {
    icon: Heart,
    title: "Facials",
    body: "Facials In A Calm Room — We’ll Help You Choose What Fits Your Goals.",
  },
  {
    icon: Droplets,
    title: "Korean Scalp Treatments",
    body: "Korean-Inspired Scalp Care — Deep Scalp Analysis, Detox, And Cleanse — Guests Often Choose It For Hair Growth And A Healthier Scalp With Treatment.",
  },
  {
    icon: Scissors,
    title: "Hair",
    body: "Women’s And Men’s Haircuts, Styling, Blow-Dry And Blowouts, Highlights, Balayage, Extensions, And Updos.",
  },
  {
    icon: Palette,
    title: "Makeup",
    body: "Event-Ready Makeup And Soft Glam — Ask What’s Available When You Book For Photos, Parties, Or A Night Out.",
  },
  {
    icon: Sparkle,
    title: "Waxing",
    body: "Smooth, Precise Waxing — Ask What Areas We Offer When You Book Or Walk In.",
  },
] as const;

const REVIEWS = [
  {
    quote:
      "All the staff is super friendly and I highly recommend this place to everyone!",
    name: "Christine Estrada",
  },
  {
    quote:
      "Friendly service, comfortable atmosphere that made me feel at home.",
    name: "Sylvia Garza",
  },
  {
    quote:
      "Would forever recommend her and this location for all the services they offer.",
    name: "Jessica Hernandez",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section
        id="top"
        className="hero-grain relative overflow-hidden border-b border-border scroll-mt-20"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(255,45,120,0.2),transparent)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(255,133,180,0.1),transparent)]" />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">
            Mission, Texas
          </p>
          <div className="mt-3 h-px w-12 bg-primary/70" aria-hidden />
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            First-Class Service At{" "}
            <span className="text-primary">Lily&apos;s Beauty Lounge</span>
            <span className="text-foreground"> — Your One-Stop Beauty Lounge.</span>
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-wide text-primary sm:text-base">
            {SITE.serviceLine}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            We Deliver First-Class Customer Service In A Full-Service Mission Salon:{" "}
            <span className="font-medium text-foreground">
              Nails, Facials, Korean Scalp Treatments, Hair, Makeup, Waxing, And Pedicures
            </span>{" "}
            — So You Can Take Care Of Everything In One Welcoming Stop. Walk-Ins
            Welcome When We Have Room.
          </p>
          <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="/book"
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 sm:flex-none"
            >
              <Sparkles className="size-4 shrink-0" aria-hidden />
              Book Online
            </a>
            <a
              href={SITE.phoneTel}
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary/50 bg-transparent px-6 text-sm font-semibold text-primary hover:bg-primary/10 sm:flex-none"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              Call {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.mapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground hover:border-primary/40 sm:flex-none"
            >
              <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
              Directions
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground hover:border-primary/40 sm:flex-none"
            >
              <Instagram className="size-4 shrink-0" aria-hidden />
              Instagram
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground hover:border-primary/40 sm:flex-none"
            >
              <Facebook className="size-4 shrink-0 text-[#1877F2]" aria-hidden />
              Facebook
            </a>
            <a
              href={SITE.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="lilys-btn-motion inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground hover:border-primary/40 sm:flex-none"
            >
              <TikTokIcon className="size-4 shrink-0" />
              TikTok
            </a>
          </div>
          <TodaysHoursStrip />
        </div>
      </section>

      <section
        id="instagram-showcase"
        className="scroll-mt-20 border-b border-border bg-card/30 py-14 sm:py-20"
        aria-labelledby="instagram-showcase-heading"
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2
            id="instagram-showcase-heading"
            className="font-display text-2xl font-semibold uppercase tracking-wide text-foreground sm:text-3xl"
          >
            Work &amp; Inspiration — Instagram &amp; TikTok
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted sm:text-base">
            Four Looping Previews From The Chair — Story Highlights On @{SITE.instagramHandle} And
            Clips On TikTok. Tap A Card Or Circle To Open Instagram Or{" "}
            <span className="font-medium text-foreground">Our TikTok Profile</span>.
          </p>
        </div>
        <div className="mt-10">
          <InstagramWorkGallery />
        </div>
      </section>

      <section
        id="lily-services"
        className="scroll-mt-20 border-y border-border bg-card/40 py-14 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Services
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            One Place For{" "}
            <span className="font-medium text-foreground">
              Nails, Scalp, Hair, Facials, Makeup, Waxing, And Pedicures
            </span>{" "}
            — Ask What&apos;s Right For You When You Book Or Arrive.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="lilys-card-hover flex flex-col rounded-2xl border border-border bg-background p-6"
              >
                <Icon className="size-8 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="lily-reviews"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Reviews
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Kind Words From Guests Who&apos;ve Visited Lily&apos;s Beauty Lounge.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <li
              key={r.name}
              className="lilys-card-hover rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-0.5 text-accent" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-medium text-primary">— {r.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="lily-visit"
        className="scroll-mt-20 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
        aria-labelledby="lily-visit-heading"
      >
        <h2
          id="lily-visit-heading"
          className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Visit Us In Mission
        </h2>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
          Find Us At {SITE.address}. Easy Parking And A Warm, Welcoming Space. Walk
          In Tuesday–Saturday; We&apos;re Closed Sundays And Mondays.
        </p>

        <div className="mt-10">
          <HoursSchedule />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col justify-center space-y-4 rounded-2xl border border-border bg-card/50 p-6 text-sm sm:p-8 sm:text-base">
            <p className="flex items-start gap-3 text-foreground">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <span>{SITE.address}</span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-primary" aria-hidden />
              <a
                href={SITE.phoneTel}
                className="font-semibold text-primary hover:underline"
              >
                {SITE.phoneDisplay}
              </a>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={SITE.mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="lilys-btn-motion inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                Open In Google Maps
              </a>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="lilys-btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground hover:border-primary/40"
              >
                <Facebook className="size-4 text-[#1877F2]" aria-hidden />
                Facebook Page
              </a>
              <a
                href={SITE.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="lilys-btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground hover:border-primary/40"
              >
                <TikTokIcon className="size-4 shrink-0" />
                TikTok
              </a>
            </div>
          </div>
          <MapEmbed />
        </div>
      </section>

      <section
        id="why-visit"
        className="scroll-mt-20 border-t border-border bg-card/30 py-14 sm:py-20"
        aria-labelledby="why-visit-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="why-visit-heading"
            className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Why Visit Us
          </h2>
          <p className="mt-3 max-w-3xl text-pretty text-sm font-medium leading-relaxed text-foreground sm:text-base">
            Where Beauty Meets Confidence — Personalized Services, Relaxed Vibes,
            And Results That Make You Feel Your Absolute Best.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="lilys-card-hover rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
