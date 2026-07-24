import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import ViveroCard from "@/components/ViveroCard";
import AdSlot from "@/components/AdSlot";
import MapaViveros from "@/components/MapaViverosLazy";
import { viverosPorZona, insigniasPorVivero } from "@/lib/busqueda";
import { slugAEstado, slugify, desSlug } from "@/lib/zonas";

export const revalidate = 3600;

type Props = { params: Promise<{ estado: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estado } = await params;
  const nombre = slugAEstado(estado)?.nombre ?? desSlug(estado);
  const viveros = await viverosPorZona(nombre);
  return {
    title: `Viveros en ${nombre}`,
    description: `Directorio de viveros en ${nombre}: ${viveros.length} viveros con plantas, árboles y suculentas. Contacto directo por WhatsApp.`,
    // Estados sin viveros son thin content: fuera del índice hasta que tengan fichas
    robots: viveros.length === 0 ? { index: false } : undefined,
  };
}

export default async function PaginaEstado({ params }: Props) {
  const { estado: estadoSlug } = await params;
  const estado = slugAEstado(estadoSlug)?.nombre ?? desSlug(estadoSlug);
  const viveros = await viverosPorZona(estado);

  if (viveros.length === 0) {
    return (
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-3xl font-medium">Aún no hay viveros en {estado}</h1>
        <p className="text-muted mt-2">Sé el primero en aparecer aquí.</p>
        <Link
          href="/registro"
          className="inline-flex mt-6 min-h-12 items-center gap-1.5 rounded-md bg-primary text-white font-semibold px-6 hover:bg-primary-dark transition-colors"
        >
          Registra tu vivero gratis<span aria-hidden>→</span>
        </Link>
      </main>
    );
  }

  const insignias = await insigniasPorVivero(viveros.map((v) => v.id));
  const municipios = [...new Set(viveros.map((v) => v.municipio))].sort();
  const centro: [number, number] = [viveros[0].lat, viveros[0].lng];

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-10 lg:py-14 w-full">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
        Directorio nacional
      </p>
      <h1 className="font-heading text-3xl lg:text-4xl font-medium mt-2">Viveros en {estado}</h1>
      <p className="text-muted mt-2">
        {viveros.length} {viveros.length === 1 ? "vivero" : "viveros"} en {municipios.length}{" "}
        {municipios.length === 1 ? "municipio" : "municipios"}
      </p>

      <nav className="flex flex-wrap gap-2 mt-5" aria-label="Municipios">
        {municipios.map((m) => (
          <Link
            key={m}
            href={`/viveros/${estadoSlug}/${slugify(m)}`}
            className="min-h-11 inline-flex items-center gap-1.5 rounded-md bg-surface-high px-3.5 text-sm font-medium text-strong hover:text-primary transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden /> {m}
          </Link>
        ))}
      </nav>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-8">
        <div className="grid sm:grid-cols-2 gap-5 content-start">
          {viveros.map((v) => (
            <ViveroCard key={v.id} vivero={v} insignias={insignias[v.id] ?? []} variante="fila" />
          ))}
        </div>
        <div className="h-[420px] lg:sticky lg:top-24 rounded-lg overflow-hidden border border-border">
          <MapaViveros viveros={viveros} centro={centro} zoom={9} />
        </div>
      </div>
      <AdSlot slot="zona-pie" className="mt-8" />
    </main>
  );
}
