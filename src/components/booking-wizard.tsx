"use client";

import {
  BOOKABLE_SERVICES,
  filterServicesByQuery,
  formatPriceUSD,
  formatServicePrice,
  getStaffEligibleForServices,
  servicesGroupedByCategory,
  shortCategoryLabel,
} from "@/lib/services";
import { BOOKING_MAX_DAYS_AHEAD } from "@/lib/business-schedule";
import { SITE } from "@/lib/site";
import { getStaffById } from "@/lib/staff";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const DRAFT_KEY = "lilys-booking-draft-v7";
const REBOOKING_KEY = "lilys-booking-rebooking";

const STEP_HEADINGS: Record<Step, string> = {
  1: "Choose Services",
  2: "Choose Your Provider",
  3: "Choose Date",
  4: "Choose Time",
  5: "Your Contact Details",
  6: "Payment",
};

const STEP_LABELS: Record<Step, string> = {
  1: "Services",
  2: "Provider",
  3: "Date",
  4: "Time",
  5: "Contact",
  6: "Pay",
};

/** Empty = not chosen yet; "any" = no preference */
const STAFF_ANY = "any";

async function readResponseJson<T>(res: Response): Promise<{ data: T | null; raw: string }> {
  const raw = await res.text();
  try {
    return { data: JSON.parse(raw) as T, raw };
  } catch {
    return { data: null, raw };
  }
}

