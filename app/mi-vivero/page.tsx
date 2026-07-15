import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Store, Clock, Star, Pencil, Eye } from "lucide-react";
import { crearClienteServer } from "@/lib/supabase/server";
import Metricas from "@/components/panel/Metricas";
import { esDestacado, type Vivero, type Solicitud } from "@/lib/tipos";

export const metadata: Metadata = { title: "Mi vivero", robots: { index: false } };

export default async function PaginaMiVivero() {
  const supabase = await crearClienteServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/mi-vivero");

  const { data: viveroData } = await supabase
    .from("viveros")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  const vivero = viveroData as Vivero | null;

  if (!vivero) {
    const { data: solicitudData } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("solicitante_id", user.id)
      .eq("estatus", "pendiente")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const solicitud = solicitudData as Solicitud | null;

    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center w-full">
        {solicitud ? (
          <>
            <Clock className="w-14 h-14 text-accent mx-auto" aria-hidden />
            <h1 className="font-heading text-2xl font-medium mt-4">
              Tu solicitud está en revisión
            </h1>
            <p className="text-muted mt-2">
              La recibimos el{" "}
              {new Date(solicitud.created_at).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
              })}
              . Te avisamos por WhatsApp en menos de 24 horas.
            </p>
          </>
        ) : (
          <>
            <Store className="w-14 h-14 text-primary mx-auto" aria-hidden />
            <h1 className="font-heading text-2xl font-medium mt-4">
              Aún no tienes un vivero registrado
            </h1>
            <p className="text-muted mt-2">
              Registra tu vivero gratis y empieza a recibir clientes por WhatsApp.
            </p>
            <Link
              href="/registro"
              className="inline-flex mt-8 min-h-11 items-center bg-accent text-on-primary font-semibold px-6 rounded-xl"
            >
              Registra tu vivero gratis
            </Link>
          </>
        )}
      </main>
    );
  }

  const destacado = esDestacado(vivero);
  const adminWhatsapp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP;
  const textoDestacar = encodeURIComponent(
    `Quiero destacar ${vivero.nombre} en ${vivero.municipio}`
  );

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-medium">{vivero.nombre}</h1>
          <p className="text-muted">
            {vivero.municipio}, {vivero.estado} ·{" "}
            <span className="capitalize">{vivero.estatus}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/vivero/${vivero.slug}`}
            className="min-h-11 inline-flex items-center gap-2 border border-border rounded-xl px-4 font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            <Eye className="w-4 h-4" aria-hidden /> Ver mi ficha
          </Link>
          <Link
            href="/mi-vivero/editar"
            className="min-h-11 inline-flex items-center gap-2 bg-primary text-on-primary rounded-xl px-4 font-semibold hover:bg-primary-dark transition-colors"
          >
            <Pencil className="w-4 h-4" aria-hidden /> Editar
          </Link>
        </div>
      </div>

      <Metricas vivero={vivero} />

      <section className="mt-8 bg-surface border border-border rounded-2xl p-6" aria-labelledby="titulo-destacado">
        {destacado ? (
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-accent" aria-hidden />
            <div>
              <h2 id="titulo-destacado" className="font-heading text-xl font-semibold">
                Destacado hasta el{" "}
                {new Date(vivero.destacado_hasta!).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="text-muted text-sm">
                Tu vivero aparece primero en {vivero.destacado_municipio}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 id="titulo-destacado" className="font-heading text-xl font-semibold">
                Aparece primero en {vivero.municipio}
              </h2>
              <p className="text-muted text-sm mt-1">
                Los viveros destacados reciben más visitas y más contactos por WhatsApp.
              </p>
            </div>
            {adminWhatsapp && (
              <a
                href={`https://wa.me/${adminWhatsapp}?text=${textoDestacar}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 inline-flex items-center gap-2 bg-accent text-on-primary font-semibold px-5 rounded-xl shrink-0"
              >
                <Star className="w-4 h-4" aria-hidden /> Destacar mi vivero — $99/mes
              </a>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
