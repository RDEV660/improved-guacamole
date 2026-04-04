export type StaffMember = {
  id: string;
  name: string;
  role?: string;
};

/** Lowercase ids — used in bookings and service.staffIds */
export const STAFF: StaffMember[] = [
  { id: "lily", name: "Lily", role: "Owner" },
  { id: "sherlyn", name: "Sherlyn", role: "Manager" },
  { id: "nicole", name: "Nicole" },
  { id: "danna", name: "Danna" },
  { id: "kate", name: "Kate" },
  { id: "liz", name: "Liz" },
  { id: "elsa", name: "Elsa" },
];

export function getStaffById(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id);
}
