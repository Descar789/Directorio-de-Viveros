"use client";

import type { DatosRegistro } from "@/lib/registro";

export default function PasoNombre({
  datos,
  onCambio,
}: {
  datos: DatosRegistro;
  onCambio: (d: Partial<DatosRegistro>) => void;
}) {
  return (
    <div>
      <h2 className="font-heading text-[21px] font-semibold">¿Cómo se llama tu vivero?</h2>
      <p className="text-muted mt-1">Así aparecerá en el directorio.</p>
      <label className="sr-only" htmlFor="nombre-vivero">
        Nombre del vivero
      </label>
      <input
        id="nombre-vivero"
        type="text"
        value={datos.nombre}
        onChange={(e) => onCambio({ nombre: e.target.value })}
        placeholder="Ej. Vivero Las Palmas"
        className="mt-6 w-full min-h-12 rounded-xl border border-border bg-surface px-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus
      />
      <div className="mt-6">
        <label htmlFor="descripcion-vivero" className="block font-medium">
          Descripción <span className="text-muted font-normal">(opcional)</span>
        </label>
        <textarea
          id="descripcion-vivero"
          value={datos.descripcion}
          onChange={(e) => onCambio({ descripcion: e.target.value })}
          placeholder="Cuéntanos qué vendes, desde cuándo, qué te hace especial…"
          rows={3}
          className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
