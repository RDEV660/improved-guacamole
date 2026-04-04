const SITE_ADDRESS_LINE = "722 E 8th St Suite D, Mission, TX 78572";

export const SITE = {
  name: "Lily's Beauty Lounge",
  /** Short line for OG / subtitles */
  serviceLine:
    "Nails · Facials · Korean Scalp · Hair · Makeup · Wax · Pedicures",
  /** Meta / schema — full-service positioning */
  seoDescription:
    "Full-service beauty salon in Mission, TX — first-class customer service. Nails, Pedicures, Facials, Korean Scalp Treatments, Hair, Makeup, Waxing, and more. Your one-stop visit. Walk-ins welcome Tue–Sat. Call (956) 680-8271.",
  address: SITE_ADDRESS_LINE,
  phoneDisplay: "(956) 680-8271",
  phoneTel: "tel:+19566808271",
  instagram: "https://www.instagram.com/lilys.beauty.lounge/",
  /** Handle only (no @) — used for the official profile embed grid */
  instagramHandle: "lilys.beauty.lounge",
  /** Story highlights — linked from the home page gallery tiles */
  instagramHighlightNails:
    "https://www.instagram.com/stories/highlights/17986883999427114/",
  instagramHighlightFacials:
    "https://www.instagram.com/stories/highlights/18015125434950361/",
  instagramHighlightReels:
    "https://www.instagram.com/stories/highlights/18007779989082130/",
  /** Looping tile backgrounds — `public/gallery/*.mp4` */
  galleryVideoNails: "/gallery/nails.mp4",
  galleryVideoFacials: "/gallery/facial.mp4",
  galleryVideoReels: "/gallery/reels.mp4",
  /** Looping tile + highlight ring — `public/gallery/tiktok-featured.mp4` */
  galleryVideoTiktok: "/gallery/tiktok-featured.mp4",
  facebook:
    "https://www.facebook.com/people/Lilys-Beauty-Lounge/61554272223909/",
  tiktok: "https://www.tiktok.com/@lilys.beauty.loun",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(SITE_ADDRESS_LINE),
} as const;

/**
 * Optional: post/reel shortcodes from the URL
 * (e.g. instagram.com/p/AbCdEfGh123/ → { kind: "p", id: "AbCdEfGh123" }).
 * Renders “View post” buttons that open Instagram (iframes are unreliable).
 */
export const INSTAGRAM_FEATURED_POSTS: { kind: "p" | "reel"; id: string }[] = [];
