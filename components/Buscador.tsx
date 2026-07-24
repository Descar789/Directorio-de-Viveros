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
      <div className="flex flex-col sm:flex-row gap-2">
        <form
          onSubmit={buscar}
          className="flex-1 bg-surface border border-border rounded-lg p-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 shadow-sm overflow-hidden"
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
            className="flex-1 min-h-11 px-3.5 bg-transparent text-[15px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="hidden sm:block w-px self-stretch bg-border" aria-hidden />
          <label className="sr-only" htmlFor="buscador-donde">
            ¿Dónde?
          </label>
          <input
            id="buscador-donde"
            type="text"
            value={donde}
            onChange={(e) => setDonde(e.target.value)}
            placeholder="Ciudad o estado"
            className="flex-1 min-w-0 min-h-11 px-3.5 bg-transparent text-[15px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 text-[14.5px] font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Buscar
          </button>
        </form>
        <button
          type="button"
          onClick={cercaDeMi}
          disabled={ubicando}
          className="shrink-0 min-h-11 inline-flex items-center justify-center gap-1.5 rounded-md border border-border text-strong text-[14.5px] font-semibold px-5 disabled:opacity-60 whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
        >
          <LocateFixed className="w-4 h-4" aria-hidden />
          {ubicando ? "Ubicando…" : "Cerca de mí"}
        </button>
      </div>
      {aviso && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {aviso}
        </p>
      )}
    </div>
  );
}
