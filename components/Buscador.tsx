"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { track } from "@/lib/analytics";

export default function Buscador() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [donde, setDonde] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [ubicando, setUbicando] = useState(false);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const termino = [q, donde].filter(Boolean).join(" ").trim();
    track("busqueda", { termino });
    router.push(termino ? `/buscar?q=${encodeURIComponent(termino)}` : "/buscar");
  }

  function cercaDeMi() {
    setAviso(null);
    if (!navigator.geolocation) {
      setAviso("Tu navegador no soporta ubicación — busca por municipio.");
      return;
    }
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicando(false);
        track("busqueda", { termino: "cerca-de-mi" });
        router.push(`/buscar?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
      },
      () => {
        setUbicando(false);
        setAviso("No pudimos obtener tu ubicación — busca por municipio.");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div>
      <form
        onSubmit={buscar}
        className="bg-surface border border-border rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-[0_1px_2px_rgba(42,32,25,0.04)]"
      >
        <label className="sr-only" htmlFor="buscador-q">
          ¿Qué buscas?
        </label>
        <input
          id="buscador-q"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué buscas? Ej. bugambilia"
          className="flex-1 min-h-12 px-3.5 bg-transparent text-[15px] focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
        />
        <div className="hidden sm:block w-px self-stretch bg-border" aria-hidden />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <label className="sr-only" htmlFor="buscador-donde">
            ¿Dónde?
          </label>
          <input
            id="buscador-donde"
            type="text"
            value={donde}
            onChange={(e) => setDonde(e.target.value)}
            placeholder="Ciudad o estado"
            className="flex-1 min-w-0 min-h-12 px-3.5 bg-transparent text-[15px] focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
          />
          <button
            type="button"
            onClick={cercaDeMi}
            disabled={ubicando}
            className="min-h-11 shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary pr-2 disabled:opacity-60 whitespace-nowrap"
          >
            <LocateFixed className="w-4 h-4" aria-hidden />
            {ubicando ? "Ubicando…" : "Cerca de mí"}
          </button>
        </div>
        <button
          type="submit"
          className="min-h-12 inline-flex items-center justify-center bg-primary text-on-primary font-semibold text-[15px] px-6 rounded-[10px] hover:bg-primary-dark transition-colors"
        >
          Buscar
        </button>
      </form>
      {aviso && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {aviso}
        </p>
      )}
    </div>
  );
}
