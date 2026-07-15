"use client";

import { useEffect, useState } from "react";
import { crearClienteBrowser } from "@/lib/supabase/client";
import InsigniaBadge from "@/components/InsigniaBadge";
import type { Insignia } from "@/lib/tipos";
import type { DatosRegistro } from "@/lib/registro";

export default function PasoEspecialidades({
  datos,
  onCambio,
}: {
  datos: DatosRegistro;
  onCambio: (d: Partial<DatosRegistro>) => void;
}) {
  const [catalogo, setCatalogo] = useState<Insignia[]>([]);

  useEffect(() => {
    const supabase = crearClienteBrowser();
    supabase
      .from("insignias")
      .select("*")
      .neq("clave", "verificado")
      .order("id")
      .then(({ data }) => setCatalogo((data ?? []) as Insignia[]));
  }, []);

  function alternar(clave: string) {
    const activas = datos.especialidades.includes(clave)
      ? datos.especialidades.filter((c) => c !== clave)
      : [...datos.especialidades, clave];
    onCambio({ especialidades: activas });
  }

  return (
    <div>
      <h2 className="font-heading text-[21px] font-semibold">¿Qué vendes?</h2>
      <p className="text-muted mt-1">Elige todas las que apliquen.</p>
      <div className="flex flex-wrap gap-2 mt-6" role="group" aria-label="Especialidades">
        {catalogo.map((i) => {
          const activa = datos.especialidades.includes(i.clave);
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={activa}
              onClick={() => alternar(i.clave)}
              className={`min-h-11 inline-flex items-center rounded-xl px-1 transition-shadow ${
                activa ? "ring-2 ring-primary rounded-full" : "hover:opacity-80"
              }`}
            >
              <InsigniaBadge insignia={i} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
