import { AdminLoginForm } from "@/app/admin/login/login-form";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">Loading…</div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
