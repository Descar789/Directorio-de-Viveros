"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Loader2, ExternalLink } from "lucide-react";
import { borrarVivero } from "@/app/admin/actions";
import type { Vivero } from "@/lib/tipos";

export default function TablaViveros({ viveros }: { viveros: Vivero[] }) {
  const [filtro, setFiltro] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const visibles = viveros.filter((v) => {
    const termino = filtro.toLowerCase();
    return (
      v.nombre.toLowerCase().includes(termino) ||
      v.municipio.toLowerCase().includes(termino) ||
      v.estado.toLowerCase().includes(termino)
    );
  });

  function borrar(id: string) {
    startTransition(async () => {
      const r = await borrarVivero(id);
      if (!r.ok) setMensaje(r.error ?? "Error al borrar");
      setConfirmando(null);
    });
  }

  return (
    <div>
      <label className="sr-only" htmlFor="filtro-viveros">
        Buscar vivero
      </label>
      <input
        id="filtro-viveros"
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar por nombre, municipio o estado…"
        className="w-full sm:max-w-sm min-h-11 rounded-md border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {mensaje && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {mensaje}
        </p>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th scope="col" className="py-2 pr-4">Nombre</th>
              <th scope="col" className="py-2 pr-4">Zona</th>
              <th scope="col" className="py-2 pr-4">Estatus</th>
              <th scope="col" className="py-2 pr-4">Vistas</th>
              <th scope="col" className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium">{v.nombre}</td>
                <td className="py-3 pr-4 text-muted">
                  {v.municipio}, {v.estado}
                </td>
                <td className="py-3 pr-4 capitalize">{v.estatus}</td>
                <td className="py-3 pr-4">{v.vistas}</td>
                <td className="py-3">
                  {confirmando === v.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-destructive font-medium">¿Borrar definitivo?</span>
                      <button
                        type="button"
                        onClick={() => borrar(v.id)}
                        disabled={pendiente}
                        className="min-h-11 px-3 rounded-md bg-destructive text-on-primary font-semibold disabled:opacity-60"
                      >
                        {pendiente ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : "Sí, borrar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        className="min-h-11 px-3 rounded-md border border-border font-semibold"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Link
                        href={`/vivero/${v.slug}`}
                        aria-label={`Ver ficha de ${v.nombre}`}
                        className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-md hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmando(v.id)}
                        aria-label={`Borrar ${v.nombre}`}
                        className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-md hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibles.length === 0 && <p className="text-muted py-6 text-center">Sin resultados.</p>}
      </div>
    </div>
  );
}
