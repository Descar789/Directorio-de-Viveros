import Link from "next/link";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import ViveroCard from "@/components/ViveroCard";
import AdSlot from "@/components/AdSlot";
import Buscador from "@/components/Buscador";
import InsigniaBadge from "@/components/InsigniaBadge";
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
    titulo = q ? `Resultados para “${q}”` : "Todos los viveros";
  }

  const supabase = crearClientePublico();
  const { data: insigniasData } = await supabase
    .from("insignias")
    .select("*")
    .neq("clave", "verificado")
    .order("id");
  const catalogo = (insigniasData ?? []) as Insignia[];
  const insigniasMapa = await insigniasPorVivero(viveros.map((v) => v.id));

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <h1 className="font-heading text-3xl font-bold">{titulo}</h1>
      <div className="mt-4">
        <Buscador />
      </div>

      {/* Filtros por insignia */}
      <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Filtrar por categoría">
        {catalogo.map((i) => {
          const activa = insignia === i.clave;
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (!activa) params.set("insignia", i.clave);
          const href = `/buscar${params.toString() ? `?${params}` : ""}`;
          return (
            <Link
              key={i.id}
              href={href}
              className={`min-h-11 inline-flex items-center rounded-xl px-1 ${
                activa ? "ring-2 ring-primary rounded-full" : "hover:opacity-80"
              }`}
              aria-pressed={activa}
            >
              <InsigniaBadge insignia={i} />
            </Link>
          );
        })}
      </div>

      <p className="text-muted mt-6">
        {viveros.length} {viveros.length === 1 ? "vivero encontrado" : "viveros encontrados"}
      </p>

      {viveros.length === 0 ? (
        <div className="text-center py-16">
          <SearchX className="w-12 h-12 text-muted mx-auto" aria-hidden />
          <p className="font-heading text-xl font-semibold mt-4">Sin resultados</p>
          <p className="text-muted mt-1">Intenta con otro término o municipio.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {viveros.slice(0, 4).map((v) => (
            <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} />
          ))}
          {viveros.length > 4 && (
            <AdSlot slot="buscar-intermedio" className="sm:col-span-2 lg:col-span-3" />
          )}
          {viveros.slice(4).map((v) => (
            <ViveroCard key={v.id} vivero={v} insignias={insigniasMapa[v.id] ?? []} />
          ))}
        </div>
      )}
    </main>
  );
}
