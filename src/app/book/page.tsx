import { BookingWizard } from "@/components/booking-wizard";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

const bookTitle = "Book Online";
const bookDesc = `Book Nails, Pedicures, Facials, Scalp Treatments, Hair, Makeup, Waxing, And More At ${SITE.name} In Mission, TX. Choose Your Time And Pay Securely Online.`;

export const metadata: Metadata = {
  title: bookTitle,
  description: bookDesc,
  openGraph: {
    title: `${bookTitle} | Lily's Beauty Lounge`,
    description: bookDesc,
    type: "website",
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
    title: `${bookTitle} | Lily's Beauty Lounge`,
    description: bookDesc,
    images: ["/opengraph-image"],
  },
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <nav className="mb-8 text-sm text-muted">
        <Link
          href="/"
          className="rounded-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ← Home
        </Link>
      </nav>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Book An Appointment
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        Pick Your Services And A Time That Works For You. Payment Is Processed Securely When You Finish — You&apos;ll Get A Confirmation Reference On Screen. If You Need To Reschedule, Call Us And We&apos;ll Do Our Best To Help.
      </p>
      <div className="mt-10">
        <BookingWizard />
      </div>
    </div>
  );
}
