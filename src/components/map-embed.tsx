import { SITE } from "@/lib/site";

const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=" +
  encodeURIComponent(SITE.address) +
  "&hl=en&z=16&output=embed";

export function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <iframe
        title="Map: Lily's Beauty Lounge, Mission TX"
        src={MAP_EMBED_SRC}
        className="aspect-[4/3] min-h-[240px] w-full border-0 sm:aspect-video sm:min-h-[320px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
