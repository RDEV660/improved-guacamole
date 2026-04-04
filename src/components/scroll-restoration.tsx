"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * SPA route changes scroll to top. Initial load is handled by the inline script in layout.
 */
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
