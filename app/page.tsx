import Link from "next/link";
import { Check, Store } from "lucide-react";
import Buscador from "@/components/Buscador";
import MapaViveros from "@/components/MapaViverosLazy";
import ViveroCard from "@/components/ViveroCard";
import InsigniaBadge from "@/components/InsigniaBadge";
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

  return (
    <main className="flex-1">
      {/* Hero: buscador + mapa */}
      <section className="max-w-6xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="font-heading text-3xl lg:text-5xl font-bold leading-tight">
            Encuentra viveros <span className="text-primary">cerca de ti</span>
          </h1>
          <p className="text-muted mt-3 text-lg">
            Plantas, árboles, suculentas y más — el directorio de viveros más completo de México.
          </p>
          <div className="mt-6">
            <Buscador />
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-muted">
            {["Directorio gratuito", "Viveros verificados", "Contacto directo por WhatsApp"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="h-[420px]">
          <MapaViveros viveros={viveros} />
        </div>
      </section>

      {/* Categorías */}
      {insignias.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8" aria-labelledby="titulo-categorias">
          <h2 id="titulo-categorias" className="font-heading text-2xl font-bold">
            Explora por categoría
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {insignias.map((i) => (
              <Link
                key={i.id}
                href={`/buscar?insignia=${i.clave}`}
                className="min-h-11 inline-flex items-center rounded-xl hover:opacity-80 transition-opacity"
              >
                <InsigniaBadge insignia={i} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8" aria-labelledby="titulo-destacados">
          <h2 id="titulo-destacados" className="font-heading text-2xl font-bold">
            Viveros destacados
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {destacados.map((v) => (
              <ViveroCard key={v.id} vivero={v} insignias={[]} />
            ))}
          </div>
        </section>
      )}

      {/* CTA registro */}
      <section className="bg-primary mt-8">
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-on-primary text-center sm:text-left">
            <h2 className="font-heading text-2xl font-bold inline-flex items-center gap-2">
              <Store className="w-6 h-6" aria-hidden /> ¿Tienes un vivero?
            </h2>
            <p className="mt-1 opacity-90">
              Aparece en el directorio y recibe clientes por WhatsApp. Es gratis.
            </p>
          </div>
          <Link
            href="/registro"
            className="min-h-11 inline-flex items-center bg-accent text-on-primary font-semibold px-6 rounded-xl hover:opacity-90 transition-opacity"
          >
            Registra tu vivero gratis
          </Link>
        </div>
      </section>
    </main>
  );
}
