import type { BookableService } from "@/lib/services";
import { readValidatedServicesArray } from "@/lib/salon-services-persist";
import bookableData from "../../data/services.json";
import { cache } from "react";

/** Server only: Redis / file-backed catalog for API routes (not bundled for client). */
export const loadBookableServicesForApi = cache(async (): Promise<BookableService[]> => {
  const fromStore = await readValidatedServicesArray();
  if (fromStore.length > 0) return fromStore as BookableService[];
  return bookableData as BookableService[];
});

export async function getServiceByIdForApi(id: string): Promise<BookableService | undefined> {
  const list = await loadBookableServicesForApi();
  return list.find((s) => s.id === id);
}

export async function getStaffEligibleForServicesForApi(serviceIds: string[]): Promise<string[]> {
  if (serviceIds.length === 0) return [];
  let pool: string[] = [];
  const list = await loadBookableServicesForApi();
  for (const sid of serviceIds) {
    const svc = list.find((s) => s.id === sid);
    if (!svc) return [];
    pool = pool.length === 0 ? [...svc.staffIds] : pool.filter((x) => svc.staffIds.includes(x));
    if (pool.length === 0) return [];
  }
  return pool;
}
