import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import ViveroCard from "@/components/ViveroCard";
import AdSlot from "@/components/AdSlot";
import Buscador from "@/components/Buscador";
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

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-10 lg:py-14 w-full">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
        Directorio nacional
      </p>
      <h1 className="font-heading text-3xl lg:text-4xl font-medium mt-2">{titulo}</h1>
      <div className="mt-6 max-w-2xl">
        <Buscador />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-10 mt-10 items-start">
        {/* Filtros por categoría */}
        <nav
          className="lg:sticky lg:top-[96px]"
          aria-label="Filtrar por categoría"
        >
          <p className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-soft mb-3.5">
            Categoría
          </p>
          <div className="flex flex-row flex-wrap lg:flex-col gap-1">
            <Link
              href={hrefFiltro()}
              aria-current={!insignia ? "true" : undefined}
              className={`min-h-11 inline-flex items-center px-3 rounded-[9px] text-[14.5px] transition-colors ${
                !insignia
                  ? "bg-accent-soft text-primary-dark font-semibold"
                  : "text-foreground hover:bg-surface-soft"
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
                  className={`min-h-11 inline-flex items-center px-3 rounded-[9px] text-[14.5px] transition-colors ${
                    activa
                      ? "bg-accent-soft text-primary-dark font-semibold"
                      : "text-foreground hover:bg-surface-soft"
                  }`}
                >
                  {i.nombre}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Resultados */}
        <div>
          <p className="text-sm text-muted mb-4">
            {viveros.length} {viveros.length === 1 ? "vivero encontrado" : "viveros encontrados"}
          </p>

          {viveros.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-3xl">
              <SearchX className="w-12 h-12 text-muted-soft mx-auto" aria-hidden />
              <p className="font-heading text-xl font-semibold mt-4">Sin resultados</p>
              <p className="text-muted mt-1">Intenta con otro término o municipio.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {viveros.slice(0, 4).map((v) => (
                <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} variante="fila" />
              ))}
              {viveros.length > 4 && (
                <AdSlot slot="buscar-intermedio" className="sm:col-span-2" />
              )}
              {viveros.slice(4).map((v) => (
                <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} variante="fila" />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
