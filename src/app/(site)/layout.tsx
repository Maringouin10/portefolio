import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight uppercase">
            Portefolio
          </Link>
          <nav className="text-xs uppercase tracking-widest space-x-6">
            <Link href="/" className="hover:opacity-60 transition-opacity">
              Projets
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs uppercase tracking-widest text-black/50 flex justify-between">
          <span>&copy; {new Date().getFullYear()}</span>
          <Link href="/admin" className="hover:text-black transition-colors">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
