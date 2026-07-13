"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ImagePlus, Loader2, ArrowUp, CheckCircle } from "lucide-react";
import { crearClienteBrowser } from "@/lib/supabase/client";
import { comprimirImagen } from "@/lib/registro";
import { actualizarVivero, type CamposEditables } from "@/app/mi-vivero/editar/actions";
import MapaPin from "@/components/registro/MapaPinLazy";
import InsigniaBadge from "@/components/InsigniaBadge";
import type { Vivero, Insignia } from "@/lib/tipos";

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const claseInput =
  "mt-1 w-full min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary";

export default function FormFicha({
  vivero,
  especialidadesIniciales,
}: {
  vivero: Vivero;
  especialidadesIniciales: string[];
}) {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposEditables>({
    nombre: vivero.nombre,
    descripcion: vivero.descripcion ?? "",
    telefono: vivero.telefono ?? "",
    whatsapp: vivero.whatsapp ?? "",
    email: vivero.email ?? "",
    sitio_web: vivero.sitio_web ?? "",
    direccion: vivero.direccion ?? "",
    lat: vivero.lat,
    lng: vivero.lng,
    horarios: vivero.horarios,
    fotos: vivero.fotos,
    especialidades: especialidadesIniciales,
  });
  const [catalogo, setCatalogo] = useState<Insignia[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [guardando, startTransition] = useTransition();

  useEffect(() => {
    const supabase = crearClienteBrowser();
    supabase
      .from("insignias")
      .select("*")
      .neq("clave", "verificado")
      .order("id")
      .then(({ data }) => setCatalogo((data ?? []) as Insignia[]));
  }, []);

  function set<K extends keyof CamposEditables>(k: K, v: CamposEditables[K]) {
    setCampos((prev) => ({ ...prev, [k]: v }));
  }

  async function subirFotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    setMensaje(null);
    try {
      const supabase = crearClienteBrowser();
      const { data: sesion } = await supabase.auth.getUser();
      const nuevas: string[] = [];
      for (const file of Array.from(files)) {
        const blob = await comprimirImagen(file);
        const ruta = `${sesion.user?.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage
          .from("fotos-viveros")
          .upload(ruta, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        nuevas.push(supabase.storage.from("fotos-viveros").getPublicUrl(ruta).data.publicUrl);
      }
      set("fotos", [...campos.fotos, ...nuevas]);
    } catch {
      setMensaje({ tipo: "error", texto: "No pudimos subir la foto." });
    } finally {
      setSubiendo(false);
    }
  }

  function moverFotoAlInicio(url: string) {
    set("fotos", [url, ...campos.fotos.filter((f) => f !== url)]);
  }

  function guardar() {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await actualizarVivero(campos);
      if (resultado.ok) {
        setMensaje({ tipo: "ok", texto: "Cambios guardados. Tu ficha pública ya se actualizó." });
        router.refresh();
      } else {
        setMensaje({ tipo: "error", texto: resultado.error ?? "Error al guardar." });
      }
    });
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="sec-datos">
        <h2 id="sec-datos" className="font-heading text-xl font-semibold">Datos generales</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div className="sm:col-span-2">
            <label htmlFor="f-nombre" className="font-medium">Nombre</label>
            <input id="f-nombre" type="text" value={campos.nombre} onChange={(e) => set("nombre", e.target.value)} className={claseInput} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="f-desc" className="font-medium">Descripción</label>
            <textarea id="f-desc" rows={3} value={campos.descripcion} onChange={(e) => set("descripcion", e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="f-whatsapp" className="font-medium">WhatsApp</label>
            <input id="f-whatsapp" type="tel" value={campos.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={claseInput} />
          </div>
          <div>
            <label htmlFor="f-telefono" className="font-medium">Teléfono</label>
            <input id="f-telefono" type="tel" value={campos.telefono} onChange={(e) => set("telefono", e.target.value)} className={claseInput} />
          </div>
          <div>
            <label htmlFor="f-email" className="font-medium">Correo</label>
            <input id="f-email" type="email" value={campos.email} onChange={(e) => set("email", e.target.value)} className={claseInput} />
          </div>
          <div>
            <label htmlFor="f-web" className="font-medium">Sitio web</label>
            <input id="f-web" type="url" value={campos.sitio_web} onChange={(e) => set("sitio_web", e.target.value)} className={claseInput} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="f-direccion" className="font-medium">Dirección</label>
            <input id="f-direccion" type="text" value={campos.direccion} onChange={(e) => set("direccion", e.target.value)} className={claseInput} />
          </div>
        </div>
      </section>

      <section aria-labelledby="sec-ubicacion">
        <h2 id="sec-ubicacion" className="font-heading text-xl font-semibold">Ubicación</h2>
        <p className="text-sm text-muted mt-1">Arrastra el pin si cambió tu ubicación.</p>
        <div className="h-64 mt-3">
          <MapaPin lat={campos.lat} lng={campos.lng} onMover={(lat, lng) => setCampos((p) => ({ ...p, lat, lng }))} />
        </div>
      </section>

      <section aria-labelledby="sec-especialidades">
        <h2 id="sec-especialidades" className="font-heading text-xl font-semibold">Especialidades</h2>
        <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Especialidades">
          {catalogo.map((i) => {
            const activa = campos.especialidades.includes(i.clave);
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={activa}
                onClick={() =>
                  set(
                    "especialidades",
                    activa
                      ? campos.especialidades.filter((c) => c !== i.clave)
                      : [...campos.especialidades, i.clave]
                  )
                }
                className={`min-h-11 inline-flex items-center rounded-xl px-1 ${activa ? "ring-2 ring-primary rounded-full" : "hover:opacity-80"}`}
              >
                <InsigniaBadge insignia={i} />
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sec-fotos">
        <h2 id="sec-fotos" className="font-heading text-xl font-semibold">Fotos</h2>
        <p className="text-sm text-muted mt-1">La primera es la portada — usa la flecha para mover una foto al inicio.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
          {campos.fotos.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="120px" />
              <div className="absolute top-1 right-1 flex gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => moverFotoAlInicio(url)} aria-label={`Hacer portada la foto ${i + 1}`} className="w-8 h-8 inline-flex items-center justify-center bg-surface/90 rounded-full border border-border">
                    <ArrowUp className="w-4 h-4" aria-hidden />
                  </button>
                )}
                <button type="button" onClick={() => set("fotos", campos.fotos.filter((f) => f !== url))} aria-label={`Quitar foto ${i + 1}`} className="w-8 h-8 inline-flex items-center justify-center bg-surface/90 rounded-full border border-border">
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-border inline-flex flex-col items-center justify-center gap-1 text-muted hover:border-primary hover:text-primary cursor-pointer transition-colors">
            {subiendo ? <Loader2 className="w-6 h-6 animate-spin" aria-hidden /> : <ImagePlus className="w-6 h-6" aria-hidden />}
            <span className="text-xs font-medium">{subiendo ? "Subiendo…" : "Agregar"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => subirFotos(e.target.files)} />
          </label>
        </div>
      </section>

      <section aria-labelledby="sec-horarios">
        <h2 id="sec-horarios" className="font-heading text-xl font-semibold">Horarios</h2>
        <div className="space-y-2 mt-3 max-w-md">
          {DIAS.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <label htmlFor={`f-h-${d}`} className="w-24 capitalize text-sm">{d}</label>
              <input
                id={`f-h-${d}`}
                type="text"
                value={campos.horarios[d] ?? ""}
                onChange={(e) => set("horarios", { ...campos.horarios, [d]: e.target.value })}
                placeholder="9:00 – 18:00 (vacío = cerrado)"
                className="flex-1 min-h-11 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </section>

      {mensaje && (
        <p role="alert" className={`text-sm inline-flex items-center gap-2 ${mensaje.tipo === "ok" ? "text-primary" : "text-destructive"}`}>
          {mensaje.tipo === "ok" && <CheckCircle className="w-4 h-4" aria-hidden />}
          {mensaje.texto}
        </p>
      )}

      <button
        type="button"
        onClick={guardar}
        disabled={guardando || subiendo}
        className="w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold px-8 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {guardando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
        Guardar cambios
      </button>
    </div>
  );
}
