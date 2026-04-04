import { StaffDirectoryEditor } from "@/app/admin/staff/staff-client";

export default function AdminStaffPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Your team</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Names and titles for your records. The live booking page may still use the original provider list until that
        piece is switched over—this screen is still useful to keep everyone on file.
      </p>
      <div className="mt-8">
        <StaffDirectoryEditor />
      </div>
    </div>
  );
}
