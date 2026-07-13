"use client";

import { useState, useTransition } from "react";
import { Star, StarOff, Loader2, Search } from "lucide-react";
import { crearClienteBrowser } from "@/lib/supabase/client";
import { activarDestacado, quitarDestacado } from "@/app/admin/actions";
import type { Vivero } from "@/lib/tipos";

function diasRestantes(hasta: string): number {
  return Math.ceil((new Date(hasta).getTime() - Date.now()) / 86400000);
}

export default function PanelDestacados({ vigentes }: { vigentes: Vivero[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Vivero[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [hasta, setHasta] = useState(() => {
    const d = new Date(Date.now() + 30 * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [pendiente, startTransition] = useTransition();

  async function buscar() {
    setBuscando(true);
    const supabase = crearClienteBrowser();
    const limpio = busqueda.replace(/[%,()]/g, " ").trim();
    const { data } = await supabase
      .from("viveros")
      .select("*")
      .or(`nombre.ilike.%${limpio}%,municipio.ilike.%${limpio}%`)
      .limit(10);
    setResultados((data ?? []) as Vivero[]);
    setBuscando(false);
  }

  function activar(viveroId: string) {
    setMensaje(null);
    startTransition(async () => {
      const r = await activarDestacado(viveroId, hasta);
      setMensaje(
        r.ok
          ? { tipo: "ok", texto: "Destacado activado." }
          : { tipo: "error", texto: r.error ?? "Error" }
      );
    });
  }

  function quitar(viveroId: string) {
    startTransition(async () => {
      const r = await quitarDestacado(viveroId);
      if (!r.ok) setMensaje({ tipo: "error", texto: r.error ?? "Error" });
    });
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="titulo-activar">
        <h2 id="titulo-activar" className="font-heading text-xl font-semibold">
          Activar destacado
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar vivero por nombre o municipio"
            aria-label="Buscar vivero"
            className="flex-1 min-h-11 rounded-xl border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <label className="sr-only" htmlFor="fecha-hasta">
            Destacado hasta
          </label>
          <input
            id="fecha-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={buscar}
            disabled={buscando}
            className="min-h-11 inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-4 rounded-xl disabled:opacity-60"
          >
            {buscando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Search className="w-4 h-4" aria-hidden />}
            Buscar
          </button>
        </div>

        {mensaje && (
          <p role="alert" className={`mt-3 text-sm ${mensaje.tipo === "ok" ? "text-primary" : "text-destructive"}`}>
            {mensaje.texto}
          </p>
        )}

        <ul className="mt-3 space-y-2">
          {resultados.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold">{v.nombre}</p>
                <p className="text-sm text-muted">
                  {v.municipio}, {v.estado} · {v.estatus}
                </p>
              </div>
              <button
                type="button"
                onClick={() => activar(v.id)}
                disabled={pendiente}
                className="min-h-11 inline-flex items-center gap-2 bg-accent text-on-primary font-semibold px-4 rounded-xl shrink-0 disabled:opacity-60"
              >
                <Star className="w-4 h-4" aria-hidden /> Destacar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-vigentes">
        <h2 id="titulo-vigentes" className="font-heading text-xl font-semibold">
          Destacados vigentes ({vigentes.length})
        </h2>
        {vigentes.length === 0 ? (
          <p className="text-muted mt-2">Ninguno por ahora.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {vigentes.map((v) => {
              const dias = diasRestantes(v.destacado_hasta!);
              const porVencer = dias <= 3;
              return (
                <li
                  key={v.id}
                  className={`flex items-center justify-between gap-3 bg-surface border rounded-xl px-4 py-3 ${
                    porVencer ? "border-accent" : "border-border"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{v.nombre}</p>
                    <p className={`text-sm ${porVencer ? "text-accent font-semibold" : "text-muted"}`}>
                      {v.destacado_municipio} · vence en {dias} {dias === 1 ? "día" : "días"} (
                      {new Date(v.destacado_hasta!).toLocaleDateString("es-MX")})
                      {porVencer && " — cobrar renovación"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitar(v.id)}
                    disabled={pendiente}
                    aria-label={`Quitar destacado de ${v.nombre}`}
                    className="min-h-11 inline-flex items-center gap-2 border border-border font-semibold px-4 rounded-xl shrink-0 hover:border-destructive hover:text-destructive disabled:opacity-60"
                  >
                    <StarOff className="w-4 h-4" aria-hidden /> Quitar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
