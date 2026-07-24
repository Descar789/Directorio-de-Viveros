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
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-[70px] flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5 min-h-11" onClick={() => setAbierto(false)}>
          <span className="w-8 h-8 rounded-full bg-primary inline-flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" aria-hidden />
          </span>
          <span className="font-heading text-[22px] text-strong">
            Busca<span className="text-primary">viveros</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 inline-flex items-center text-[14.5px] font-medium text-muted hover:text-primary transition-colors"
            >
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center text-[14.5px] font-semibold text-strong hover:text-primary transition-colors"
          >
            Registra tu vivero
          </Link>
          <Link
            href="/entrar"
            className="min-h-11 inline-flex items-center rounded-md bg-primary text-white font-semibold text-sm px-5 hover:bg-primary-dark transition-colors"
          >
            Entrar
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-md border border-border text-strong"
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
          className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-1"
          aria-label="Principal móvil"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 inline-flex items-center font-medium text-strong"
              onClick={() => setAbierto(false)}
            >
              {item.etiqueta}
            </Link>
          ))}
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center font-semibold text-primary"
            onClick={() => setAbierto(false)}
          >
            Registra tu vivero
          </Link>
          <Link
            href="/entrar"
            className="min-h-11 inline-flex items-center justify-center rounded-md bg-primary text-white font-semibold mt-2"
            onClick={() => setAbierto(false)}
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}
