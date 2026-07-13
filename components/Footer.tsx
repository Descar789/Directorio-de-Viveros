import Link from "next/link";
import { Sprout } from "lucide-react";
import { ESTADOS, ESTADOS_PILOTO, slugAEstado } from "@/lib/zonas";

export default function Footer() {
  const piloto = ESTADOS_PILOTO.map((s) => slugAEstado(s)!).filter(Boolean);
  const resto = ESTADOS.filter((e) => !ESTADOS_PILOTO.includes(e.slug));

  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="inline-flex items-center gap-2 font-heading font-bold text-lg">
            <Sprout className="w-6 h-6 text-primary" aria-hidden />
            Busca<span className="text-primary">Viveros</span>
          </p>
          <p className="text-sm text-muted mt-2">
            El directorio de viveros más completo de México.
          </p>
        </div>

        <nav aria-label="Estados destacados">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted">
            Viveros por estado
          </h2>
          <ul className="mt-3 space-y-1">
            {piloto.map((e) => (
              <li key={e.slug}>
                <Link href={`/viveros/${e.slug}`} className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-primary">
                  Viveros en {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Más estados">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted">
            Más estados
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {resto.slice(0, 14).map((e) => (
              <li key={e.slug}>
                <Link href={`/viveros/${e.slug}`} className="text-sm hover:text-primary">
                  {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal y registro">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wide text-muted">
            BuscaViveros
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link href="/registro" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-primary">
                Registra tu vivero gratis
              </Link>
            </li>
            <li>
              <Link href="/entrar" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-primary">
                Entrar
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-primary">
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-muted">
          © {new Date().getFullYear()} BuscaViveros. Hecho en México.
        </p>
      </div>
    </footer>
  );
}
