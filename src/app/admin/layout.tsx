"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">{children}</div>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-black flex">
      <aside className="w-56 shrink-0 bg-black text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/admin" className="text-lg font-semibold tracking-widest uppercase">
            Admin
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-white/10">
            Projets
          </Link>
          <Link href="/admin/projects/new" className="block px-3 py-2 rounded hover:bg-white/10">
            Nouveau projet
          </Link>
          <Link href="/" target="_blank" className="block px-3 py-2 rounded hover:bg-white/10">
            Voir le site &#8599;
          </Link>
        </nav>
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm"
          >
            Deconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
