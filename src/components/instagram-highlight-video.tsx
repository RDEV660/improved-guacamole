"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

/**
 * Muted looping background clips. IntersectionObserver on the video itself often
 * reports 0% visible before layout/metadata, which kept pausing playback — so we
 * rely on autoplay + explicit play() retries (iOS / Chrome friendly).
 */
export function InstagramHighlightVideo({
  src,
  className,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const kickPlay = () => {
      if (reduce.matches) return;
      video.muted = true;
      void video.play().catch(() => {
        /* strict autoplay — retried below */
      });
    };

    const stop = () => {
      video.pause();
      if (reduce.matches) {
        try {
          video.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    };

    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const onReduce = () => {
      if (reduce.matches) stop();
      else kickPlay();
    };

    const onReady = () => kickPlay();

    reduce.addEventListener("change", onReduce);
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("canplaythrough", onReady);

    if (reduce.matches) {
      stop();
    } else {
      kickPlay();
    }

    const retries = [80, 250, 700, 2000].map((ms) =>
      window.setTimeout(() => kickPlay(), ms)
    );

    return () => {
      reduce.removeEventListener("change", onReduce);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
      retries.forEach(clearTimeout);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      {...(ariaHidden
        ? { "aria-hidden": true as const }
        : { "aria-label": ariaLabel ?? "Preview video" })}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
