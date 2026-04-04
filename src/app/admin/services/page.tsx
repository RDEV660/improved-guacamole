import { ServicesJsonEditor } from "@/app/admin/services/services-client";

export default function AdminServicesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-white">Services clients can book</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        This list powers the booking page. The editor below is structured data—if you&apos;re not comfortable editing it,
        ask your web person for small changes, or duplicate an existing block and adjust name, time, and price.
      </p>
      <div className="mt-8">
        <ServicesJsonEditor />
      </div>
    </div>
  );
}
