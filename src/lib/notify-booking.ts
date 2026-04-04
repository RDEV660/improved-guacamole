import type { BookingRecord } from "@/lib/booking-types";
import { readSalonConfig } from "@/lib/salon-config";
import { formatPriceUSD } from "@/lib/services";
import nodemailer from "nodemailer";

function getSmtpUrl(): string | undefined {
  const u = process.env.SMTP_URL?.trim();
  return u || undefined;
}

export async function sendNewBookingNotifications(booking: BookingRecord): Promise<void> {
  const smtp = getSmtpUrl();
  if (!smtp) return;

  const cfg = await readSalonConfig();
  const to = cfg.notifyEmails.filter(Boolean);
  if (to.length === 0) return;

  const transporter = nodemailer.createTransport(smtp);
  const subject = `New booking — ${booking.customerName} — ${booking.date} ${booking.startTime}`;
  const lines = [
    `Customer: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    `Phone: ${booking.customerPhone}`,
    `When: ${booking.date} at ${booking.startTime} (${booking.durationMin} min)`,
    `Services: ${booking.serviceIds.join(", ")}`,
    `Staff (assigned): ${booking.assignedStaffId ?? "—"}`,
    `Total: ${formatPriceUSD(booking.totalCents)}`,
    `Payment: ${booking.paymentStatus}`,
    `Booking id: ${booking.id}`,
  ];
  const text = lines.join("\n");

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? to[0],
    to: to.join(", "),
    subject,
    text,
  });
}
