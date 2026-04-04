import { InstagramHighlightVideo } from "@/components/instagram-highlight-video";
import { TikTokIcon } from "@/components/tiktok-icon";
import { INSTAGRAM_FEATURED_POSTS, SITE } from "@/lib/site";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Heart, Instagram, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

function postUrl(kind: "p" | "reel", id: string) {
  const path = kind === "reel" ? `reel/${id}` : `p/${id}`;
  return `https://www.instagram.com/${path}/`;
}

/** Instagram-style highlight ring (brand pink gradient). */
const HIGHLIGHT_RING =
  "bg-gradient-to-tr from-[#ff85b4] via-[#ff2d78] to-[#c9186b] p-[3px]";

type HighlightStripItem =
  | {
      label: string;
      href: string;
      aria: string;
      thumb: "logo";
    }
  | {
      label: string;
      href: string;
      aria: string;
      thumb: "tiktokVideo";
    };

/** Same destinations as the large tiles — three IG highlights + TikTok profile. */
const HIGHLIGHT_STRIP: readonly HighlightStripItem[] = [
  {
    label: "Nails",
    href: SITE.instagramHighlightNails,
    aria: "Open Nails story highlight on Instagram",
    thumb: "logo",
  },
  {
    label: "Facials",
    href: SITE.instagramHighlightFacials,
    aria: "Open Facials story highlight on Instagram",
    thumb: "logo",
  },
  {
    label: "Reels",
    href: SITE.instagramHighlightReels,
    aria: "Open Reels & stories highlight on Instagram",
    thumb: "logo",
  },
  {
    label: "TikTok",
    href: SITE.tiktok,
    aria: "Open Lily's Beauty Lounge on TikTok",
    thumb: "tiktokVideo",
  },
];

type CornerIcon = LucideIcon | ComponentType<{ className?: string }>;

const PREVIEW_TILES: readonly {
  title: string;
  subtitle: string;
  icon: CornerIcon;
  href: string;
  cta: string;
  videoSrc: string;
  videoLabel: string;
  minClass: string;
  bubbleClass: string;
}[] = [
  {
    title: "Nails & Color",
    subtitle: "Sets, Art & Polish",
    icon: Sparkles,
    href: SITE.instagramHighlightNails,
    cta: "View Nails On Instagram",
    videoSrc: SITE.galleryVideoNails,
    videoLabel: "Nails And Color — Preview Video",
    minClass: "min-h-[200px]",
    bubbleClass: "size-[4rem] sm:size-[4.5rem]",
  },
  {
    title: "Facials & Glow",
    subtitle: "Facial Days",
    icon: Heart,
    href: SITE.instagramHighlightFacials,
    cta: "View Facials On Instagram",
    videoSrc: SITE.galleryVideoFacials,
    videoLabel: "Facials And Glow — Preview Video",
    minClass: "min-h-[200px]",
    bubbleClass: "size-[4rem] sm:size-[4.5rem]",
  },
  {
    title: "Reels & Stories",
    subtitle: "Behind The Chair",
    icon: Instagram,
    href: SITE.instagramHighlightReels,
    cta: "View Reels & Stories",
    videoSrc: SITE.galleryVideoReels,
    videoLabel: "Reels And Stories — Preview Video",
    minClass: "min-h-[200px]",
    bubbleClass: "size-[4rem] sm:size-[4.5rem]",
  },
  {
    title: "TikTok Clips",
    subtitle: "From The Chair",
    icon: TikTokIcon,
    href: SITE.tiktok,
    cta: "Open Our TikTok",
    videoSrc: SITE.galleryVideoTiktok,
    videoLabel: "TikTok — Preview Video",
    minClass: "min-h-[200px]",
    bubbleClass: "size-[4rem] sm:size-[4.5rem]",
  },
];

