import Link from "next/link";
import Buscador from "@/components/Buscador";
import MapaViveros from "@/components/MapaViverosLazy";
import ViveroCard from "@/components/ViveroCard";
import { IconoInsignia } from "@/components/InsigniaBadge";
import { crearClientePublico } from "@/lib/supabase/publico";
import { ordenarViveros } from "@/lib/busqueda";
import { esDestacado } from "@/lib/tipos";
import type { Vivero, Insignia } from "@/lib/tipos";

export const revalidate = 3600;

export default async function Home() {
  const supabase = crearClientePublico();
  const [{ data: viverosData }, { data: insigniasData }] = await Promise.all([
    supabase
      .from("viveros")
      .select("*")
      .in("estatus", ["verificado", "pre-cargado"])
      .limit(200),
    supabase.from("insignias").select("*").neq("clave", "verificado").order("id"),
  ]);
  const viveros = ordenarViveros((viverosData ?? []) as Vivero[]);
  const insignias = (insigniasData ?? []) as Insignia[];
  const destacados = viveros.filter(esDestacado).slice(0, 6);
  const totalEstados = new Set(viveros.map((v) => v.estado)).size;

  return (
    <main className="flex-1">
      {/* Hero: buscador + mapa */}
      <section className="max-w-6xl mx-auto px-4 pt-12 lg:pt-16 pb-7 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
        <div className="animate-fade-up">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            Directorio nacional de viveros
          </p>
          <h1 className="font-heading text-[42px] lg:text-[58px] leading-[1.04] font-medium mt-4">
            Encuentra el vivero perfecto{" "}
            <span className="italic text-plum">cerca de ti</span>
          </h1>
          <p className="text-muted mt-5 text-lg leading-relaxed max-w-[460px]">
            Plantas, árboles frutales y suculentas de viveros verificados en todo
            México. Contacta directo, sin intermediarios.
          </p>
          <div className="mt-8">
            <Buscador />
          </div>
          <div className="mt-6 bg-surface-soft rounded-xl px-4.5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="font-semibold">
              {viveros.length > 0 ? `${viveros.length} viveros verificados` : "Viveros verificados"}
            </span>
            <span className="hidden sm:block w-px h-4 bg-border-soft" aria-hidden />
            <span className="text-strong">
              {totalEstados > 0
                ? `${totalEstados} ${totalEstados === 1 ? "estado" : "estados"}`
                : "Todo México"}
            </span>
            <span className="hidden sm:block w-px h-4 bg-border-soft" aria-hidden />
            <span className="text-strong">Contacto directo por WhatsApp</span>
          </div>
        </div>
        <div className="h-[380px] rounded-3xl overflow-hidden border border-border">
          <MapaViveros viveros={viveros} />
        </div>
      </section>

      {/* Categorías */}
      {insignias.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-9" aria-labelledby="titulo-categorias">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Categorías
          </p>
          <h2 id="titulo-categorias" className="font-heading text-3xl font-medium mt-2">
            Explora por especialidad
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mt-7">
            {insignias.map((i) => (
              <Link
                key={i.id}
                href={`/buscar?insignia=${i.clave}`}
                className="group flex items-center gap-3.5 p-5 bg-surface border border-border rounded-2xl transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary"
              >
                <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-primary inline-flex items-center justify-center">
                  <IconoInsignia icono={i.icono} className="w-5 h-5" />
                </span>
                <span className="font-semibold text-[15.5px]">{i.nombre}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-9" aria-labelledby="titulo-destacados">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
                Selección editorial
              </p>
              <h2 id="titulo-destacados" className="font-heading text-3xl font-medium mt-2">
                Viveros destacados
              </h2>
            </div>
            <Link
              href="/buscar"
              className="min-h-11 inline-flex items-center text-[14.5px] font-semibold text-primary hover:text-primary-dark shrink-0"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-9">
            {destacados.map((v) => (
              <ViveroCard key={v.id} vivero={v} insignias={[]} />
            ))}
          </div>
        </section>
      )}

      {/* CTA registro */}
      <section className="bg-primary mt-14">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="text-on-primary">
            <h2 className="font-heading text-3xl font-medium">¿Tienes un vivero?</h2>
            <p className="mt-2.5 text-white/80 max-w-[440px]">
              Aparece en el directorio y recibe clientes por WhatsApp. Registro
              gratuito, sin comisiones.
            </p>
          </div>
          <Link
            href="/registro"
            className="min-h-[52px] shrink-0 inline-flex items-center bg-white text-primary font-bold text-[15.5px] px-8 rounded-xl hover:bg-white/90 transition-colors"
          >
            Registra tu vivero gratis
          </Link>
        </div>
      </section>
    </main>
  );
}
