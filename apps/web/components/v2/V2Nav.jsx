"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/history", label: "History" },
  { href: "/leadership", label: "Leadership" },
  { href: "/departments", label: "Departments" },
  { href: "/wards", label: "Wards & CDAs" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export default function V2Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="v2-nav">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
            <Image src="/logo.jpeg" alt="Surulere Local Government seal" fill sizes="32px" className="object-cover" />
          </span>
          <span className="font-display font-semibold text-base">Ilé Surulere</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="v2-nav-link py-1">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/registry" className="hidden lg:inline-flex v2-ghost-btn text-sm px-3.5 py-2 shrink-0">
          Registry site ↗
        </Link>

        <button
          type="button"
          className="lg:hidden v2-ghost-btn min-h-11 min-w-11 p-0 flex items-center justify-center shrink-0"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-v2-line px-5 py-3 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-v2-text hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/registry"
            className="px-3 py-2.5 rounded-lg text-sm font-medium v2-glow-text"
            onClick={() => setOpen(false)}
          >
            Registry site ↗
          </Link>
        </nav>
      )}
    </header>
  );
}
