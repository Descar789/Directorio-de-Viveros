"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import MapaPin from "@/components/registro/MapaPinLazy";
import { ESTADOS } from "@/lib/zonas";
import type { DatosRegistro } from "@/lib/registro";

export default function PasoUbicacion({
  datos,
  onCambio,
}: {
  datos: DatosRegistro;
  onCambio: (d: Partial<DatosRegistro>) => void;
}) {
  const [aviso, setAviso] = useState<string | null>(null);

  function usarUbicacion() {
    setAviso(null);
    if (!navigator.geolocation) {
      setAviso("Tu navegador no soporta ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onCambio({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setAviso("No pudimos obtener tu ubicación — arrastra el pin."),
      { timeout: 10000 }
    );
  }

  return (
    <div>
      <h2 className="font-heading text-[21px] font-semibold">¿Dónde está tu vivero?</h2>
      <p className="text-muted mt-1">Arrastra el pin hasta la entrada de tu vivero.</p>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <div>
          <label htmlFor="estado" className="block font-medium">
            Estado
          </label>
          <select
            id="estado"
            value={datos.estado}
            onChange={(e) => onCambio({ estado: e.target.value })}
            className="mt-1 w-full min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Elige tu estado</option>
            {ESTADOS.map((e) => (
              <option key={e.slug} value={e.nombre}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="municipio" className="block font-medium">
            Municipio
          </label>
          <input
            id="municipio"
            type="text"
            value={datos.municipio}
            onChange={(e) => onCambio({ municipio: e.target.value })}
            placeholder="Ej. Cuautla"
            className="mt-1 w-full min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={usarUbicacion}
        className="mt-4 min-h-11 inline-flex items-center gap-2 text-primary font-semibold hover:underline"
      >
        <LocateFixed className="w-4 h-4" aria-hidden /> Usar mi ubicación actual
      </button>
      {aviso && (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {aviso}
        </p>
      )}

      <div className="h-72 mt-4">
        <MapaPin
          key={`${datos.lat.toFixed(4)},${datos.lng.toFixed(4)}`}
          lat={datos.lat}
          lng={datos.lng}
          onMover={(lat, lng) => onCambio({ lat, lng })}
        />
      </div>
    </div>
  );
}
