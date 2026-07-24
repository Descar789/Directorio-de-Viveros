import Link from "next/link";
import Buscador from "@/components/Buscador";
import MapaViveros from "@/components/MapaViverosLazy";
import ViveroCard from "@/components/ViveroCard";
import { crearClientePublico } from "@/lib/supabase/publico";
import { ordenarViveros } from "@/lib/busqueda";
import { esDestacado } from "@/lib/tipos";
import type { Vivero } from "@/lib/tipos";
import { ESTADOS_PILOTO, slugAEstado } from "@/lib/zonas";

export const revalidate = 3600;

const PASOS = [
  {
    numero: "01",
    titulo: "Busca sin cuenta",
    texto: "Por nombre, municipio o con “cerca de mí”. Sin registro, sin fricción.",
  },
  {
    numero: "02",
    titulo: "Revisa la ficha",
    texto: "Fotos, especialidades, horarios y ubicación. Solo mostramos viveros reales.",
  },
  {
    numero: "03",
    titulo: "Contacta directo",
    texto: "WhatsApp o “cómo llegar”, sin intermediarios ni comisiones.",
  },
];

export default async function Home() {
  const supabase = crearClientePublico();
  const { data: viverosData } = await supabase
    .from("viveros")
    .select("*")
    .in("estatus", ["verificado", "pre-cargado"])
    .limit(200);
  const viveros = ordenarViveros((viverosData ?? []) as Vivero[]);
  const destacados = viveros.filter(esDestacado).slice(0, 6);

  const piloto = ESTADOS_PILOTO.map((slug) => slugAEstado(slug)).filter(Boolean) as {
    slug: string;
    nombre: string;
  }[];
  const municipiosPorEstado = new Map<string, Set<string>>();
  for (const v of viveros) {
    if (!municipiosPorEstado.has(v.estado)) municipiosPorEstado.set(v.estado, new Set());
    municipiosPorEstado.get(v.estado)!.add(v.municipio);
  }

  return (
    <main className="flex-1">
      {/* Hero: buscador + mapa */}
      <section className="max-w-6xl mx-auto px-4 pt-12 lg:pt-16 pb-9 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
        <div className="animate-fade-up">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
            El Vivero de Confianza
          </p>
          <h1 className="font-heading text-[42px] lg:text-[58px] leading-[1.03] font-medium mt-4 text-balance">
            Encuentra el vivero de confianza cerca de ti
          </h1>
          <p className="text-muted mt-5 text-lg leading-relaxed max-w-[460px]">
            Directorio de viveros reales de México. Busca por zona o cercanía,
            sin cuenta.
          </p>
          <div className="mt-8">
            <Buscador />
          </div>
          <p className="text-[13px] text-muted-soft mt-4">
            Piloto en Morelos, Estado de México, CDMX y Puebla ·{" "}
            <strong className="text-muted font-semibold">{viveros.length} viveros</strong>
          </p>
        </div>
        <div className="h-[380px] rounded-lg overflow-hidden border border-border">
          <MapaViveros viveros={viveros} />
        </div>
      </section>

      {/* Explora por estado */}
      <section className="max-w-6xl mx-auto px-4 py-9" aria-labelledby="titulo-estados">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 id="titulo-estados" className="font-heading text-3xl font-medium">
            Explora por estado
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {piloto.map((e) => {
            const municipios = [...(municipiosPorEstado.get(e.nombre) ?? [])];
            const count = viveros.filter((v) => v.estado === e.nombre).length;
            return (
              <Link
                key={e.slug}
                href={`/viveros/${e.slug}`}
                className="bg-surface border border-border rounded-lg p-5 shadow-sm transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div className="font-heading text-[22px] text-strong mb-1">{e.nombre}</div>
                <div className="text-[13px] text-muted-soft leading-relaxed line-clamp-2">
                  {municipios.length > 0 ? municipios.join(" · ") : "Próximamente"}
                </div>
                <div className="mt-3.5 text-[13.5px] font-semibold text-primary-dark">
                  {count} {count === 1 ? "vivero" : "viveros"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-9" aria-labelledby="titulo-destacados">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="titulo-destacados" className="font-heading text-3xl font-medium">
              Viveros destacados
            </h2>
            <Link
              href="/buscar"
              className="min-h-11 inline-flex items-center gap-1.5 rounded-md border border-border px-4 text-sm font-semibold text-strong hover:border-primary hover:text-primary shrink-0 transition-colors"
            >
              Ver todos<span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-9">
            {destacados.map((v) => (
              <ViveroCard key={v.id} vivero={v} insignias={[]} />
            ))}
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-4 py-14 border-t border-border" aria-labelledby="titulo-como-funciona">
        <h2 id="titulo-como-funciona" className="font-heading text-3xl font-medium mb-9">
          Cómo funciona
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {PASOS.map((p) => (
            <div key={p.numero}>
              <div className="font-heading text-4xl text-border-strong leading-none mb-3.5">
                {p.numero}
              </div>
              <h3 className="text-[17px] font-semibold mb-2">{p.titulo}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA dueño */}
      <section className="bg-plum mt-6">
        <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div className="text-white">
            <h2 className="font-heading text-3xl lg:text-[38px] font-medium leading-[1.1]">
              ¿Tienes un vivero? Reclama tu ficha.
            </h2>
            <p className="mt-3.5 text-white/75 max-w-[46ch] leading-relaxed">
              Alta en 6 pasos y moderación en menos de 24 horas. Sin costo. Aparece
              ante quienes ya te buscan.
            </p>
            <Link
              href="/registro"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-white text-plum font-semibold text-base px-6 py-3 hover:bg-white/90 transition-colors"
            >
              Registra tu vivero<span aria-hidden>→</span>
            </Link>
          </div>
          <div className="border border-white/15 bg-white/5 rounded-lg p-6">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-white/60 mb-3.5">
              Posición destacada
            </div>
            <div className="font-heading text-[34px] text-white mb-1.5">
              $99<span className="text-base font-body text-white/60"> /mes por municipio</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-white/75">
              Máximo 3 destacados por municipio. Primer bloque de resultados. Se
              contrata por WhatsApp.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