export function InstagramWorkGallery() {
  const featured = INSTAGRAM_FEATURED_POSTS;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <nav
        aria-label="Instagram story highlights and TikTok"
        className="mb-10 flex flex-wrap items-start justify-center gap-6 sm:gap-10"
      >
        {HIGHLIGHT_STRIP.map((h) => (
          <a
            key={h.label}
            href={h.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={h.aria}
          >
            <div
              className={`rounded-full shadow-md transition-transform group-hover:scale-105 ${HIGHLIGHT_RING} p-[3px]`}
            >
              <div className="relative flex size-[4.25rem] items-center justify-center overflow-hidden rounded-full bg-black ring-2 ring-black/60 sm:size-[4.75rem]">
                {h.thumb === "tiktokVideo" ? (
                  <InstagramHighlightVideo
                    src={SITE.galleryVideoTiktok}
                    className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-center"
                    aria-label="TikTok clip — looping preview"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center p-[12%]">
                    <Image
                      src="/lilys-logo.png"
                      alt=""
                      width={120}
                      height={120}
                      className="size-full object-contain object-center"
                    />
                  </div>
                )}
              </div>
            </div>
            <span className="max-w-[5.5rem] text-center text-xs font-semibold uppercase tracking-wide text-foreground">
              {h.label}
            </span>
          </a>
        ))}
      </nav>

      <p className="mx-auto mb-8 max-w-xl text-center text-sm leading-relaxed text-muted">
        Four Cards Loop Short Previews — Instagram Tiles Open Story Highlights; TikTok Opens Our
        Profile. Best In The Instagram App Or A Logged-In Browser.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:min-h-[260px]">
        {PREVIEW_TILES.map((tile) => {
          const Icon = tile.icon;
          const isTikTokIcon = Icon === TikTokIcon;
          return (
            <div
              key={tile.title}
              className={`group flex flex-col rounded-3xl shadow-md ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-white/20 ${HIGHLIGHT_RING} ${tile.minClass}`}
            >
              <div className="relative flex min-h-0 w-full flex-1 flex-col justify-end overflow-hidden rounded-[1.3125rem] bg-card">
                {/* Video outside <a> so muted autoplay isn’t blocked (nested interactive content). */}
                <InstagramHighlightVideo
                  src={tile.videoSrc}
                  className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  aria-label={tile.videoLabel}
                />

                <div
                  className="pointer-events-none absolute left-4 top-4 z-[2] sm:left-5 sm:top-5"
                  aria-hidden
                >
                  <div
                    className={`shrink-0 rounded-full shadow-lg ${HIGHLIGHT_RING} ${tile.bubbleClass}`}
                  >
                    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-black p-[10%] ring-2 ring-black/60">
                      <Image
                        src="/lilys-logo.png"
                        alt=""
                        width={120}
                        height={120}
                        className="size-full object-contain object-center"
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/92 via-black/45 to-black/20"
                  aria-hidden
                />

                <a
                  href={tile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-[3] rounded-[1.3125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  aria-label={`${tile.title} — ${tile.cta}`}
                >
                  <span className="sr-only">{tile.cta}</span>
                </a>

                <div className="pointer-events-none relative z-[4] flex flex-col justify-end p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0 pt-10 sm:pt-12">
                      <p className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {tile.title}
                      </p>
                      <p className="mt-1 text-sm text-white/80">{tile.subtitle}</p>
                    </div>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-black/35 text-primary shadow-sm ring-1 ring-white/15 backdrop-blur-sm transition-transform group-hover:scale-105">
                      {isTikTokIcon ? (
                        <Icon className="size-6" />
                      ) : (
                        <Icon className="size-6" aria-hidden />
                      )}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {tile.cta}
                    <ExternalLink className="size-3.5 opacity-80" aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
        <a
          href={SITE.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 sm:w-auto"
        >
          <Instagram className="size-5" aria-hidden />
          Open @lilys.beauty.lounge
        </a>
        <a
          href={SITE.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full border border-border bg-card px-8 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/40 sm:w-auto"
        >
          <TikTokIcon className="size-5 shrink-0" />
          TikTok Videos
        </a>
      </div>

      {featured.length > 0 ? (
        <div className="mt-12 border-t border-border pt-10">
          <h3 className="text-center font-display text-lg font-semibold text-foreground sm:text-xl">
            Featured Posts
          </h3>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted">
            Opens In Instagram — No Broken Embeds.
          </p>
          <ul className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:mx-0 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            {featured.map((post) => (
              <li key={`${post.kind}-${post.id}`}>
                <a
                  href={postUrl(post.kind, post.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-background sm:w-auto"
                >
                  <Instagram className="size-4 shrink-0 text-primary" aria-hidden />
                  View Post
                  <ExternalLink className="size-3.5 text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
