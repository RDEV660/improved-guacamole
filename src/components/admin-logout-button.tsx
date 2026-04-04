"use client";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      className="ml-1 rounded-lg px-2.5 py-1.5 font-medium text-zinc-500 hover:bg-zinc-800 hover:text-white"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Log out
    </button>
  );
}
