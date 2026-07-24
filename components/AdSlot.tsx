"use client";

import { useEffect, useState } from "react";
import {
  leerConsentimiento,
  alCambiarConsentimiento,
  type Consentimiento,
} from "@/lib/consentimiento";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const CLIENTE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
let scriptCargado = false;

function cargarScript() {
  if (scriptCargado || !CLIENTE) return;
  scriptCargado = true;
  const s = document.createElement("script");
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENTE}`;
  s.async = true;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

export default function AdSlot({
  slot,
  className = "",
  minAlto = 100,
}: {
  slot?: string;
  className?: string;
  minAlto?: number;
}) {
  const [consentimiento, setConsentimiento] = useState<Consentimiento>(null);

  useEffect(() => {
    setConsentimiento(leerConsentimiento());
    return alCambiarConsentimiento(setConsentimiento);
  }, []);

  const activo = !!CLIENTE && consentimiento === "aceptar";

  useEffect(() => {
    if (!activo) return;
    cargarScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // el bloqueador de anuncios no debe romper la página
    }
  }, [activo]);

  // Sin AdSense configurado no hay nada que mostrar: un hueco rotulado
  // "Publicidad" hace ver el sitio inacabado.
  if (!CLIENTE) return null;

  return (
    <div className={className} style={{ minHeight: minAlto }}>
      {activo ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: minAlto }}
          data-ad-client={CLIENTE}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          className="h-full w-full flex items-center justify-center text-xs text-muted-soft uppercase tracking-[0.06em] border border-dashed border-border-strong"
          style={{ minHeight: minAlto }}
          aria-hidden
        >
          Publicidad
        </div>
      )}
    </div>
  );
}
