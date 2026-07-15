import Link from "next/link";
import Image from "next/image";
import { Leaf, MessageCircle } from "lucide-react";
import type { Vivero, Insignia } from "@/lib/tipos";
import { esDestacado } from "@/lib/tipos";
import InsigniaBadge from "./InsigniaBadge";

function FotoVivero({ vivero, sizes }: { vivero: Vivero; sizes: string }) {
  return vivero.fotos[0] ? (
    <Image
      src={vivero.fotos[0]}
      alt={vivero.nombre}
      fill
      className="object-cover"
      sizes={sizes}
    />
  ) : (
    <span className="absolute inset-0 flex items-center justify-center bg-surface-soft">
      <Leaf className="w-10 h-10 text-primary/40" aria-hidden />
    </span>
  );
}

function BotonWhatsApp({ vivero, compacto }: { vivero: Vivero; compacto?: boolean }) {
  if (!vivero.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${vivero.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp de ${vivero.nombre}`}
      className={`inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary rounded-[10px] font-semibold text-sm hover:bg-primary-dark transition-colors ${
        compacto ? "min-h-10 min-w-10" : "min-h-11 px-4"
      }`}
    >
      <MessageCircle className="w-4 h-4" aria-hidden />
      {!compacto && "WhatsApp"}
    </a>
  );
}

export default function ViveroCard({
  vivero,
  insignias,
  variante = "editorial",
}: {
  vivero: Vivero;
  insignias: Insignia[];
  variante?: "editorial" | "fila";
}) {
  const destacado = esDestacado(vivero);

  if (variante === "fila") {
    return (
      <article className="bg-surface border border-border rounded-[18px] overflow-hidden flex transition-shadow hover:shadow-[0_8px_20px_rgba(42,32,25,0.08)]">
        <Link
          href={`/vivero/${vivero.slug}`}
          className="relative w-[120px] sm:w-[140px] shrink-0"
          aria-label={vivero.nombre}
        >
          <FotoVivero vivero={vivero} sizes="140px" />
        </Link>
        <div className="p-4 sm:p-[18px] flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/vivero/${vivero.slug}`} className="min-w-0">
              <h3 className="font-heading text-[17.5px] font-semibold leading-snug">
                {vivero.nombre}
              </h3>
            </Link>
            {destacado && (
              <span
                className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"
                title="Destacado"
                aria-label="Vivero destacado"
              />
            )}
          </div>
          <p className="text-[13px] text-muted mt-1.5">
            {vivero.municipio}, {vivero.estado}
          </p>
          {insignias.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {insignias.slice(0, 2).map((i) => (
                <InsigniaBadge key={i.id} insignia={i} />
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <BotonWhatsApp vivero={vivero} compacto />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="pb-9">
      <div className="relative h-60 transition-transform duration-200 hover:-translate-y-1">
        <Link
          href={`/vivero/${vivero.slug}`}
          className="absolute inset-0 rounded-[28px] overflow-hidden"
          aria-label={vivero.nombre}
        >
          <FotoVivero vivero={vivero} sizes="(max-width: 768px) 100vw, 33vw" />
        </Link>
        {destacado && (
          <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#2a2019] text-[11px] font-bold uppercase tracking-[0.04em] px-3 py-1.5 rounded-full pointer-events-none">
            Destacado
          </span>
        )}
        <div className="absolute left-4 right-4 -bottom-7 bg-surface rounded-[18px] px-[18px] py-4 shadow-[0_14px_30px_rgba(42,32,25,0.14)]">
          <div className="flex items-start justify-between gap-2.5">
            <Link href={`/vivero/${vivero.slug}`} className="min-w-0">
              <h3 className="font-heading text-lg font-semibold leading-tight">
                {vivero.nombre}
              </h3>
            </Link>
            <BotonWhatsApp vivero={vivero} compacto />
          </div>
          <p className="text-[13px] text-muted mt-1">
            {vivero.municipio}, {vivero.estado}
          </p>
          {insignias.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {insignias.slice(0, 2).map((i) => (
                <InsigniaBadge key={i.id} insignia={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
