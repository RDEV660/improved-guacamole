export type BookingRecord = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceIds: string[];
  /** Staff id, or omitted / null when client chose “no preference” */
  preferredStaffId?: string | null;
  /** Resolved at payment — drives per-staff conflicts (omitted on legacy rows = salon-wide block). */
  assignedStaffId?: string | null;
  date: string;
  /** HH:mm 24h local */
  startTime: string;
  totalCents: number;
  durationMin: number;
  cloverChargeId?: string;
  paymentStatus: "paid" | "failed" | "pending";
};

export type ConfirmBookingBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceIds: string[];
  /** Omit or null = salon assigns */
  preferredStaffId?: string | null;
  date: string;
  startTime: string;
  /** Token from Clover (`clv_…`) */
  sourceToken: string;
};
