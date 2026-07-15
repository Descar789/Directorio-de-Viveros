"use client";

import type { DatosRegistro } from "@/lib/registro";

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export default function PasoContacto({
  datos,
  onCambio,
}: {
  datos: DatosRegistro;
  onCambio: (d: Partial<DatosRegistro>) => void;
}) {
  return (
    <div>
      <h2 className="font-heading text-[21px] font-semibold">¿Cómo te contactan los clientes?</h2>
      <p className="text-muted mt-1">Necesitamos al menos tu WhatsApp o un teléfono.</p>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <div>
          <label htmlFor="whatsapp" className="block font-medium">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            value={datos.whatsapp}
            onChange={(e) => onCambio({ whatsapp: e.target.value })}
            placeholder="735 123 4567"
            className="mt-1 w-full min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block font-medium">
            Teléfono <span className="text-muted font-normal">(opcional)</span>
          </label>
          <input
            id="telefono"
            type="tel"
            value={datos.telefono}
            onChange={(e) => onCambio({ telefono: e.target.value })}
            placeholder="735 123 4567"
            className="mt-1 w-full min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="font-medium">
          Horarios <span className="text-muted font-normal">(opcional)</span>
        </legend>
        <div className="space-y-2 mt-2">
          {DIAS.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <label htmlFor={`horario-${d}`} className="w-24 capitalize text-sm">
                {d}
              </label>
              <input
                id={`horario-${d}`}
                type="text"
                value={datos.horarios[d] ?? ""}
                onChange={(e) =>
                  onCambio({
                    horarios: { ...datos.horarios, [d]: e.target.value },
                  })
                }
                placeholder="9:00 – 18:00 (vacío = cerrado)"
                className="flex-1 min-h-11 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
