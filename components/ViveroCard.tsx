import Link from "next/link";
import Image from "next/image";
import { Leaf, MapPin, MessageCircle, Star } from "lucide-react";
import type { Vivero, Insignia } from "@/lib/tipos";
import { esDestacado } from "@/lib/tipos";
import InsigniaBadge from "./InsigniaBadge";

export default function ViveroCard({
  vivero,
  insignias,
}: {
  vivero: Vivero;
  insignias: Insignia[];
}) {
  const destacado = esDestacado(vivero);
  return (
    <article
      className={`bg-surface rounded-2xl border ${
        destacado ? "border-accent shadow-lg" : "border-border"
      } overflow-hidden`}
    >
      <Link href={`/vivero/${vivero.slug}`} className="block">
        <div className="relative h-40 bg-background flex items-center justify-center">
          {vivero.fotos[0] ? (
            <Image
              src={vivero.fotos[0]}
              alt={vivero.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <Leaf className="w-10 h-10 text-primary/40" aria-hidden />
          )}
          {destacado && (
            <span className="absolute top-2 left-2 bg-accent text-on-primary text-xs font-semibold px-2 py-1 rounded-lg inline-flex items-center gap-1">
              <Star className="w-3 h-3" aria-hidden /> Destacado
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold">{vivero.nombre}</h3>
          <p className="text-sm text-muted inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" aria-hidden /> {vivero.municipio}, {vivero.estado}
          </p>
          {insignias.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {insignias.map((i) => (
                <InsigniaBadge key={i.id} insignia={i} />
              ))}
            </div>
          )}
        </div>
      </Link>
      {vivero.whatsapp && (
        <a
          href={`https://wa.me/${vivero.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="m-4 mt-0 min-h-11 inline-flex items-center justify-center gap-2 w-[calc(100%-2rem)] bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp
        </a>
      )}
    </article>
  );
}
