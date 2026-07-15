"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { crearClienteBrowser } from "@/lib/supabase/client";
import { comprimirImagen } from "@/lib/registro";
import type { DatosRegistro } from "@/lib/registro";

export default function PasoFotos({
  datos,
  onCambio,
}: {
  datos: DatosRegistro;
  onCambio: (d: Partial<DatosRegistro>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subirFotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setSubiendo(true);
    const supabase = crearClienteBrowser();
    const nuevas: string[] = [];
    try {
      const { data: sesion } = await supabase.auth.getUser();
      const usuario = sesion.user?.id ?? "anon";
      for (const file of Array.from(files)) {
        const blob = await comprimirImagen(file);
        const ruta = `${usuario}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: errSubida } = await supabase.storage
          .from("fotos-viveros")
          .upload(ruta, blob, { contentType: "image/jpeg" });
        if (errSubida) throw errSubida;
        const { data } = supabase.storage.from("fotos-viveros").getPublicUrl(ruta);
        nuevas.push(data.publicUrl);
      }
      onCambio({ fotos: [...datos.fotos, ...nuevas] });
    } catch {
      setError("No pudimos subir la foto. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function quitar(url: string) {
    onCambio({ fotos: datos.fotos.filter((f) => f !== url) });
  }

  return (
    <div>
      <h2 className="font-heading text-[21px] font-semibold">Fotos de tu vivero</h2>
      <p className="text-muted mt-1">
        Al menos una. La primera será la portada de tu ficha.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
        {datos.fotos.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border">
            <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="150px" />
            <button
              type="button"
              onClick={() => quitar(url)}
              aria-label={`Quitar foto ${i + 1}`}
              className="absolute top-1 right-1 w-8 h-8 inline-flex items-center justify-center bg-surface/90 rounded-full border border-border"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="aspect-square rounded-xl border-2 border-dashed border-border inline-flex flex-col items-center justify-center gap-1 text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
        >
          {subiendo ? (
            <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="w-6 h-6" aria-hidden />
          )}
          <span className="text-xs font-medium">{subiendo ? "Subiendo…" : "Agregar"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => subirFotos(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
