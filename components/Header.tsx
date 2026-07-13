"use client";

import { useState } from "react";
import Link from "next/link";
import { Sprout, Menu, X } from "lucide-react";

const NAV = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/buscar", etiqueta: "Directorio" },
];

export default function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 min-h-11" onClick={() => setAbierto(false)}>
          <Sprout className="w-7 h-7 text-primary" aria-hidden />
          <span className="font-heading font-bold text-lg">
            Busca<span className="text-primary">Viveros</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Principal">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="min-h-11 inline-flex items-center font-medium hover:text-primary transition-colors">
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center bg-accent text-on-primary font-semibold px-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Registra tu vivero gratis
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-border"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
        </button>
      </div>

      {abierto && (
        <nav id="menu-movil" className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1" aria-label="Principal móvil">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 inline-flex items-center font-medium"
              onClick={() => setAbierto(false)}
            >
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center justify-center bg-accent text-on-primary font-semibold rounded-xl mt-2"
            onClick={() => setAbierto(false)}
          >
            Registra tu vivero gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
