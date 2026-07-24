import { Eye, MessageCircle, Navigation } from "lucide-react";
import type { Vivero } from "@/lib/tipos";

const TARJETAS = [
  { clave: "vistas" as const, etiqueta: "Vistas a tu ficha", Icono: Eye },
  { clave: "clics_whatsapp" as const, etiqueta: "Contactos por WhatsApp", Icono: MessageCircle },
  { clave: "clics_como_llegar" as const, etiqueta: "Cómo llegar", Icono: Navigation },
];

export default function Metricas({ vivero }: { vivero: Vivero }) {
  return (
    <section className="mt-8" aria-labelledby="titulo-metricas">
      <h2 id="titulo-metricas" className="font-heading text-xl font-semibold">
        Tus números
      </h2>
      <div className="grid sm:grid-cols-3 gap-4 mt-3">
        {TARJETAS.map(({ clave, etiqueta, Icono }) => (
          <div key={clave} className="bg-surface border border-border rounded-lg p-5">
            <Icono className="w-5 h-5 text-primary" aria-hidden />
            <p className="font-heading text-3xl font-medium mt-2">{vivero[clave]}</p>
            <p className="text-sm text-muted">{etiqueta}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-2">
        Estos números crecen cuando tu ficha aparece arriba — el plan Destacado ayuda.
      </p>
    </section>
  );
}
