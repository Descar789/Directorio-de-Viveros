"use client";

import { useState } from "react";
import Link from "next/link";
import { Sprout, Menu, X } from "lucide-react";

const NAV = [
  { href: "/", etiqueta: "Explorar" },
  { href: "/buscar", etiqueta: "Directorio" },
];

export default function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary">
      <div className="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5 min-h-11" onClick={() => setAbierto(false)}>
          <span className="w-9 h-9 rounded-[10px] bg-white/15 inline-flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" aria-hidden />
          </span>
          <span className="font-heading font-semibold text-[22px] text-white">
            BuscaViveros
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 inline-flex items-center text-[15px] font-medium text-white/75 hover:text-white transition-colors"
            >
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center bg-white text-primary font-bold text-sm px-5 rounded-[10px] hover:bg-white/90 transition-colors"
          >
            Registra tu vivero gratis
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-[10px] border border-white/40 text-white"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
        </button>
      </div>

      {abierto && (
        <nav
          id="menu-movil"
          className="md:hidden border-t border-white/25 bg-primary px-4 py-4 flex flex-col gap-2"
          aria-label="Principal móvil"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 inline-flex items-center font-medium text-white"
              onClick={() => setAbierto(false)}
            >
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center justify-center bg-white text-primary font-semibold rounded-[10px] mt-2"
            onClick={() => setAbierto(false)}
          >
            Registra tu vivero
          </Link>
        </nav>
      )}
    </header>
  );
}
