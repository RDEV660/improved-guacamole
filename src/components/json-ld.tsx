import { SITE } from "@/lib/site";
import { STRUCTURED_ADDRESS } from "@/lib/structured-address";

type JsonLdProps = { siteUrl: string };

export function JsonLd({ siteUrl }: JsonLdProps) {
  const url = siteUrl.replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "BeautySalon"],
        "@id": `${url}/#business`,
        name: SITE.name,
        description: SITE.seoDescription,
        url,
        telephone: "+19566808271",
        image: `${url}/opengraph-image`,
        address: {
          "@type": "PostalAddress",
          ...STRUCTURED_ADDRESS,
        },
        sameAs: [SITE.instagram, SITE.facebook, SITE.tiktok],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "10:00",
            closes: "19:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "09:00",
            closes: "17:30",
          },
        ],
        priceRange: "$$",
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE.name,
        publisher: { "@id": `${url}/#business` },
        potentialAction: {
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/book`,
          },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
