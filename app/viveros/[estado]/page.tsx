import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import ViveroCard from "@/components/ViveroCard";
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
  };
}

export default async function PaginaEstado({ params }: Props) {
  const { estado: estadoSlug } = await params;
  const estado = slugAEstado(estadoSlug)?.nombre ?? desSlug(estadoSlug);
  const viveros = await viverosPorZona(estado);

  if (viveros.length === 0) {
    return (
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Aún no hay viveros en {estado}</h1>
        <p className="text-muted mt-2">Sé el primero en aparecer aquí.</p>
        <Link
          href="/registro"
          className="inline-flex mt-6 min-h-11 items-center bg-accent text-on-primary font-semibold px-6 rounded-xl"
        >
          Registra tu vivero gratis
        </Link>
      </main>
    );
  }

  const insignias = await insigniasPorVivero(viveros.map((v) => v.id));
  const municipios = [...new Set(viveros.map((v) => v.municipio))].sort();
  const centro: [number, number] = [viveros[0].lat, viveros[0].lng];

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <h1 className="font-heading text-3xl font-bold">Viveros en {estado}</h1>
      <p className="text-muted mt-1">
        {viveros.length} {viveros.length === 1 ? "vivero" : "viveros"} en {municipios.length}{" "}
        {municipios.length === 1 ? "municipio" : "municipios"}
      </p>

      <nav className="flex flex-wrap gap-2 mt-4" aria-label="Municipios">
        {municipios.map((m) => (
          <Link
            key={m}
            href={`/viveros/${estadoSlug}/${slugify(m)}`}
            className="min-h-11 inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-3 text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden /> {m}
          </Link>
        ))}
      </nav>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <div className="grid sm:grid-cols-2 gap-4 content-start">
          {viveros.map((v) => (
            <ViveroCard key={v.id} vivero={v} insignias={insignias[v.id] ?? []} />
          ))}
        </div>
        <div className="h-[420px] lg:sticky lg:top-20">
          <MapaViveros viveros={viveros} centro={centro} zoom={9} />
        </div>
      </div>
    </main>
  );
}
