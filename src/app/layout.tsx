import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeStyle } from "@/components/theme-style";
import { JsonLd } from "@/components/json-ld";
import { ScrollRestoration } from "@/components/scroll-restoration";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";
import { getSiteCanonicalUrl } from "@/lib/site-url";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = getSiteCanonicalUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Lily's Beauty Lounge | Full-Service Beauty Salon In Mission, TX",
    template: "%s | Lily's Beauty Lounge",
  },
  description: SITE.seoDescription,
  openGraph: {
    title: "Lily's Beauty Lounge | Mission, TX",
    description: SITE.seoDescription,
    locale: "en_US",
    type: "website",
    url: siteUrl,
    siteName: "Lily's Beauty Lounge",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lily's Beauty Lounge — Mission, Texas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lily's Beauty Lounge | Mission, TX",
    description: SITE.seoDescription,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ThemeStyle />
        <JsonLd siteUrl={siteUrl} />
        <Script id="lilys-scroll-top" strategy="beforeInteractive">
          {`
(function(){
  try {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    var entries = typeof performance !== "undefined" && performance.getEntriesByType
      ? performance.getEntriesByType("navigation")
      : [];
    var nav = entries[0];
    var shouldReset = !nav || nav.type === "navigate";
    if (shouldReset) {
      if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
      }
      window.scrollTo(0, 0);
    }
  } catch (e) {}
})();
          `}
        </Script>
        <ScrollRestoration />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="min-w-0 flex-1 outline-none" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
