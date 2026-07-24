import { Star } from "lucide-react";
import type { Vivero } from "@/lib/tipos";
import { esDestacado } from "@/lib/tipos";

export default function EstatusBadge({ vivero }: { vivero: Pick<Vivero, "estatus" | "destacado_hasta" | "destacado_municipio" | "municipio"> }) {
  if (esDestacado(vivero)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-destacado text-destacado text-[11px] font-semibold uppercase tracking-[0.04em] px-2.5 py-1">
        <Star className="w-3 h-3 fill-current" aria-hidden /> Destacado
      </span>
    );
  }
  if (vivero.estatus === "verificado") {
    return (
      <span className="inline-flex items-center rounded-md bg-verificado-bg text-verificado-fg border border-verificado-border text-[11px] font-semibold uppercase tracking-[0.04em] px-2.5 py-1">
        Verificado
      </span>
    );
  }
  if (vivero.estatus === "pre-cargado") {
    return (
      <span className="inline-flex items-center rounded-md bg-precargado-bg text-precargado-fg border border-precargado-border text-[11px] font-semibold uppercase tracking-[0.04em] px-2.5 py-1 whitespace-nowrap">
        Pre-cargado
      </span>
    );
  }
  return null;
}
