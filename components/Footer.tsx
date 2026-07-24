import Link from "next/link";
import { Sprout } from "lucide-react";
import { ESTADOS, ESTADOS_PILOTO, slugAEstado } from "@/lib/zonas";

export default function Footer() {
  const piloto = ESTADOS_PILOTO.map((s) => slugAEstado(s)!).filter(Boolean);
  const resto = ESTADOS.filter((e) => !ESTADOS_PILOTO.includes(e.slug));

  return (
    <footer className="bg-[#3a1f28] text-[#e6d2d8] mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="inline-flex items-center gap-2.5 font-heading text-[22px] text-white">
            <span className="w-[30px] h-[30px] rounded-full bg-primary inline-flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" aria-hidden />
            </span>
            Busca<span className="text-[#e2937a]">viveros</span>
          </p>
          <p className="text-sm text-[#cba7b0] mt-2 max-w-[34ch]">
            El directorio de viveros de confianza de México.
          </p>
        </div>

        <nav aria-label="Estados destacados">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#b58e98]">
            Viveros por estado
          </h2>
          <ul className="mt-3.5 space-y-2">
            {piloto.map((e) => (
              <li key={e.slug}>
                <Link href={`/viveros/${e.slug}`} className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-white transition-colors">
                  Viveros en {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Más estados">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#b58e98]">
            Más estados
          </h2>
          <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2">
            {resto.slice(0, 14).map((e) => (
              <li key={e.slug}>
                <Link href={`/viveros/${e.slug}`} className="text-sm hover:text-white transition-colors">
                  {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal y registro">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#b58e98]">
            BuscaViveros
          </h2>
          <ul className="mt-3.5 space-y-2">
            <li>
              <Link href="/registro" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-white transition-colors">
                Registra tu vivero gratis
              </Link>
            </li>
            <li>
              <Link href="/entrar" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-white transition-colors">
                Entrar
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="text-sm min-h-11 sm:min-h-0 inline-flex items-center hover:text-white transition-colors">
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-[#55283d]">
        <p className="max-w-6xl mx-auto px-4 py-4 text-xs text-[#b58e98]">
          © {new Date().getFullYear()} BuscaViveros · El Vivero de Confianza
        </p>
      </div>
    </footer>
  );
}
