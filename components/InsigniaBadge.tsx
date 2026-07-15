import {
  BadgeCheck,
  Package,
  ShoppingBag,
  Flower2,
  Apple,
  Sprout,
  Trees,
  Truck,
  Shovel,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { Insignia } from "@/lib/tipos";

const ICONOS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  package: Package,
  "shopping-bag": ShoppingBag,
  "flower-2": Flower2,
  apple: Apple,
  sprout: Sprout,
  trees: Trees,
  truck: Truck,
  shovel: Shovel,
};

export function IconoInsignia({ icono, className }: { icono: string; className?: string }) {
  const Icono = ICONOS[icono] ?? Tag;
  return <Icono className={className} aria-hidden />;
}

export default function InsigniaBadge({ insignia }: { insignia: Insignia }) {
  const Icono = ICONOS[insignia.icono] ?? Tag;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
      <Icono className="w-3.5 h-3.5" aria-hidden />
      {insignia.nombre}
    </span>
  );
}