function isLikelyNetworkFailure(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return (
    e.name === "TypeError" ||
    /failed to fetch|networkerror|load failed|network request failed/i.test(e.message)
  );
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DraftShape = {
  step?: Step;
  selectedIds?: string[];
  staffChoice?: string;
  serviceSearch?: string;
  activeCategory?: string;
  date?: string;
  startTime?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export function BookingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [staffChoice, setStaffChoice] = useState<string>(STAFF_ANY);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardBrand, setCardBrand] = useState("DISCOVER");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<{ bookingId: string } | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [daySummaries, setDaySummaries] = useState<Record<
    string,
    { closed: boolean; hasSlots: boolean }
  > | null>(null);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);
  /** YMD -> staff ids marked absent (from public API; null = not loaded yet). */
  const [absentByDate, setAbsentByDate] = useState<Record<string, string[]> | null>(null);
  const [staffAbsenceNotice, setStaffAbsenceNotice] = useState<string | null>(null);
  const stepScrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => toYMD(today), [today]);
  const maxDate = useMemo(() => toYMD(addDays(today, BOOKING_MAX_DAYS_AHEAD)), [today]);

  const dateOptionYMDs = useMemo(() => {
    const out: string[] = [];
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let i = 0; i <= BOOKING_MAX_DAYS_AHEAD; i++) {
      out.push(toYMD(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }, [today]);

  const grouped = useMemo(() => servicesGroupedByCategory(), []);
  const [activeCategory, setActiveCategory] = useState(() => grouped[0]?.category ?? "");

  const totals = useMemo(() => {
    let cents = 0;
    let dur = 0;
    for (const id of selectedIds) {
      const svc = BOOKABLE_SERVICES.find((x) => x.id === id);
      if (svc) {
        cents += svc.priceCents;
        dur += svc.durationMin;
      }
    }
    return { cents, dur };
  }, [selectedIds]);

  const eligibleStaffIds = useMemo(() => getStaffEligibleForServices(selectedIds), [selectedIds]);

  const fetchAbsencesCalendar = useCallback(async () => {
    if (dateOptionYMDs.length === 0) return;
    const from = dateOptionYMDs[0];
    const to = dateOptionYMDs[dateOptionYMDs.length - 1];
    try {
      const res = await fetch(
        `/api/bookings/absences-calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const { data } = await readResponseJson<{ absentByDate?: Record<string, string[]> }>(res);
      if (res.ok && data?.absentByDate && typeof data.absentByDate === "object") {
        setAbsentByDate(data.absentByDate);
      } else {
        setAbsentByDate({});
      }
    } catch {
      setAbsentByDate({});
    }
  }, [dateOptionYMDs]);

  /** Absent on every day in the booking calendar → cannot be chosen as provider for this flow. */
  const staffAbsentEntireWindow = useMemo(() => {
    const out = new Set<string>();
    if (!absentByDate || dateOptionYMDs.length === 0) return out;
    for (const id of eligibleStaffIds) {
      let every = true;
      for (const ymd of dateOptionYMDs) {
        const list = absentByDate[ymd];
        if (!Array.isArray(list) || !list.includes(id)) {
          every = false;
          break;
        }
      }
      if (every) out.add(id);
    }
    return out;
  }, [absentByDate, eligibleStaffIds, dateOptionYMDs]);

  const searchResults = useMemo(
    () => filterServicesByQuery(serviceSearch),
    [serviceSearch]
  );
  const isSearchMode = serviceSearch.trim().length > 0;
  const visibleServices = useMemo(() => {
    if (isSearchMode) return searchResults;
    const block = grouped.find((g) => g.category === activeCategory);
    return block?.services ?? [];
  }, [isSearchMode, searchResults, grouped, activeCategory]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as DraftShape;
      const ordered = servicesGroupedByCategory();
      const validServiceIds = new Set(BOOKABLE_SERVICES.map((s) => s.id));

      if (Array.isArray(d.selectedIds)) {
        const cleaned = d.selectedIds.filter(
          (id): id is string => typeof id === "string" && validServiceIds.has(id)
        );
        setSelectedIds(cleaned);
      }
      if (typeof d.staffChoice === "string") {
        setStaffChoice(d.staffChoice === "" ? STAFF_ANY : d.staffChoice);
      }
      if (typeof d.serviceSearch === "string") setServiceSearch(d.serviceSearch);
      if (typeof d.activeCategory === "string") {
        const catOk = ordered.some((g) => g.category === d.activeCategory);
        setActiveCategory(catOk ? d.activeCategory : ordered[0]?.category ?? "");
      }
      if (typeof d.date === "string") setDate(d.date);
      if (typeof d.startTime === "string") setStartTime(d.startTime);
      if (typeof d.customerName === "string") setCustomerName(d.customerName);
      if (typeof d.customerEmail === "string") setCustomerEmail(d.customerEmail);
      if (typeof d.customerPhone === "string") setCustomerPhone(d.customerPhone);
      if (typeof d.step === "number" && d.step >= 1 && d.step <= 6) {
        setStep(d.step as Step);
      }

      try {
        const rawRb = sessionStorage.getItem(REBOOKING_KEY);
        if (rawRb) {
          const rb = JSON.parse(rawRb) as {
            customerName?: string;
            customerEmail?: string;
            customerPhone?: string;
          };
          if (typeof rb.customerName === "string" && rb.customerName.trim())
            setCustomerName(rb.customerName.trim());
          if (typeof rb.customerEmail === "string" && rb.customerEmail.trim())
            setCustomerEmail(rb.customerEmail.trim());
          if (typeof rb.customerPhone === "string" && rb.customerPhone.trim())
            setCustomerPhone(rb.customerPhone.trim());
          sessionStorage.removeItem(REBOOKING_KEY);
        }
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      const payload: DraftShape = {
        step,
        selectedIds,
        staffChoice,
        serviceSearch,
        activeCategory,
        date,
        startTime,
        customerName,
        customerEmail,
        customerPhone,
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [
    draftReady,
    step,
    selectedIds,
    staffChoice,
    serviceSearch,
    activeCategory,
    date,
    startTime,
    customerName,
    customerEmail,
    customerPhone,
  ]);

  useEffect(() => {
    if (
      staffChoice &&
      staffChoice !== STAFF_ANY &&
      !eligibleStaffIds.includes(staffChoice)
    ) {
      setStaffChoice(STAFF_ANY);
    }
  }, [eligibleStaffIds, staffChoice]);

  useEffect(() => {
    if (step < 2 || selectedIds.length === 0) return;
    void fetchAbsencesCalendar();
  }, [step, selectedIds, fetchAbsencesCalendar]);

  useEffect(() => {
    if (staffChoice === STAFF_ANY || !staffAbsentEntireWindow.has(staffChoice)) return;
    setStaffChoice(STAFF_ANY);
  }, [staffAbsentEntireWindow, staffChoice]);

  useEffect(() => {
    if (!date || staffChoice === STAFF_ANY || !absentByDate?.[date]?.includes(staffChoice)) return;
    setStaffAbsenceNotice(
      "That provider is off on the date you selected. Switched to first available."
    );
    setStaffChoice(STAFF_ANY);
    const tid = window.setTimeout(() => setStaffAbsenceNotice(null), 6000);
    return () => window.clearTimeout(tid);
  }, [date, staffChoice, absentByDate]);

  useEffect(() => {
    if (grouped.length === 0) return;
    const ok = grouped.some((g) => g.category === activeCategory);
    if (!ok) setActiveCategory(grouped[0].category);
  }, [grouped, activeCategory]);

  const fetchSlots = useCallback(
    async (d: string, durationMin: number) => {
      if (selectedIds.length === 0) return;
      setSlotsLoading(true);
      setSlotsError(null);
      setSlots([]);
      setStartTime("");
      try {
        const params = new URLSearchParams({
          date: d,
          durationMin: String(durationMin),
          serviceIds: selectedIds.join(","),
        });
        if (staffChoice && staffChoice !== STAFF_ANY) {
          params.set("preferredStaffId", staffChoice);
        }
        const res = await fetch(`/api/bookings/availability?${params}`);
        const text = await res.text();
        let data: { slots?: string[]; closed?: boolean; error?: string };
        try {
          data = JSON.parse(text) as { slots?: string[]; closed?: boolean; error?: string };
        } catch {
          setSlotsError("Could not load times. Please refresh the page.");
          return;
        }
        if (!res.ok) {
          setSlotsError(data.error ?? "Could not load times.");
          return;
        }
        if (data.closed) {
          setSlotsError("We’re closed that day — pick another date.");
          return;
        }
        setSlots(data.slots ?? []);
        if ((data.slots ?? []).length === 0) {
          setSlotsError("No open slots that day for this service length. Try another date.");
        }
      } catch {
        setSlotsError("Network error loading times.");
      } finally {
        setSlotsLoading(false);
      }
    },
    [selectedIds, staffChoice]
  );

  const fetchDayRange = useCallback(async () => {
    if (selectedIds.length === 0 || totals.dur <= 0) return;
    setRangeLoading(true);
    setRangeError(null);
    try {
      const params = new URLSearchParams({
        from: minDate,
        to: maxDate,
        durationMin: String(totals.dur),
        serviceIds: selectedIds.join(","),
      });
      if (staffChoice && staffChoice !== STAFF_ANY) {
        params.set("preferredStaffId", staffChoice);
      }
      const res = await fetch(`/api/bookings/availability/range?${params}`);
      const text = await res.text();
      let data: {
        days?: { date: string; closed: boolean; hasSlots: boolean }[];
        error?: string;
      };
      try {
        data = JSON.parse(text) as {
          days?: { date: string; closed: boolean; hasSlots: boolean }[];
          error?: string;
        };
      } catch {
        setRangeError("Could not load calendar. Please refresh the page.");
        setDaySummaries(null);
        return;
      }
      if (!res.ok) {
        setRangeError(data.error ?? "Could not load calendar.");
        setDaySummaries(null);
        return;
      }
      const map: Record<string, { closed: boolean; hasSlots: boolean }> = {};
      for (const row of data.days ?? []) {
        map[row.date] = { closed: row.closed, hasSlots: row.hasSlots };
      }
      setDaySummaries(map);
    } catch {
      setRangeError("Network error loading calendar.");
      setDaySummaries(null);
    } finally {
      setRangeLoading(false);
    }
  }, [minDate, maxDate, totals.dur, selectedIds, staffChoice]);

  useEffect(() => {
    if (step !== 3) return;
    if (selectedIds.length === 0 || totals.dur <= 0) return;
    void fetchDayRange();
  }, [step, selectedIds, totals.dur, staffChoice, fetchDayRange]);

  useEffect(() => {
    if (!date || !daySummaries) return;
    const s = daySummaries[date];
    if (s && (s.closed || !s.hasSlots)) {
      setDate("");
      setStartTime("");
      setSlots([]);
    }
  }, [daySummaries, date]);

  useEffect(() => {
    if (step !== 4 || !date || totals.dur <= 0) return;
    void fetchSlots(date, totals.dur);
  }, [step, date, totals.dur, fetchSlots]);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setStartTime("");
    setSlots([]);
  };

  const goNext = () => {
    setFormError(null);
    if (step === 1) {
      if (selectedIds.length === 0) {
        setFormError("Choose at least one service.");
        return;
      }
      const eligible = getStaffEligibleForServices(selectedIds);
      if (eligible.length === 0) {
        setFormError(
          "No single team member can do all selected services together. Remove a service or book separately — or call us for help."
        );
        return;
      }
    }
    if (step === 2) {
      if (!staffChoice || staffChoice === "") {
        setFormError("Choose a provider or select “No preference”.");
        return;
      }
    }
    if (step === 3) {
      if (!date) {
        setFormError("Pick a date.");
        return;
      }
    }
    if (step === 4) {
      if (!startTime) {
        setFormError("Pick a start time.");
        return;
      }
    }
    if (step === 5) {
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        setFormError("Please fill in name, email, and phone.");
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
      if (!emailOk) {
        setFormError("Enter a valid email address.");
        return;
      }
    }
    if (step < 6) setStep((s) => (s + 1) as Step);
  };

  const goBack = () => {
    setFormError(null);
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const continueDisabled =
    submitting ||
    (step === 1 && selectedIds.length === 0) ||
    (step === 2 && (!staffChoice || staffChoice === "")) ||
    (step === 3 && !date) ||
    (step === 4 && (slotsLoading || (slots.length > 0 && !startTime)));

  const pay = async () => {
    setFormError(null);
    const num = cardNumber.replace(/\s/g, "");
    if (num.length < 13 || !expMonth || !expYear || cvv.length < 3) {
      setFormError("Enter valid card details.");
      return;
    }

    const preferredStaffId = staffChoice === STAFF_ANY ? null : staffChoice;

    setSubmitting(true);
    try {
      const tokRes = await fetch("/api/clover/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          card: {
            number: num,
            exp_month: expMonth.padStart(2, "0"),
            exp_year: expYear.length === 2 ? `20${expYear}` : expYear,
            cvv,
            brand: cardBrand,
          },
        }),
      });
      const tokParsed = await readResponseJson<{ id?: string; error?: string }>(tokRes);
      if (!tokRes.ok || !tokParsed.data?.id) {
        setFormError(
          tokParsed.data?.error ??
            (tokParsed.data === null && tokParsed.raw
              ? `Payment service returned an invalid response (${tokRes.status}). Try again or call us.`
              : "Card could not be verified. Check details or try another card.")
        );
        return;
      }

      const confRes = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          serviceIds: selectedIds,
          preferredStaffId,
          date,
          startTime,
          sourceToken: tokParsed.data.id,
        }),
      });
      const confParsed = await readResponseJson<{
        ok?: boolean;
        bookingId?: string;
        error?: string;
      }>(confRes);
      if (!confRes.ok || !confParsed.data?.ok || !confParsed.data?.bookingId) {
        setFormError(
          confParsed.data?.error ??
            (confParsed.data === null && confParsed.raw
              ? `Booking service returned an invalid response (${confRes.status}). Try again or call us.`
              : "Payment or booking failed.")
        );
        return;
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setDone({ bookingId: confParsed.data.bookingId });
    } catch (e) {
      setFormError(
        isLikelyNetworkFailure(e)
          ? "Could not reach the server (network error). Use the same URL as this page (e.g. http://localhost:3000 if you are developing), check your connection, and try again."
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="size-7" aria-hidden />
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">You&apos;re booked</h2>
        <p className="mt-2 text-sm text-muted">
          Your payment went through. Save this reference:{" "}
          <span className="font-mono text-foreground">{done.bookingId}</span>
        </p>
        <div className="mt-6 space-y-3 text-left text-sm text-muted">
          <p className="font-medium text-foreground">What happens next</p>
          <p>
            We may reach out by phone or email to confirm details. If you have questions or need to
            reschedule, call us anytime at{" "}
            <a href={SITE.phoneTel} className="font-semibold text-primary hover:underline">
              {SITE.phoneDisplay}
            </a>
            .
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/book"
            onClick={() => {
              try {
                sessionStorage.setItem(
                  REBOOKING_KEY,
                  JSON.stringify({
                    customerName: customerName.trim(),
                    customerEmail: customerEmail.trim(),
                    customerPhone: customerPhone.trim(),
                  })
                );
              } catch {
                /* ignore */
              }
            }}
            className="lilys-btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/60 bg-primary/10 px-6 text-sm font-semibold text-primary hover:bg-primary/15"
          >
            Book another visit
          </Link>
          <a
            href={SITE.mapsDirections}
            target="_blank"
            rel="noopener noreferrer"
            className="lilys-btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:border-primary/40"
          >
            <MapPin className="size-4 shrink-0 text-accent" aria-hidden />
            Directions
          </a>
          <a
            href={SITE.phoneTel}
            className="lilys-btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            Call Us
          </a>
          <Link
            href="/"
            className="lilys-btn-motion inline-flex min-h-11 items-center justify-center rounded-full border border-primary/50 px-6 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Back To Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-[1] rounded-2xl border border-border bg-card shadow-lg">
      <div className="border-b border-border px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Book Online</p>
        <div className="mt-2 flex items-stretch gap-1">
          <button
            type="button"
            aria-label="Scroll steps left"
            onClick={() =>
              stepScrollRef.current?.scrollBy({
                left: -Math.min(200, stepScrollRef.current.clientWidth * 0.8),
                behavior: "smooth",
              })
            }
            className="hidden shrink-0 rounded-lg border border-border bg-background px-1.5 text-muted hover:text-foreground sm:inline-flex sm:items-center"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <div
            ref={stepScrollRef}
            className="booking-h-scroll flex min-w-0 flex-1 gap-2 pb-1 pt-0.5"
            role="list"
            aria-label="Booking steps"
          >
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <span
                key={n}
                role="listitem"
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${
                  step === n
                    ? "bg-primary text-primary-foreground"
                    : step > n
                      ? "bg-primary/20 text-primary"
                      : "bg-background text-muted"
                }`}
              >
                {n}. {STEP_LABELS[n]}
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-label="Scroll steps right"
            onClick={() =>
              stepScrollRef.current?.scrollBy({
                left: Math.min(200, stepScrollRef.current.clientWidth * 0.8),
                behavior: "smooth",
              })
            }
            className="hidden shrink-0 rounded-lg border border-border bg-background px-1.5 text-muted hover:text-foreground sm:inline-flex sm:items-center"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="min-h-[3rem]" aria-live="polite" aria-atomic="true">
          {formError ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="status">
              {formError}
            </p>
          ) : null}
        </div>

        <div role="region" aria-labelledby={`booking-step-${step}-title`}>
          <h2 id={`booking-step-${step}-title`} className="sr-only">
            {STEP_HEADINGS[step]}
          </h2>

          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted sm:text-sm">
                Choose a category (or search), then tap a service to add or remove it.
              </p>

              <div className="space-y-3 rounded-xl border border-border/80 bg-card px-3 py-3 sm:space-y-3 sm:px-4">
                <div>
                  <label htmlFor="svc-search" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                      aria-hidden
                    />
                    <input
                      id="svc-search"
                      type="search"
                      placeholder="Gel, IPL, facial, wax…"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full cursor-text rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      autoComplete="off"
                    />
                    {serviceSearch ? (
                      <button
                        type="button"
                        onClick={() => setServiceSearch("")}
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {!isSearchMode ? (
                  <div>
                    <label
                      htmlFor="svc-category"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs"
                    >
                      Category
                    </label>
                    {/* xs–sm: one compact control; no sideways scroll */}
                    <select
                      id="svc-category"
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="mb-3 w-full cursor-pointer rounded-xl border border-border bg-background py-3 pl-3 pr-10 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary sm:mb-0 sm:hidden"
                      aria-label="Service category"
                    >
                      {grouped.map(({ category, services }) => (
                        <option key={category} value={category}>
                          {shortCategoryLabel(category)} ({services.length})
                        </option>
                      ))}
                    </select>
                    <div
                      className="hidden grid-cols-2 gap-2 sm:grid md:grid-cols-3 lg:grid-cols-4"
                      role="tablist"
                      aria-label="Service category"
                    >
                      {grouped.map(({ category, services }) => {
                        const count = services.length;
                        const active = category === activeCategory;
                        return (
                          <button
                            key={category}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setActiveCategory(category)}
                            className={`min-h-[3rem] cursor-pointer rounded-xl border px-2.5 py-2 text-left text-xs font-semibold leading-snug transition-colors sm:text-sm ${
                              active
                                ? "border-primary bg-primary text-primary-foreground ring-1 ring-primary/40"
                                : "border-border bg-background text-foreground hover:border-primary/40"
                            }`}
                          >
                            <span className="line-clamp-2">{shortCategoryLabel(category)}</span>
                            <span
                              className={`mt-0.5 block text-[11px] font-normal ${
                                active ? "text-primary-foreground/85" : "text-muted"
                              }`}
                            >
                              {count} service{count === 1 ? "" : "s"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    {searchResults.length} result{searchResults.length === 1 ? "" : "s"} — clear search to use
                    categories.
                  </p>
                )}
              </div>

              <div className="booking-services-scroll max-h-[min(52vh,480px)] overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-xl border border-border/60 bg-background/30 px-2 py-3 sm:max-h-[min(58vh,560px)] sm:px-3 md:max-h-[min(62vh,600px)]">
                <fieldset className="min-w-0 border-0 p-0">
                  <legend className="sr-only">Services to book</legend>
                  {isSearchMode && searchResults.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">
                      No matches — try another word or clear search.
                    </p>
                  ) : visibleServices.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">
                      No services in this category — pick another tab or clear search.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {visibleServices.map((svc, index) => {
                        const on = selectedIds.includes(svc.id);
                        const lastSpansFullRow =
                          visibleServices.length % 2 === 1 &&
                          index === visibleServices.length - 1;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggleService(svc.id)}
                            className={`relative z-20 flex min-h-[3.25rem] w-full cursor-pointer touch-manipulation flex-col rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row sm:items-start sm:justify-between sm:gap-2 ${
                              lastSpansFullRow ? "sm:col-span-2" : ""
                            } ${
                              on
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border bg-card hover:border-primary/30 active:bg-card/80"
                            }`}
                          >
                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                                    on
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border text-muted"
                                  }`}
                                  aria-hidden
                                >
                                  {on ? "✓" : ""}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold leading-snug text-foreground">
                                    {svc.name}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                                    {svc.description}
                                  </p>
                                  <p className="mt-1 text-[11px] text-muted">~{svc.durationMin} min</p>
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 shrink-0 text-sm font-semibold text-primary sm:mt-0 sm:text-right">
                              {formatServicePrice(svc)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </fieldset>
              </div>

              {selectedIds.length > 0 ? (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm">
                  <span className="font-semibold text-foreground">{selectedIds.length} selected</span>
                  <span className="text-muted">
                    {" "}
                    · {formatPriceUSD(totals.cents)} · {totals.dur} min total
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-3">
              {staffAbsenceNotice ? (
                <p
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 sm:text-sm"
                  role="status"
                >
                  {staffAbsenceNotice}
                </p>
              ) : null}
              <p className="flex items-center gap-2 text-xs text-muted sm:text-sm">
                <Users className="size-4 shrink-0 text-primary" aria-hidden />
                Only staff who can do your whole cart are shown. Pick one or &quot;No preference&quot;.
              </p>
              <p className="text-xs text-muted">
                Providers marked <span className="text-foreground/80">off all open dates</span> can&apos;t be
                chosen here; use <span className="font-medium text-foreground">No preference</span> or another
                team member.
              </p>
              <p className="text-xs leading-relaxed text-muted">
                Need different providers or separate times for different services? Finish this booking,
                then use <span className="font-medium text-foreground">Book another visit</span> on
                the confirmation screen, or call {SITE.phoneDisplay}.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStaffChoice(STAFF_ANY)}
                  className={`cursor-pointer touch-manipulation rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                    staffChoice === STAFF_ANY
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                      : "border-border bg-background hover:border-primary/35"
                  }`}
                >
                  No preference
                  <span className="mt-0.5 block text-xs font-normal text-muted">First available</span>
                </button>
                {eligibleStaffIds.map((id) => {
                  const member = getStaffById(id);
                  if (!member) return null;
                  const on = staffChoice === id;
                  const offWindow = staffAbsentEntireWindow.has(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={offWindow}
                      title={
                        offWindow
                          ? "Not available on any day in the booking window — choose No preference or another provider."
                          : undefined
                      }
                      onClick={() => {
                        if (!offWindow) setStaffChoice(id);
                      }}
                      className={`touch-manipulation rounded-xl border px-3 py-3 text-left transition-colors ${
                        offWindow
                          ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                          : `cursor-pointer ${
                              on
                                ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                                : "border-border bg-background hover:border-primary/35"
                            }`
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{member.name}</span>
                      {offWindow ? (
                        <span className="mt-0.5 block text-xs text-muted">Off all open dates</span>
                      ) : member.role ? (
                        <span className="mt-0.5 block text-xs text-muted">{member.role}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="max-w-2xl space-y-4">
              {staffAbsenceNotice ? (
                <p
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 sm:text-sm"
                  role="status"
                >
                  {staffAbsenceNotice}
                </p>
              ) : null}
              <p className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="size-4 text-primary" aria-hidden />
                Next {BOOKING_MAX_DAYS_AHEAD + 1} days · {formatPriceUSD(totals.cents)} ·{" "}
                {totals.dur} min
              </p>
              <p className="text-xs text-muted">
                Closed days and fully booked days can&apos;t be selected. Times follow salon hours.
              </p>
              {rangeLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Checking open days…
                </p>
              ) : null}
              {rangeError ? (
                <p className="text-sm text-amber-200" role="status">
                  {rangeError}
                </p>
              ) : null}
              <fieldset>
                <legend className="sr-only">Choose appointment date</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {dateOptionYMDs.map((ymd) => {
                    const summary = daySummaries?.[ymd];
                    const disabled =
                      !summary || summary.closed || !summary.hasSlots || rangeLoading || !!rangeError;
                    const selected = date === ymd;
                    const [yy, mm, dd] = ymd.split("-").map(Number);
                    const label = new Date(yy, mm - 1, dd).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const statusLabel = !summary
                      ? "Loading"
                      : summary.closed
                        ? "Closed"
                        : !summary.hasSlots
                          ? "Full"
                          : "Open";
                    return (
                      <button
                        key={ymd}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setDate(ymd);
                          setSlots([]);
                          setStartTime("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected
                            ? "border-primary bg-primary/15 ring-2 ring-primary/40"
                            : "border-border bg-background hover:border-primary/35"
                        }`}
                      >
                        <span className="block font-semibold text-foreground">{label}</span>
                        <span
                          className={`mt-1 block text-[11px] font-medium uppercase tracking-wide ${
                            summary && !summary.closed && summary.hasSlots
                              ? "text-primary"
                              : "text-muted"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="max-w-md space-y-4">
              <p className="text-sm text-muted">
                {date} · {totals.dur} minutes · {formatPriceUSD(totals.cents)}
              </p>
              {slotsLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading open times…
                </p>
              ) : null}
              {slotsError ? (
                <p className="text-sm text-amber-200" role="status">
                  {slotsError}
                </p>
              ) : null}
              {!slotsLoading && slots.length > 0 ? (
                <>
                  <label className="block text-sm font-medium text-foreground" htmlFor="book-time">
                    Start time
                  </label>
                  <select
                    id="book-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">Select a time</option>
                    {slots.map((t) => {
                      const [h, m] = t.split(":").map(Number);
                      const d = new Date();
                      d.setHours(h, m, 0, 0);
                      const label = d.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                      return (
                        <option key={t} value={t}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </>
              ) : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="mx-auto max-w-md space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <User className="size-4 text-primary" aria-hidden />
                How can we reach you?
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="cust-name">
                  Full name
                </label>
                <input
                  id="cust-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="cust-email">
                  Email
                </label>
                <input
                  id="cust-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="cust-phone">
                  Phone
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  autoComplete="tel"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="mx-auto max-w-md space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <CreditCard className="size-4 text-primary" aria-hidden />
                Pay {formatPriceUSD(totals.cents)} securely
              </p>
              <p className="text-xs text-muted">
                Your card details are encrypted and processed by our payment partner. You&apos;ll only be
                charged for the total shown above.
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="card-brand">
                  Card type
                </label>
                <select
                  id="card-brand"
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="DISCOVER">DISCOVER</option>
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">MASTERCARD</option>
                  <option value="AMEX">AMEX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground" htmlFor="card-num">
                  Card number
                </label>
                <input
                  id="card-num"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-foreground" htmlFor="exp-m">
                    MM
                  </label>
                  <input
                    id="exp-m"
                    inputMode="numeric"
                    placeholder="12"
                    maxLength={2}
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-foreground" htmlFor="exp-y">
                    YY / YYYY
                  </label>
                  <input
                    id="exp-y"
                    inputMode="numeric"
                    placeholder="30"
                    maxLength={4}
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-foreground" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || submitting}
            className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
          {step < 6 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={continueDisabled}
              className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Continue
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void pay()}
              disabled={submitting}
              className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : (
                <>
                  Pay {formatPriceUSD(totals.cents)}
                  <CreditCard className="size-4" aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
