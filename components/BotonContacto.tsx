"use client";

import { useEffect, useRef } from "react";
import { MessageCircle, Phone, Navigation } from "lucide-react";
import type { Vivero } from "@/lib/tipos";

function mandarMetrica(viveroId: string, metrica: string) {
  try {
    const datos = JSON.stringify({ viveroId, metrica });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/metrica", new Blob([datos], { type: "application/json" }));
    } else {
      fetch("/api/metrica", { method: "POST", body: datos, keepalive: true });
    }
  } catch {
    // métricas nunca rompen la página
  }
}

export default function BotonContacto({ vivero }: { vivero: Vivero }) {
  const vistaEnviada = useRef(false);

  useEffect(() => {
    if (vistaEnviada.current) return;
    vistaEnviada.current = true;
    mandarMetrica(vivero.id, "vistas");
  }, [vivero.id]);

  const comoLlegar = `https://maps.google.com/?q=${vivero.lat},${vivero.lng}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-2 lg:static lg:flex-col lg:rounded-2xl lg:border lg:p-4">
      {vivero.whatsapp && (
        <a
          href={`https://wa.me/${vivero.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => mandarMetrica(vivero.id, "clics_whatsapp")}
          className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          <MessageCircle className="w-5 h-5" aria-hidden /> WhatsApp
        </a>
      )}
      {vivero.telefono && (
        <a
          href={`tel:${vivero.telefono}`}
          className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 border border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-colors"
        >
          <Phone className="w-5 h-5" aria-hidden /> Llamar
        </a>
      )}
      <a
        href={comoLlegar}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => mandarMetrica(vivero.id, "clics_como_llegar")}
        className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 border border-border rounded-xl font-semibold hover:border-primary hover:text-primary transition-colors"
      >
        <Navigation className="w-5 h-5" aria-hidden /> Cómo llegar
      </a>
    </div>
  );
}
