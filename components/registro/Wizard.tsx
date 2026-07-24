"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Store, Search, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { crearClienteBrowser } from "@/lib/supabase/client";
import {
  DATOS_INICIALES,
  validarPaso,
  guardarBorrador,
  cargarBorrador,
  limpiarBorrador,
  comprimirImagen,
  type DatosRegistro,
} from "@/lib/registro";
import type { Vivero } from "@/lib/tipos";
import { track } from "@/lib/analytics";
import PasoNombre from "./pasos/PasoNombre";
import PasoUbicacion from "./pasos/PasoUbicacion";
import PasoContacto from "./pasos/PasoContacto";
import PasoEspecialidades from "./pasos/PasoEspecialidades";
import PasoFotos from "./pasos/PasoFotos";
import PasoRevision from "./pasos/PasoRevision";

const TOTAL_PASOS = 6;
const TITULOS = ["", "Nombre", "Ubicación", "Contacto", "Especialidades", "Fotos", "Revisión"];

type Modo = "elegir" | "nuevo" | "reclamo";

export default function Wizard({ slugReclamo }: { slugReclamo?: string }) {
  const [modo, setModo] = useState<Modo>("elegir");
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<DatosRegistro>(DATOS_INICIALES);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Reclamo
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Vivero[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [viveroReclamado, setViveroReclamado] = useState<Vivero | null>(null);
  const [evidenciaTexto, setEvidenciaTexto] = useState("");
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | null>(null);
  const [subiendoEvidencia, setSubiendoEvidencia] = useState(false);

  const refError = useRef<HTMLParagraphElement>(null);
  const refDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaurar borrador al montar (solo flujo nuevo)
  useEffect(() => {
    if (slugReclamo) return;
    const borrador = cargarBorrador();
    if (borrador) {
      setDatos(borrador.datos);
      setPaso(borrador.paso);
      setModo("nuevo");
    }
  }, [slugReclamo]);

  // Entrada directa por ?reclamar=slug
  useEffect(() => {
    if (!slugReclamo) return;
    const supabase = crearClienteBrowser();
    supabase
      .from("viveros")
      .select("*")
      .eq("slug", slugReclamo)
      .eq("estatus", "pre-cargado")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setViveroReclamado(data as Vivero);
          setModo("reclamo");
        }
      });
  }, [slugReclamo]);

  const cambiar = useCallback((parciales: Partial<DatosRegistro>) => {
    setDatos((prev) => {
      const siguientes = { ...prev, ...parciales };
      if (refDebounce.current) clearTimeout(refDebounce.current);
      refDebounce.current = setTimeout(() => guardarBorrador(siguientes, paso), 500);
      return siguientes;
    });
  }, [paso]);

  function continuar() {
    setError(null);
    const resultado = validarPaso(paso, datos);
    if (!resultado.ok) {
      setError(resultado.error ?? "Revisa este paso.");
      setTimeout(() => refError.current?.focus(), 0);
      return;
    }
    if (resultado.datos) setDatos(resultado.datos);
    const siguiente = paso + 1;
    setPaso(siguiente);
    guardarBorrador(resultado.datos ?? datos, siguiente);
  }

  async function buscarPrecargados() {
    setBuscando(true);
    const supabase = crearClienteBrowser();
    const limpio = busqueda.replace(/[%,()]/g, " ").trim();
    const { data } = await supabase
      .from("viveros")
      .select("*")
      .eq("estatus", "pre-cargado")
      .or(`nombre.ilike.%${limpio}%,municipio.ilike.%${limpio}%`)
      .limit(10);
    setResultados((data ?? []) as Vivero[]);
    setBuscando(false);
  }

  async function subirEvidencia(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendoEvidencia(true);
    try {
      const supabase = crearClienteBrowser();
      const { data: sesion } = await supabase.auth.getUser();
      const blob = await comprimirImagen(files[0]);
      const ruta = `${sesion.user?.id ?? "anon"}/evidencia-${Date.now()}.jpg`;
      const { error: errSubida } = await supabase.storage
        .from("fotos-viveros")
        .upload(ruta, blob, { contentType: "image/jpeg" });
      if (errSubida) throw errSubida;
      const { data } = supabase.storage.from("fotos-viveros").getPublicUrl(ruta);
      setEvidenciaUrl(data.publicUrl);
    } catch {
      setError("No pudimos subir la evidencia. Intenta de nuevo.");
    } finally {
      setSubiendoEvidencia(false);
    }
  }

  async function enviar() {
    setError(null);
    setEnviando(true);
    try {
      const supabase = crearClienteBrowser();
      const { data: sesion } = await supabase.auth.getUser();
      if (!sesion.user) {
        location.href = "/entrar?next=/registro";
        return;
      }
      const { error: errInsert } = await supabase.from("solicitudes").insert({
        tipo: modo === "reclamo" ? "reclamo" : "nuevo",
        solicitante_id: sesion.user.id,
        vivero_id: modo === "reclamo" ? viveroReclamado!.id : null,
        datos: modo === "reclamo" ? {} : (datos as unknown as Record<string, unknown>),
        evidencia_url: evidenciaUrl,
        evidencia_texto: evidenciaTexto || null,
      });
      if (errInsert) throw errInsert;
      limpiarBorrador();
      track("registro_completado", { modo });
      setEnviado(true);
    } catch {
      setError("No pudimos enviar tu solicitud. Intenta de nuevo en un momento.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-16" role="status">
        <CheckCircle className="w-16 h-16 text-primary mx-auto" aria-hidden />
        <h1 className="font-heading text-2xl font-medium mt-4">
          Tu vivero está en revisión
        </h1>
        <p className="text-muted mt-2 max-w-md mx-auto">
          Te avisamos por WhatsApp en menos de 24 horas. Mientras tanto puedes seguir
          explorando el directorio.
        </p>
        <Link
          href="/"
          className="inline-flex mt-8 min-h-11 items-center bg-primary text-on-primary font-semibold px-6 rounded-md"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Pantalla inicial: nuevo vs reclamo
  if (modo === "elegir") {
    return (
      <div className="py-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary text-center">
          Regístrate gratis
        </p>
        <h1 className="font-heading text-3xl lg:text-[34px] font-medium text-center mt-2">
          Da de alta tu vivero en minutos
        </h1>
        <p className="text-muted text-center mt-2">¿Cuál es tu caso?</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => {
              track("registro_iniciado", { modo: "nuevo" });
              setModo("nuevo");
            }}
            className="bg-surface border border-border rounded-lg p-6 text-left hover:border-primary transition-colors min-h-11"
          >
            <Store className="w-8 h-8 text-primary" aria-hidden />
            <p className="font-heading font-semibold text-lg mt-3">Registrar mi vivero</p>
            <p className="text-sm text-muted mt-1">
              Mi vivero aún no aparece en el directorio.
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              track("registro_iniciado", { modo: "reclamo" });
              setModo("reclamo");
            }}
            className="bg-surface border border-border rounded-lg p-6 text-left hover:border-primary transition-colors min-h-11"
          >
            <Search className="w-8 h-8 text-primary" aria-hidden />
            <p className="font-heading font-semibold text-lg mt-3">
              Mi vivero ya aparece — reclamarlo
            </p>
            <p className="text-sm text-muted mt-1">
              Quiero administrar una ficha que ya existe.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Flujo reclamo
  if (modo === "reclamo") {
    return (
      <div className="py-8 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => {
            setModo("elegir");
            setViveroReclamado(null);
          }}
          className="min-h-11 inline-flex items-center gap-1 text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Volver
        </button>
        <h1 className="font-heading text-2xl font-medium mt-4">Reclama tu ficha</h1>

        {!viveroReclamado ? (
          <>
            <p className="text-muted mt-1">Busca tu vivero por nombre o municipio.</p>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarPrecargados()}
                placeholder="Ej. Vivero Las Palmas, Cuautla"
                aria-label="Buscar ficha de tu vivero"
                className="flex-1 min-h-11 rounded-md border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={buscarPrecargados}
                disabled={buscando}
                className="min-h-11 inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-4 rounded-md disabled:opacity-60"
              >
                {buscando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Search className="w-4 h-4" aria-hidden />}
                Buscar
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {resultados.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setViveroReclamado(v)}
                    className="w-full text-left bg-surface border border-border rounded-md px-4 py-3 hover:border-primary transition-colors"
                  >
                    <p className="font-semibold">{v.nombre}</p>
                    <p className="text-sm text-muted">
                      {v.municipio}, {v.estado}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-4">
            <div className="bg-surface border border-primary rounded-lg px-4 py-3">
              <p className="font-semibold">{viveroReclamado.nombre}</p>
              <p className="text-sm text-muted">
                {viveroReclamado.municipio}, {viveroReclamado.estado}
              </p>
            </div>
            <p className="mt-6 font-medium">
              Demuestra que es tuyo: sube una foto del local o cuéntanos algo que solo el
              dueño sabría.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => subirEvidencia(e.target.files)}
              aria-label="Foto de evidencia"
              className="mt-3 block w-full text-sm file:min-h-11 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-on-primary file:px-4 file:font-semibold"
            />
            {subiendoEvidencia && <p className="text-sm text-muted mt-1">Subiendo…</p>}
            {evidenciaUrl && <p className="text-sm text-primary mt-1">Foto subida ✓</p>}
            <textarea
              value={evidenciaTexto}
              onChange={(e) => setEvidenciaTexto(e.target.value)}
              placeholder="Ej. El local está junto a la gasolinera, atendemos desde 2010…"
              rows={3}
              aria-label="Evidencia en texto"
              className="mt-3 w-full rounded-md border border-border bg-surface px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && (
              <p ref={refError} role="alert" tabIndex={-1} className="mt-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={enviar}
              disabled={enviando || (!evidenciaUrl && !evidenciaTexto.trim())}
              className="mt-6 w-full min-h-12 inline-flex items-center justify-center gap-2 bg-accent text-on-primary font-semibold rounded-md disabled:opacity-60"
            >
              {enviando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Enviar reclamo
            </button>
          </div>
        )}
      </div>
    );
  }

  // Flujo nuevo: 6 pasos
  return (
    <div className="py-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (paso > 1 ? setPaso(paso - 1) : setModo("elegir"))}
          className="min-h-11 inline-flex items-center gap-1 text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Atrás
        </button>
        <p className="text-sm text-muted">
          Paso {paso} de {TOTAL_PASOS}: {TITULOS[paso]}
        </p>
      </div>

      <ol
        className="mt-6 flex items-center justify-center gap-2"
        aria-label={`Paso ${paso} de ${TOTAL_PASOS}: ${TITULOS[paso]}`}
      >
        {Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map((n) => (
          <li key={n} className="flex items-center gap-2" aria-current={n === paso ? "step" : undefined}>
            <span
              className={`w-[34px] h-[34px] rounded-full inline-flex items-center justify-center text-[13.5px] font-bold border transition-colors ${
                n <= paso
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-muted-soft border-border"
              }`}
            >
              {n}
            </span>
            <span
              className={`hidden lg:inline text-[13.5px] font-semibold ${
                n === paso ? "text-foreground" : "text-muted-soft"
              }`}
            >
              {TITULOS[n]}
            </span>
            {n < TOTAL_PASOS && <span className="w-4 lg:w-6 h-px bg-border" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="mt-8 bg-surface border border-border rounded-xl p-6 sm:p-9">
        {paso === 1 && <PasoNombre datos={datos} onCambio={cambiar} />}
        {paso === 2 && <PasoUbicacion datos={datos} onCambio={cambiar} />}
        {paso === 3 && <PasoContacto datos={datos} onCambio={cambiar} />}
        {paso === 4 && <PasoEspecialidades datos={datos} onCambio={cambiar} />}
        {paso === 5 && <PasoFotos datos={datos} onCambio={cambiar} />}
        {paso === 6 && <PasoRevision datos={datos} onIr={setPaso} />}

        {error && (
          <p ref={refError} role="alert" tabIndex={-1} className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={paso < TOTAL_PASOS ? continuar : enviar}
          disabled={enviando}
          className={`mt-8 w-full min-h-12 inline-flex items-center justify-center gap-2 text-on-primary font-semibold rounded-md transition-colors disabled:opacity-60 ${
            paso < TOTAL_PASOS ? "bg-primary hover:bg-primary-dark" : "bg-accent hover:opacity-90"
          }`}
        >
          {enviando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
          {paso < TOTAL_PASOS ? "Siguiente" : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
}
