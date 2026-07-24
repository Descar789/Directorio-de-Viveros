import Link from "next/link";
import Image from "next/image";
import { Leaf, MessageCircle } from "lucide-react";
import type { Vivero, Insignia } from "@/lib/tipos";
import InsigniaBadge from "./InsigniaBadge";
import EstatusBadge from "./EstatusBadge";

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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-on-primary font-semibold text-sm hover:bg-primary-dark transition-colors ${
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
  if (variante === "fila") {
    return (
      <article className="bg-surface border border-border rounded-lg overflow-hidden flex shadow-sm transition-shadow hover:shadow-md">
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
              <h3 className="font-heading text-lg font-semibold leading-snug">
                {vivero.nombre}
              </h3>
            </Link>
            <EstatusBadge vivero={vivero} />
          </div>
          <p className="text-xs text-muted mt-1.5">
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
          className="absolute inset-0 rounded-lg overflow-hidden"
          aria-label={vivero.nombre}
        >
          <FotoVivero vivero={vivero} sizes="(max-width: 768px) 100vw, 33vw" />
        </Link>
        <div className="absolute top-4 left-4">
          <EstatusBadge vivero={vivero} />
        </div>
        <div className="absolute left-4 right-4 -bottom-7 bg-surface rounded-xl px-[18px] py-4 shadow-md border border-border">
          <div className="flex items-start justify-between gap-2.5">
            <Link href={`/vivero/${vivero.slug}`} className="min-w-0">
              <h3 className="font-heading text-lg font-semibold leading-tight">
                {vivero.nombre}
              </h3>
            </Link>
            <BotonWhatsApp vivero={vivero} compacto />
          </div>
          <p className="text-xs text-muted mt-1">
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
