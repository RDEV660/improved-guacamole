import { StaffDirectoryEditor } from "@/app/admin/staff/staff-client";

export default function AdminStaffPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Your team</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Names and titles for your team. Use this list to keep everyone on file for the site and your records.
      </p>
      <div className="mt-8">
        <StaffDirectoryEditor />
      </div>
    </div>
  );
}
