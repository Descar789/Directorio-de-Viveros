"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, X, Loader2 } from "lucide-react";
import { aprobarSolicitud, rechazarSolicitud } from "@/app/admin/actions";
import type { Solicitud } from "@/lib/tipos";
import type { DatosRegistro } from "@/lib/registro";

export default function TarjetaSolicitud({
  solicitud,
  nombreVivero,
}: {
  solicitud: Solicitud;
  nombreVivero?: string;
}) {
  const [nota, setNota] = useState("");
  const [rechazando, setRechazando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const datos = solicitud.datos as unknown as Partial<DatosRegistro>;
  const esNuevo = solicitud.tipo === "nuevo";

  function aprobar() {
    startTransition(async () => {
      const r = await aprobarSolicitud(solicitud.id);
      if (!r.ok) setMensaje(r.error ?? "Error");
    });
  }

  function rechazar() {
    startTransition(async () => {
      const r = await rechazarSolicitud(solicitud.id, nota);
      if (!r.ok) setMensaje(r.error ?? "Error");
    });
  }

  return (
    <article className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {esNuevo ? "Vivero nuevo" : "Reclamo de ficha"} ·{" "}
            {new Date(solicitud.created_at).toLocaleDateString("es-MX")}
          </p>
          <h2 className="font-heading text-lg font-semibold mt-1">
            {esNuevo ? datos.nombre : nombreVivero ?? solicitud.vivero_id}
          </h2>
          {esNuevo && (
            <p className="text-sm text-muted">
              {datos.municipio}, {datos.estado} · WhatsApp {datos.whatsapp || "—"} ·{" "}
              {(datos.especialidades ?? []).join(", ") || "sin especialidades"}
            </p>
          )}
        </div>
      </div>

      {esNuevo && (datos.fotos ?? []).length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {(datos.fotos ?? []).map((f, i) => (
            <div key={f} className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border border-border">
              <Image src={f} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="96px" />
            </div>
          ))}
        </div>
      )}

      {!esNuevo && (
        <div className="mt-3 text-sm">
          {solicitud.evidencia_texto && (
            <p>
              <span className="text-muted">Evidencia:</span> {solicitud.evidencia_texto}
            </p>
          )}
          {solicitud.evidencia_url && (
            <a
              href={solicitud.evidencia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Ver foto de evidencia
            </a>
          )}
        </div>
      )}

      {mensaje && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {mensaje}
        </p>
      )}

      {rechazando ? (
        <div className="mt-4">
          <label htmlFor={`nota-${solicitud.id}`} className="text-sm font-medium">
            Motivo del rechazo (se guarda para el solicitante)
          </label>
          <textarea
            id={`nota-${solicitud.id}`}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={rechazar}
              disabled={pendiente || !nota.trim()}
              className="min-h-11 inline-flex items-center gap-2 bg-destructive text-on-primary font-semibold px-4 rounded-md disabled:opacity-60"
            >
              {pendiente && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Confirmar rechazo
            </button>
            <button
              type="button"
              onClick={() => setRechazando(false)}
              className="min-h-11 px-4 rounded-md border border-border font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={aprobar}
            disabled={pendiente}
            className="min-h-11 inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {pendiente ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Check className="w-4 h-4" aria-hidden />
            )}
            Aprobar
          </button>
          <button
            type="button"
            onClick={() => setRechazando(true)}
            disabled={pendiente}
            className="min-h-11 inline-flex items-center gap-2 border border-destructive text-destructive font-semibold px-4 rounded-md disabled:opacity-60"
          >
            <X className="w-4 h-4" aria-hidden /> Rechazar
          </button>
        </div>
      )}
    </article>
  );
}
