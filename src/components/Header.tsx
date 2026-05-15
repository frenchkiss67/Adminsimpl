import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marine-600 text-white font-bold">
            A
          </span>
          <span className="text-lg font-semibold text-marine-900">AdminSimpl</span>
        </Link>
        <nav className="hidden gap-8 text-sm font-medium text-slate-700 md:flex">
          <Link href="/#fonctionnalites" className="hover:text-marine-600">Fonctionnalités</Link>
          <Link href="/#tarifs" className="hover:text-marine-600">Tarifs</Link>
          <Link href="/profil" className="hover:text-marine-600">Mon profil</Link>
          <Link href="/tableau-de-bord" className="hover:text-marine-600">Tableau de bord</Link>
        </nav>
        <Link href="/profil" className="btn-primary text-xs">
          Commencer
        </Link>
      </div>
    </header>
  );
}
