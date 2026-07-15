import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Star, Clock, Globe, Mail } from "lucide-react";
import GaleriaFotos from "@/components/GaleriaFotos";
import BotonContacto from "@/components/BotonContacto";
import MapaViveros from "@/components/MapaViverosLazy";
import InsigniaBadge from "@/components/InsigniaBadge";
import AdSlot from "@/components/AdSlot";
import { crearClientePublico } from "@/lib/supabase/publico";
import { esDestacado, type Vivero, type Insignia } from "@/lib/tipos";

export const revalidate = 3600;

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

type Props = { params: Promise<{ slug: string }> };

async function obtenerVivero(slug: string) {
  const supabase = crearClientePublico();
  const { data } = await supabase
    .from("viveros")
    .select("*")
    .eq("slug", slug)
    .in("estatus", ["verificado", "pre-cargado"])
    .maybeSingle();
  return data as Vivero | null;
}

export async function generateStaticParams() {
  const supabase = crearClientePublico();
  const { data } = await supabase
    .from("viveros")
    .select("slug")
    .in("estatus", ["verificado", "pre-cargado"])
    .limit(1000);
  return (data ?? []).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vivero = await obtenerVivero(slug);
  if (!vivero) return { title: "Vivero no encontrado" };
  return {
    title: `${vivero.nombre} — Vivero en ${vivero.municipio}, ${vivero.estado}`,
    description:
      vivero.descripcion ??
      `${vivero.nombre}: vivero en ${vivero.municipio}, ${vivero.estado}. Horarios, ubicación y contacto directo por WhatsApp.`,
  };
}

export default async function PaginaVivero({ params }: Props) {
  const { slug } = await params;
  const vivero = await obtenerVivero(slug);
  if (!vivero) notFound();

  const supabase = crearClientePublico();
  const { data: insigniasData } = await supabase
    .from("vivero_insignias")
    .select("insignias(*)")
    .eq("vivero_id", vivero.id);
  const insignias = (insigniasData ?? [])
    .map((f) => f.insignias as unknown as Insignia)
    .filter(Boolean);

  const destacado = esDestacado(vivero);
  const horarios = DIAS.filter((d) => vivero.horarios[d]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GardenStore",
    name: vivero.nombre,
    description: vivero.descripcion ?? undefined,
    telephone: vivero.telefono ?? undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/vivero/${vivero.slug}`,
    image: vivero.fotos.length > 0 ? vivero.fotos : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: vivero.municipio,
      addressRegion: vivero.estado,
      streetAddress: vivero.direccion ?? undefined,
      addressCountry: "MX",
    },
    geo: { "@type": "GeoCoordinates", latitude: vivero.lat, longitude: vivero.lng },
    openingHours: horarios.map((d) => `${d} ${vivero.horarios[d]}`),
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full pb-28 lg:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Migas de pan" className="mb-5 text-sm text-muted-soft">
        <Link href="/buscar" className="hover:text-primary">
          Directorio
        </Link>
        {" / "}
        <Link
          href={`/buscar?q=${encodeURIComponent(vivero.estado)}`}
          className="hover:text-primary"
        >
          {vivero.estado}
        </Link>
        {" / "}
        <span className="text-foreground font-semibold">{vivero.nombre}</span>
      </nav>

      {vivero.estatus === "pre-cargado" && (
        <div className="bg-accent-soft border border-border rounded-2xl px-4 py-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">¿Este vivero es tuyo? Reclámalo gratis y adminístralo.</p>
          <Link
            href={`/registro?reclamar=${vivero.slug}`}
            className="min-h-11 inline-flex items-center bg-primary text-on-primary font-semibold px-4 rounded-[10px] shrink-0"
          >
            Reclamar ficha
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-14">
        <div>
          <GaleriaFotos fotos={vivero.fotos} nombre={vivero.nombre} />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl lg:text-[34px] font-medium">{vivero.nombre}</h1>
            {vivero.estatus === "verificado" && (
              <span className="bg-plum-soft text-plum text-[12.5px] font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                Verificado
              </span>
            )}
            {destacado && (
              <span className="bg-surface border border-border text-[11px] font-bold uppercase tracking-[0.04em] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <Star className="w-3 h-3 text-primary" aria-hidden /> Destacado
              </span>
            )}
          </div>

          <p className="text-muted mt-2.5 inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" aria-hidden />
            {vivero.direccion ? `${vivero.direccion}, ` : ""}
            {vivero.municipio}, {vivero.estado}
          </p>

          {vivero.descripcion && (
            <section className="mt-7" aria-labelledby="titulo-descripcion">
              <h2 id="titulo-descripcion" className="sr-only">
                Acerca de este vivero
              </h2>
              <p className="whitespace-pre-line text-base leading-[1.7] text-strong">
                {vivero.descripcion}
              </p>
            </section>
          )}

          {insignias.length > 0 && (
            <section className="mt-8" aria-labelledby="titulo-servicios">
              <h2
                id="titulo-servicios"
                className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-soft"
              >
                Productos y servicios
              </h2>
              <div className="flex flex-wrap gap-2 mt-3.5">
                {insignias.map((i) => (
                  <InsigniaBadge key={i.id} insignia={i} />
                ))}
              </div>
            </section>
          )}

          {horarios.length > 0 && (
            <section className="mt-8" aria-labelledby="titulo-horarios">
              <h2
                id="titulo-horarios"
                className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-muted-soft inline-flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-primary" aria-hidden /> Horarios
              </h2>
              <table className="mt-2 w-full max-w-sm text-sm">
                <tbody>
                  {horarios.map((d) => (
                    <tr key={d} className="border-b border-border last:border-0">
                      <th scope="row" className="text-left py-2 font-medium capitalize">
                        {d}
                      </th>
                      <td className="py-2 text-muted">{vivero.horarios[d]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="mt-8" aria-label="Ubicación en mapa">
            <div className="h-64 rounded-2xl overflow-hidden border border-border">
              <MapaViveros viveros={[vivero]} centro={[vivero.lat, vivero.lng]} zoom={15} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <BotonContacto vivero={vivero} />
          {(vivero.sitio_web || vivero.email) && (
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-2 text-sm">
              {vivero.sitio_web && (
                <a href={vivero.sitio_web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 hover:text-primary">
                  <Globe className="w-4 h-4 text-primary" aria-hidden /> Sitio web
                </a>
              )}
              {vivero.email && (
                <a href={`mailto:${vivero.email}`} className="inline-flex items-center gap-2 min-h-11 hover:text-primary">
                  <Mail className="w-4 h-4 text-primary" aria-hidden /> {vivero.email}
                </a>
              )}
            </div>
          )}
          <AdSlot slot="ficha-lateral" className="hidden lg:block" minAlto={250} />
        </aside>
      </div>
    </main>
  );
}
