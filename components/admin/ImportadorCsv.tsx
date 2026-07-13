"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { parsearCsvViveros, type FilaVivero, type ErrorFila } from "@/lib/csv";
import { importarViveros } from "@/app/admin/actions";

export default function ImportadorCsv() {
  const [filas, setFilas] = useState<FilaVivero[]>([]);
  const [errores, setErrores] = useState<ErrorFila[]>([]);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erroresImport, setErroresImport] = useState<ErrorFila[]>([]);
  const [pendiente, startTransition] = useTransition();

  async function leerArchivo(files: FileList | null) {
    setResultado(null);
    setErroresImport([]);
    if (!files || files.length === 0) return;
    const texto = await files[0].text();
    const r = parsearCsvViveros(texto);
    setFilas(r.filas);
    setErrores(r.errores);
  }

  function importar() {
    startTransition(async () => {
      const r = await importarViveros(filas);
      setResultado(`${r.insertados ?? 0} viveros importados como pre-cargados.`);
      setErroresImport(r.erroresFilas ?? []);
      if (r.ok) setFilas([]);
    });
  }

  return (
    <div>
      <label
        htmlFor="archivo-csv"
        className="inline-flex min-h-11 items-center gap-2 bg-primary text-on-primary font-semibold px-4 rounded-xl cursor-pointer"
      >
        <Upload className="w-4 h-4" aria-hidden /> Elegir archivo CSV
      </label>
      <input
        id="archivo-csv"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => leerArchivo(e.target.files)}
      />
      <p className="text-sm text-muted mt-2">
        Columnas: <code>nombre,estado,municipio,lat,lng,telefono,whatsapp,direccion</code>
      </p>

      {errores.length > 0 && (
        <div role="alert" className="mt-4 bg-destructive/10 border border-destructive rounded-2xl p-4">
          <p className="font-semibold text-destructive">
            {errores.length} {errores.length === 1 ? "fila con error" : "filas con error"} (no se importarán):
          </p>
          <ul className="mt-1 text-sm space-y-0.5">
            {errores.map((e) => (
              <li key={`${e.linea}-${e.error}`}>
                Línea {e.linea}: {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {filas.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">{filas.length} filas listas para importar:</p>
          <div className="overflow-x-auto mt-2 border border-border rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th scope="col" className="py-2 px-3">Nombre</th>
                  <th scope="col" className="py-2 px-3">Zona</th>
                  <th scope="col" className="py-2 px-3">Coordenadas</th>
                  <th scope="col" className="py-2 px-3">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {filas.slice(0, 20).map((f, i) => (
                  <tr key={`${f.nombre}-${i}`} className="border-b border-border last:border-0">
                    <td className="py-2 px-3 font-medium">{f.nombre}</td>
                    <td className="py-2 px-3 text-muted">{f.municipio}, {f.estado}</td>
                    <td className="py-2 px-3 text-muted">{f.lat}, {f.lng}</td>
                    <td className="py-2 px-3 text-muted">{f.whatsapp || f.telefono || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filas.length > 20 && (
              <p className="text-xs text-muted px-3 py-2">…y {filas.length - 20} más.</p>
            )}
          </div>
          <button
            type="button"
            onClick={importar}
            disabled={pendiente}
            className="mt-4 min-h-12 inline-flex items-center gap-2 bg-accent text-on-primary font-semibold px-6 rounded-xl disabled:opacity-60"
          >
            {pendiente && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
            Importar {filas.length} viveros
          </button>
        </div>
      )}

      {resultado && (
        <p role="status" className="mt-4 inline-flex items-center gap-2 text-primary font-medium">
          <CheckCircle className="w-5 h-5" aria-hidden /> {resultado}
        </p>
      )}
      {erroresImport.length > 0 && (
        <ul role="alert" className="mt-2 text-sm text-destructive space-y-0.5">
          {erroresImport.map((e) => (
            <li key={`${e.linea}-${e.error}`}>
              Línea {e.linea}: {e.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
