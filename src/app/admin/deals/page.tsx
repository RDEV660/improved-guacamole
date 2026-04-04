import { DealsEditor } from "@/app/admin/deals/deals-client";

export default function AdminDealsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Deals &amp; promos</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Create offers you can feature on the site. Turn a deal on or off with the Active switch.
      </p>
      <div className="mt-8">
        <DealsEditor />
      </div>
    </div>
  );
}
