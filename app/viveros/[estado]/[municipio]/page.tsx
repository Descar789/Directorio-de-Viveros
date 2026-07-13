import Link from "next/link";
import type { Metadata } from "next";
import ViveroCard from "@/components/ViveroCard";
import AdSlot from "@/components/AdSlot";
import MapaViveros from "@/components/MapaViverosLazy";
import { viverosPorZona, insigniasPorVivero } from "@/lib/busqueda";
import { slugAEstado, slugify, desSlug } from "@/lib/zonas";

export const revalidate = 3600;

type Props = { params: Promise<{ estado: string; municipio: string }> };

async function datosZona(estadoSlug: string, municipioSlug: string) {
  const estado = slugAEstado(estadoSlug)?.nombre ?? desSlug(estadoSlug);
  const todos = await viverosPorZona(estado);
  const viveros = todos.filter((v) => slugify(v.municipio) === municipioSlug);
  const municipio = viveros[0]?.municipio ?? desSlug(municipioSlug);
  return { estado, municipio, viveros };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { estado, municipio } = await params;
  const datos = await datosZona(estado, municipio);
  return {
    title: `Viveros en ${datos.municipio}, ${datos.estado}`,
    description: `Directorio de viveros en ${datos.municipio}, ${datos.estado}: plantas, árboles, suculentas. Teléfono, WhatsApp, horarios y ubicación de ${datos.viveros.length} viveros.`,
  };
}

export default async function PaginaMunicipio({ params }: Props) {
  const { estado: estadoSlug, municipio: municipioSlug } = await params;
  const { estado, municipio, viveros } = await datosZona(estadoSlug, municipioSlug);

  if (viveros.length === 0) {
    return (
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Aún no hay viveros en {municipio}</h1>
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
  const centro: [number, number] = [viveros[0].lat, viveros[0].lng];

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <nav className="text-sm text-muted" aria-label="Migas de pan">
        <Link href={`/viveros/${estadoSlug}`} className="hover:text-primary">
          Viveros en {estado}
        </Link>{" "}
        / {municipio}
      </nav>
      <h1 className="font-heading text-3xl font-bold mt-2">
        Viveros en {municipio}, {estado}
      </h1>
      <p className="text-muted mt-1">
        {viveros.length} {viveros.length === 1 ? "vivero encontrado" : "viveros encontrados"}
      </p>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6">
        <div className="grid sm:grid-cols-2 gap-4 content-start">
          {viveros.map((v) => (
            <ViveroCard key={v.id} vivero={v} insignias={insignias[v.id] ?? []} />
          ))}
        </div>
        <div className="h-[420px] lg:sticky lg:top-20">
          <MapaViveros viveros={viveros} centro={centro} zoom={12} />
        </div>
      </div>
      <AdSlot slot="zona-pie" className="mt-8" />
    </main>
  );
}
