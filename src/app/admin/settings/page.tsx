import { AdminSettingsForm } from "@/app/admin/settings/settings-form";
import { readSalonConfig } from "@/lib/salon-config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const initial = await readSalonConfig();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Look &amp; colors</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Change how the public site looks. Everything here saves to your site&apos;s data store—no coding needed.
      </p>
      <div className="mt-8">
        <AdminSettingsForm initial={initial} />
      </div>
    </div>
  );
}
