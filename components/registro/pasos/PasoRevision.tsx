"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import type { DatosRegistro } from "@/lib/registro";

function Fila({
  titulo,
  valor,
  paso,
  onIr,
}: {
  titulo: string;
  valor: string;
  paso: number;
  onIr: (paso: number) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm text-muted">{titulo}</p>
        <p className="font-medium">{valor || "—"}</p>
      </div>
      <button
        type="button"
        onClick={() => onIr(paso)}
        aria-label={`Editar ${titulo}`}
        className="min-h-11 min-w-11 inline-flex items-center justify-center text-primary hover:bg-primary/10 rounded-xl"
      >
        <Pencil className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}

export default function PasoRevision({
  datos,
  onIr,
  evidenciaTexto,
}: {
  datos: DatosRegistro;
  onIr: (paso: number) => void;
  evidenciaTexto?: string;
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">Revisa tu información</h2>
      <p className="text-muted mt-1">Puedes editar cualquier dato antes de enviar.</p>

      <div className="mt-6 bg-surface border border-border rounded-2xl px-4">
        <Fila titulo="Nombre" valor={datos.nombre} paso={1} onIr={onIr} />
        <Fila
          titulo="Ubicación"
          valor={`${datos.municipio}, ${datos.estado}`}
          paso={2}
          onIr={onIr}
        />
        <Fila
          titulo="Contacto"
          valor={[datos.whatsapp && `WhatsApp ${datos.whatsapp}`, datos.telefono && `Tel ${datos.telefono}`]
            .filter(Boolean)
            .join(" · ")}
          paso={3}
          onIr={onIr}
        />
        <Fila
          titulo="Especialidades"
          valor={datos.especialidades.join(", ")}
          paso={4}
          onIr={onIr}
        />
        {evidenciaTexto !== undefined && (
          <div className="py-3 border-b border-border last:border-0">
            <p className="text-sm text-muted">Evidencia de reclamo</p>
            <p className="font-medium">{evidenciaTexto || "Foto adjunta"}</p>
          </div>
        )}
      </div>

      {datos.fotos.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {datos.fotos.map((f, i) => (
            <div key={f} className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border border-border">
              <Image src={f} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="80px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
