"use client";

import Link from "next/link";

export function FranceConnectButton({ className = "" }: { className?: string }) {
  const state = typeof crypto !== "undefined" ? crypto.randomUUID() : "demo";
  const href = `/franceconnect?state=${state}&redirect_uri=/api/franceconnect/callback`;
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-3 rounded-lg bg-[#0053b3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003d80] ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded bg-white font-bold text-[#0053b3]">
        FC
      </span>
      <span>S'identifier avec FranceConnect</span>
    </Link>
  );
}
