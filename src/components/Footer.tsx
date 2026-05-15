export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} AdminSimpl — Vos démarches, simplifiées.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-marine-600">Mentions légales</a>
            <a href="#" className="hover:text-marine-600">Confidentialité (RGPD)</a>
            <a href="#" className="hover:text-marine-600">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
