import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import ViveroCard from "@/components/ViveroCard";
import AdSlot from "@/components/AdSlot";
import Buscador from "@/components/Buscador";
import MapaViveros from "@/components/MapaViverosLazy";
import { buscarViveros, viverosCerca, insigniasPorVivero } from "@/lib/busqueda";
import { crearClientePublico } from "@/lib/supabase/publico";
import type { Insignia, Vivero } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Buscar viveros",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ q?: string; insignia?: string; lat?: string; lng?: string }>;
};

export default async function PaginaBuscar({ searchParams }: Props) {
  const { q = "", insignia, lat, lng } = await searchParams;

  let viveros: Vivero[];
  let titulo: string;
  if (lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    viveros = await viverosCerca(Number(lat), Number(lng));
    titulo = "Viveros cerca de ti";
  } else {
    viveros = await buscarViveros(q, insignia);
    titulo = q ? `Resultados para “${q}”` : "Viveros verificados en México";
  }

  const supabase = crearClientePublico();
  const { data: insigniasData } = await supabase
    .from("insignias")
    .select("*")
    .neq("clave", "verificado")
    .order("id");
  const catalogo = (insigniasData ?? []) as Insignia[];
  const insigniasMapa = await insigniasPorVivero(viveros.map((v) => v.id));

  const hrefFiltro = (clave?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (clave) params.set("insignia", clave);
    return `/buscar${params.toString() ? `?${params}` : ""}`;
  };

  const centro: [number, number] | undefined =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? [Number(lat), Number(lng)]
      : viveros[0]
        ? [viveros[0].lat, viveros[0].lng]
        : undefined;

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-10 lg:py-14 w-full">
      <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
        Directorio nacional
      </p>
      <h1 className="font-heading text-3xl lg:text-4xl font-medium mt-2">{titulo}</h1>
      <div className="mt-6 max-w-2xl">
        <Buscador />
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mt-7" aria-label="Filtrar por categoría">
        <Link
          href={hrefFiltro()}
          aria-current={!insignia ? "true" : undefined}
          className={`min-h-10 inline-flex items-center rounded-md px-4 text-sm font-medium transition-colors ${
            !insignia
              ? "bg-accent-soft text-accent font-semibold"
              : "bg-surface-high text-strong hover:text-primary"
          }`}
        >
          Todas las categorías
        </Link>
        {catalogo.map((i) => {
          const activa = insignia === i.clave;
          return (
            <Link
              key={i.id}
              href={activa ? hrefFiltro() : hrefFiltro(i.clave)}
              aria-current={activa ? "true" : undefined}
              className={`min-h-10 inline-flex items-center rounded-md px-4 text-sm font-medium transition-colors ${
                activa
                  ? "bg-accent-soft text-accent font-semibold"
                  : "bg-surface-high text-strong hover:text-primary"
              }`}
            >
              {i.nombre}
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-muted mt-6">
        {viveros.length} {viveros.length === 1 ? "vivero encontrado" : "viveros encontrados"}
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-4 items-start">
        {/* Resultados */}
        <div>
          {viveros.length === 0 ? (
            <div className="text-center py-16 rounded-lg border border-dashed border-border">
              <SearchX className="w-12 h-12 text-muted-soft mx-auto" aria-hidden />
              <p className="font-heading text-xl font-semibold mt-4">Sin resultados</p>
              <p className="text-muted mt-1">Intenta con otro término o municipio.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {viveros.slice(0, 4).map((v) => (
                <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} variante="fila" />
              ))}
              {viveros.length > 4 && <AdSlot slot="buscar-intermedio" />}
              {viveros.slice(4).map((v) => (
                <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} variante="fila" />
              ))}
            </div>
          )}
        </div>

        {/* Mapa + anuncios */}
        <div className="lg:sticky lg:top-[96px] flex flex-col gap-4">
          <div className="h-[380px] rounded-lg overflow-hidden border border-border">
            <MapaViveros viveros={viveros} centro={centro} zoom={centro ? 11 : undefined} />
          </div>
          <AdSlot slot="buscar-lateral" minAlto={200} />
        </div>
      </div>
    </main>
  );
}
