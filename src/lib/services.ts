import bookableData from "../../data/services.json";

export type BookableService = {
  id: string;
  category: string;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
  /** If true, UI shows “Starting at …” */
  startingAt?: boolean;
  staffIds: string[];
};

export const BOOKABLE_SERVICES: BookableService[] = bookableData as BookableService[];

/** Salon flow: nails → packages → hair → IPL → wax → skin → scalp → lashes */
const CATEGORY_ORDER: string[] = [
  "Nails — Manicures",
  "Nails — Acrylic, Builder & Gel-X",
  "Nails — Pedicures",
  "Nails — Polish & extras",
  "Combos",
  "Hair — Cuts & styling",
  "Hair — Color",
  "Hair — Extensions",
  "IPL — Face",
  "IPL — Body",
  "Waxing",
  "Facials",
  "Makeup",
  "Korean scalp & head spa",
  "Lashes & brows",
];

export function getServiceById(id: string): BookableService | undefined {
  return BOOKABLE_SERVICES.find((s) => s.id === id);
}

export function formatPriceUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatServicePrice(s: BookableService): string {
  const p = formatPriceUSD(s.priceCents);
  return s.startingAt === false ? p : `Starting at ${p}`;
}

/** Short labels for booking UI (select + grid) */
export function shortCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    "Nails — Manicures": "Manicures",
    "Nails — Acrylic, Builder & Gel-X": "Acrylic, Builder & Gel-X",
    "Nails — Pedicures": "Pedicures",
    "Nails — Polish & extras": "Polish & extras",
    Combos: "Combos",
    "Hair — Cuts & styling": "Hair — cuts & blowouts",
    "Hair — Color": "Hair — color",
    "Hair — Extensions": "Hair — extensions",
    "IPL — Face": "IPL — face",
    "IPL — Body": "IPL — body",
    Waxing: "Waxing",
    Facials: "Facials",
    Makeup: "Makeup",
    "Korean scalp & head spa": "Korean scalp",
    "Lashes & brows": "Lashes & brows",
  };
  return map[category] ?? category;
}

/** Search by name, description, category (booking UI). */
export function filterServicesByQuery(query: string): BookableService[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BOOKABLE_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      shortCategoryLabel(s.category).toLowerCase().includes(q)
  );
}

export function servicesGroupedByCategory(): { category: string; services: BookableService[] }[] {
  const map = new Map<string, BookableService[]>();
  for (const svc of BOOKABLE_SERVICES) {
    const list = map.get(svc.category) ?? [];
    list.push(svc);
    map.set(svc.category, list);
  }
  const ordered: { category: string; services: BookableService[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    const list = map.get(cat);
    if (list?.length) {
      const services = [...list].sort((a, b) => a.name.localeCompare(b.name, "en"));
      ordered.push({ category: cat, services });
    }
  }
  for (const [cat, services] of map) {
    if (!CATEGORY_ORDER.includes(cat)) {
      const sorted = [...services].sort((a, b) => a.name.localeCompare(b.name, "en"));
      ordered.push({ category: cat, services: sorted });
    }
  }
  return ordered;
}

export function getStaffEligibleForServices(serviceIds: string[]): string[] {
  if (serviceIds.length === 0) return [];
  let pool: string[] = [];
  for (const id of serviceIds) {
    const svc = getServiceById(id);
    if (!svc) return [];
    pool = pool.length === 0 ? [...svc.staffIds] : pool.filter((sid) => svc.staffIds.includes(sid));
    if (pool.length === 0) return [];
  }
  return pool;
}
