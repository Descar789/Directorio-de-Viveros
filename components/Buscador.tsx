"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LocateFixed } from "lucide-react";

export default function Buscador() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [donde, setDonde] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [ubicando, setUbicando] = useState(false);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const termino = [q, donde].filter(Boolean).join(" ").trim();
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
      <form onSubmit={buscar} className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="buscador-q">
          ¿Qué buscas?
        </label>
        <input
          id="buscador-q"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué buscas? Plantas, árboles, suculentas…"
          className="flex-1 min-h-11 rounded-xl border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <label className="sr-only" htmlFor="buscador-donde">
          ¿Dónde?
        </label>
        <input
          id="buscador-donde"
          type="text"
          value={donde}
          onChange={(e) => setDonde(e.target.value)}
          placeholder="¿Dónde? Municipio o estado"
          className="flex-1 min-h-11 rounded-xl border border-border bg-surface px-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="min-h-11 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold px-6 rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Search className="w-4 h-4" aria-hidden /> Buscar
        </button>
      </form>
      <button
        type="button"
        onClick={cercaDeMi}
        disabled={ubicando}
        className="mt-3 min-h-11 inline-flex items-center gap-2 text-primary font-semibold hover:underline disabled:opacity-60"
      >
        <LocateFixed className="w-4 h-4" aria-hidden />
        {ubicando ? "Obteniendo ubicación…" : "Ver viveros cerca de mí"}
      </button>
      {aviso && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {aviso}
        </p>
      )}
    </div>
  );
}
